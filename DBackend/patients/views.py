import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count
from django.http import HttpResponse
from django.template.loader import get_template

from xhtml2pdf import pisa

from cloudinary.uploader import upload as cloudinary_upload

from .models import Patient, MRIScan, DoctorReview
from predictor.utils import predict_image

# ✅ CRITICAL IMPORT: This connects your View to the Gemini Service
from predictor.services import generate_clinical_reasoning 
from predictor.services import generate_official_report_text

logger = logging.getLogger(__name__)


# =========================================================
# UPLOAD MRI + CNN + GEMINI (The "Bridge")
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_scan(request):
    logger.info("Starting Upload Process")

    patient_id = request.data.get("patient_id")
    scan_date_str = request.data.get("scan_date")

    if not patient_id:
        return Response({"error": "patient_id required"}, status=400)

    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found"}, status=404)

    file = request.FILES.get("file")
    if not file:
        return Response({"error": "MRI file missing"}, status=400)

    # Date Handling
    if scan_date_str:
        try:
            formatted_date = scan_date_str.replace("T", " ")
            if len(formatted_date) == 16: formatted_date += ":00"
            scan_date = timezone.datetime.fromisoformat(formatted_date)
        except (ValueError, TypeError):
            scan_date = timezone.now()
    else:
        scan_date = timezone.now()

    # 1. CNN PREDICTION
    try:
        logger.info("Calling CNN Model...")
        tumor_type, confidence = predict_image(file)
        logger.info(f"CNN Result: {tumor_type} ({confidence})")
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return Response({"error": "CNN Prediction failed"}, status=500)

    # 2. GEMINI CLINICAL REASONING
    logger.info("Calling Gemini AI Service...")
    try:
        clinical_reasoning = generate_clinical_reasoning(
            tumor_type=tumor_type,
            confidence=confidence,
            age=patient.age,
            gender=patient.gender
        )
        logger.info(f"Gemini Response Received! Length of reasoning: {len(clinical_reasoning)} chars")
    except Exception as e:
        logger.error(f"Gemini Failed: {e}")
        clinical_reasoning = "Clinical reasoning unavailable."

    # Reset file pointer for Cloudinary
    file.seek(0)

    # 3. CLOUDINARY UPLOAD
    try:
        logger.info("Uploading to Cloudinary...")
        upload_result = cloudinary_upload(file, folder="mri_scans")
        mri_url = upload_result.get("secure_url")
    except Exception as e:
        logger.error(f"Cloudinary error: {e}")
        return Response({"error": "Cloudinary upload failed"}, status=500)

    # 4. SAVE TO DATABASE
    logger.info("Saving to Database...")
    scan = MRIScan.objects.create(
        patient=patient,
        uploaded_by=request.user,
        mri_image_url=mri_url,
        tumor_type=tumor_type,
        confidence=confidence,
        clinical_reasoning=clinical_reasoning,
        status="COMPLETED",
        scan_date=scan_date,
    )

    return Response({
        "message": "Analysis Complete",
        "scan_id": scan.id,
        "patient_uid": patient.patient_uid,
        "patient_name": patient.full_name,
        "mri_image_url": mri_url,
        "tumor_type": tumor_type,
        "confidence": confidence,
        "clinical_reasoning": clinical_reasoning,
        "status": scan.status,
        "scan_date": scan.scan_date,
    }, status=201)


