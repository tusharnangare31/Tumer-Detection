from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count

from cloudinary.uploader import upload as cloudinary_upload

from .models import Patient, MRIScan
from predictor.utils import predict_image

# ✅ CRITICAL IMPORT: This connects your View to the Gemini Service
from predictor.services import generate_clinical_reasoning 


# =========================================================
# UPLOAD MRI + CNN + GEMINI (The "Bridge")
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_scan(request):
    print("--- DEBUG: Starting Upload Process ---") # Debug Log 1

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
        except:
            scan_date = timezone.now()
    else:
        scan_date = timezone.now()

    # 1. CNN PREDICTION
    try:
        print("--- DEBUG: Calling CNN Model... ---")
        tumor_type, confidence = predict_image(file)
        print(f"--- DEBUG: CNN Result: {tumor_type} ({confidence}) ---")
    except Exception as e:
        print("Prediction error:", e)
        return Response({"error": "CNN Prediction failed"}, status=500)

    # 2. GEMINI CLINICAL REASONING
    print("--- DEBUG: Calling Gemini AI Service... ---") # Debug Log 2
    try:
        clinical_reasoning = generate_clinical_reasoning(
            tumor_type=tumor_type,
            confidence=confidence,
            age=patient.age,
            gender=patient.gender
        )
        print("--- DEBUG: Gemini Response Received! ---")
        print(f"--- DEBUG: Length of reasoning: {len(clinical_reasoning)} chars ---")
    except Exception as e:
        print(f"--- DEBUG: Gemini Failed: {e} ---")
        clinical_reasoning = "Clinical reasoning unavailable."

    # Reset file pointer for Cloudinary
    file.seek(0)

    # 3. CLOUDINARY UPLOAD
    try:
        print("--- DEBUG: Uploading to Cloudinary... ---")
        upload_result = cloudinary_upload(file, folder="mri_scans")
        mri_url = upload_result.get("secure_url")
    except Exception as e:
        print("Cloudinary error:", e)
        return Response({"error": "Cloudinary upload failed"}, status=500)

    # 4. SAVE TO DATABASE
    print("--- DEBUG: Saving to Database... ---")
    scan = MRIScan.objects.create(
        patient=patient,
        uploaded_by=request.user,
        mri_image_url=mri_url,
        tumor_type=tumor_type,
        confidence=confidence,
        clinical_reasoning=clinical_reasoning, # ✅ Saving reasoning
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
        "clinical_reasoning": clinical_reasoning, # ✅ Sending to Frontend
        "status": scan.status,
        "scan_date": scan.scan_date,
    }, status=201)


# =========================================================
# OTHER VIEWS (Keep as is)
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

    scan_list = [{
        "id": s.id,
        "tumor_type": s.tumor_type,
        "confidence": s.confidence,
        "clinical_reasoning": s.clinical_reasoning, # ✅ Make sure this is here
        "status": s.status,
        "scan_date": s.scan_date,
        "mri_image_url": s.mri_image_url,
        "created_at": s.created_at,
    } for s in scans]

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
        data.append({
            "id": s.id,
            "patient": {"full_name": s.patient.full_name, "patient_uid": s.patient.patient_uid},
            "tumor_type": s.tumor_type,
            "confidence": s.confidence,
            "clinical_reasoning": s.clinical_reasoning, # ✅ Make sure this is here
            "status": s.status,
            "mri_image_url": s.mri_image_url,
            "scan_date": s.scan_date,
            "created_at": s.created_at,
            "uploaded_by_username": s.uploaded_by.username
        })
    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_patients(request):
    patients = Patient.objects.all().order_by('-created_at')
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
    data = [{
        "id": s.id,
        "patient_uid": s.patient.patient_uid,
        "patient_name": s.patient.full_name,
        "tumor_type": s.tumor_type,
        "confidence": s.confidence,
        "clinical_reasoning": s.clinical_reasoning,
        "status": s.status,
        "scan_date": s.scan_date,
        "mri_image_url": s.mri_image_url,
    } for s in scans]
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