# =========================================================
# OTHER VIEWS
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_patient_by_uid(request, uid):
    try:
        patient = Patient.objects.get(patient_uid=uid)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found"}, status=404)
    return Response({
        "id": patient.id,
        "patient_uid": patient.patient_uid,
        "full_name": patient.full_name,
        "age": patient.age,
        "gender": patient.gender,
        "phone": patient.phone,
        "address": patient.address,
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def patient_detail(request, patient_id):
    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found"}, status=404)

    scans = MRIScan.objects.filter(patient=patient).order_by("-scan_date", "-created_at")

    scan_list = []
    for s in scans:
        review = s.doctor_reviews.first()
        review_data = {
            "comments": review.comments,
            "final_diagnosis": review.final_diagnosis,
            "verified": review.verified,
            "doctor_username": review.doctor.username,
            "reviewed_at": review.reviewed_at
        } if review else None

        scan_list.append({
            "id": s.id,
            "tumor_type": s.tumor_type,
            "confidence": s.confidence,
            "clinical_reasoning": s.clinical_reasoning,
            "status": s.status,
            "scan_date": s.scan_date,
            "mri_image_url": s.mri_image_url,
            "created_at": s.created_at,
            "doctor_review": review_data
        })

    return Response({
        "patient": {
            "id": patient.id,
            "patient_uid": patient.patient_uid,
            "full_name": patient.full_name,
            "age": patient.age,
            "gender": patient.gender,
            "phone": patient.phone,
            "address": patient.address,
        },
        "scans": scan_list
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_scans(request):
    scans = MRIScan.objects.all().order_by("-created_at")
    data = []
    for s in scans:
        review = s.doctor_reviews.first()
        review_data = {
            "comments": review.comments,
            "final_diagnosis": review.final_diagnosis,
            "verified": review.verified,
            "doctor_username": review.doctor.username,
            "reviewed_at": review.reviewed_at
        } if review else None

        data.append({
            "id": s.id,
            "patient": {"full_name": s.patient.full_name, "patient_uid": s.patient.patient_uid},
            "tumor_type": s.tumor_type,
            "confidence": s.confidence,
            "clinical_reasoning": s.clinical_reasoning,
            "status": s.status,
            "mri_image_url": s.mri_image_url,
            "scan_date": s.scan_date,
            "created_at": s.created_at,
            "uploaded_by_username": s.uploaded_by.username,
            "doctor_review": review_data
        })
    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_patients(request):
    # Get patients that this technician has uploaded scans for
    patient_ids = MRIScan.objects.filter(
        uploaded_by=request.user
    ).values_list('patient_id', flat=True).distinct()
    patients = Patient.objects.filter(id__in=patient_ids).order_by('-created_at')
    data = [{
        "id": p.id,
        "patient_uid": p.patient_uid,
        "full_name": p.full_name,
        "age": p.age,
        "gender": p.gender,
        "phone": p.phone,
        "address": p.address,
        "created_at": p.created_at,
    } for p in patients]
    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_scans(request):
    scans = MRIScan.objects.filter(uploaded_by=request.user).order_by("-created_at")
    data = []
    for s in scans:
        review = s.doctor_reviews.first()
        review_data = {
            "comments": review.comments,
            "final_diagnosis": review.final_diagnosis,
            "verified": review.verified,
            "doctor_username": review.doctor.username,
            "reviewed_at": review.reviewed_at
        } if review else None

        data.append({
            "id": s.id,
            "patient_uid": s.patient.patient_uid,
            "patient_name": s.patient.full_name,
            "tumor_type": s.tumor_type,
            "confidence": s.confidence,
            "clinical_reasoning": s.clinical_reasoning,
            "status": s.status,
            "scan_date": s.scan_date,
            "mri_image_url": s.mri_image_url,
            "doctor_review": review_data
        })
    return Response(data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_patient(request):
    patient_uid = request.data.get("patient_uid")
    full_name = request.data.get("full_name")
    age = request.data.get("age")
    gender = request.data.get("gender")
    if not patient_uid or not full_name or not age or not gender:
        return Response({"error": "Missing required fields"}, status=400)
    if Patient.objects.filter(patient_uid=patient_uid).exists():
        return Response({"error": "Patient UID already exists"}, status=400)
    patient = Patient.objects.create(
        patient_uid=patient_uid, full_name=full_name, age=age, gender=gender,
        phone=request.data.get("phone", ""), address=request.data.get("address", "")
    )
    
    # After creating the patient, handle profile photo if provided
    profile_photo = request.FILES.get("profile_photo")
    if profile_photo:
        try:
            upload_result = cloudinary_upload(profile_photo, folder="patient_photos")
            patient.profile_photo_url = upload_result.get("secure_url")
            patient.save()
        except Exception as e:
            logger.warning(f"Profile photo upload failed: {e}")

    return Response({"message": "Patient created successfully", "id": patient.id}, status=201)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def doctor_registry(request):
    try:
        profile = getattr(request.user, 'profile', None)
        if not profile or profile.role.upper() != 'DOCTOR':
            return Response({"error": "Physician access required"}, status=403)
        patients = Patient.objects.annotate(activity_count=Count('scans')).order_by('-created_at')
        data = [{
            "id": p.id, "uid": p.patient_uid, "name": p.full_name, "age": p.age, "sex": p.gender,
            "activity": p.activity_count, "joined": p.created_at.strftime("%Y.%m.%d") if p.created_at else "N/A",
        } for p in patients]
        return Response(data, status=200)
    except Exception as e:
        return Response({"error": "Internal Server Error", "details": str(e)}, status=500)
    

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def generate_report_pdf(request, scan_id):
    try:
        scan = MRIScan.objects.get(id=scan_id)
        
        # 1. GENERATE FRESH CONTENT
        # We ignore the database 'clinical_reasoning' and generate a new, official report.
        logger.info(f"Generating fresh official report for Scan #{scan.id}...")
        
        official_report_text = generate_official_report_text(
            scan.tumor_type, 
            scan.confidence, 
            scan.patient.age, 
            scan.patient.gender
        )

        # 2. PREPARE CONTEXT
        # We pass 'generated_text' to the template
        context = {
            "scan": scan,
            "confidence_percent": round(scan.confidence * 100, 2),
            "generated_text": official_report_text, # <--- The new formal text
            "date": timezone.now(),
            "doctor_review": scan.doctor_reviews.first()
        }
        
        # 3. RENDER PDF
        # This path works because we created patients/templates/patients/report.html
        template_path = 'patients/report.html' 
        template = get_template(template_path)
        html = template.render(context)

        response = HttpResponse(content_type='application/pdf')
        filename = f"Official_Report_{scan.patient.patient_uid}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        pisa_status = pisa.CreatePDF(html, dest=response)

        if pisa_status.err:
            return HttpResponse("PDF generation error", status=500)
            
        return response

    except MRIScan.DoesNotExist:
        return HttpResponse("Scan not found", status=404)
    except Exception as e:
        logger.error(f"PDF Error: {e}")
        return HttpResponse(f"Server Error: {str(e)}", status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_review(request, scan_id):
    try:
        profile = getattr(request.user, 'profile', None)
        if not profile or profile.role.upper() != 'DOCTOR':
            return Response({"error": "Physician access required"}, status=403)
        
        try:
            scan = MRIScan.objects.get(id=scan_id)
        except MRIScan.DoesNotExist:
            return Response({"error": "Scan not found"}, status=404)
        
        comments = request.data.get("comments", "")
        final_diagnosis = request.data.get("final_diagnosis", scan.tumor_type)
        verified = request.data.get("verified", False)
        
        # Create or update review
        review, created = DoctorReview.objects.update_or_create(
            scan=scan,
            defaults={
                "doctor": request.user,
                "comments": comments,
                "final_diagnosis": final_diagnosis,
                "verified": verified
            }
        )
        
        # Update scan status
        if verified:
            scan.status = "VERIFIED"
        else:
            scan.status = "COMPLETED"
        scan.save()
        
        return Response({
            "message": "Review submitted successfully",
            "review": {
                "comments": review.comments,
                "final_diagnosis": review.final_diagnosis,
                "verified": review.verified,
                "doctor_username": request.user.username,
                "reviewed_at": review.reviewed_at
            },
            "scan_status": scan.status
        }, status=200)
    except Exception as e:
        logger.exception("Failed to submit review")
        return Response({"error": "Failed to submit review", "detail": str(e)}, status=500)