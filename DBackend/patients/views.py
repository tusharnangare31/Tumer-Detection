from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from cloudinary.uploader import upload as cloudinary_upload

from .models import Patient, MRIScan
from predictor.utils import predict_image


# =========================================================
# SEARCH PATIENT BY UID  (Technician Detection Page)
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


# =========================================================
# UPLOAD MRI + CNN PREDICTION (Existing Patient Only)
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_scan(request):
    """
    Flow:
    - frontend sends: patient_id + file (+ scan_date optional)
    - backend:
        CNN predict
        Cloudinary upload
        Save MRIScan
    """

    patient_id = request.data.get("patient_id")
    scan_date = request.data.get("scan_date")

    if not patient_id:
        return Response({"error": "patient_id required"}, status=400)

    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found"}, status=404)

    file = request.FILES.get("file")
    if not file:
        return Response({"error": "MRI file missing"}, status=400)

    # scan date
    if scan_date:
        try:
            scan_date = scan_date.replace("T", " ") + ":00"
            scan_date = timezone.datetime.fromisoformat(scan_date)
        except:
            scan_date = timezone.now()
    else:
        scan_date = timezone.now()

    # ---------------- CNN Prediction ----------------
    try:
        tumor_type, confidence = predict_image(file)
    except Exception as e:
        print("Prediction error:", e)
        return Response({"error": "Prediction failed"}, status=500)

    # reset pointer for cloudinary
    file.seek(0)

    # ---------------- Cloudinary Upload ----------------
    try:
        upload_result = cloudinary_upload(file, folder="mri_scans")
        mri_url = upload_result.get("secure_url")
    except Exception as e:
        print("Cloudinary error:", e)
        return Response({"error": "Cloudinary upload failed"}, status=500)

    # ---------------- Save Scan ----------------
    scan = MRIScan.objects.create(
        patient=patient,
        uploaded_by=request.user,
        mri_image_url=mri_url,
        tumor_type=tumor_type,
        confidence=confidence,
        status="COMPLETED",
        scan_date=scan_date,
    )

    return Response({
        "message": "MRI uploaded & predicted successfully",
        "scan_id": scan.id,
        "patient_uid": patient.patient_uid,
        "patient_name": patient.full_name,
        "mri_image_url": mri_url,
        "tumor_type": tumor_type,
        "confidence": confidence,
        "status": scan.status,
        "scan_date": scan.scan_date,
    }, status=201)


# =========================================================
# MY PATIENTS (Technician Dashboard)
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_patients(request):
    # Fetch all patients, ordered by the most recently created
    patients = Patient.objects.all().order_by('-created_at')

    # Optimization: Use a list comprehension or a Serializer for cleaner code
    data = [
        {
            "id": p.id,
            "patient_uid": p.patient_uid,
            "full_name": p.full_name,
            "age": p.age,
            "gender": p.gender,
            "phone": p.phone,
            "address": p.address,
            "created_at": p.created_at,
        }
        for p in patients
    ]

    return Response(data)


# =========================================================
# PATIENT DETAIL + MRI HISTORY
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def patient_detail(request, patient_id):
    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found"}, status=404)

    # Fetch scans for this patient, ordered by the most recent first
    # We remove the 'uploaded_by' filter here to ensure all patient history is visible
    scans = MRIScan.objects.filter(patient=patient).order_by("-scan_date", "-created_at")

    scan_list = [{
        "id": s.id,
        "tumor_type": s.tumor_type,
        "confidence": s.confidence,
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


# =========================================================
# MY SCANS (Optional Technician View)
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_scans(request):

    scans = MRIScan.objects.filter(uploaded_by=request.user).order_by("-created_at")

    data = []

    for s in scans:
        data.append({
            "id": s.id,
            "patient_uid": s.patient.patient_uid,
            "patient_name": s.patient.full_name,
            "tumor_type": s.tumor_type,
            "confidence": s.confidence,
            "status": s.status,
            "scan_date": s.scan_date,
            "mri_image_url": s.mri_image_url,
        })

    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_patient(request):

    patient_uid = request.data.get("patient_uid")
    full_name = request.data.get("full_name")
    age = request.data.get("age")
    gender = request.data.get("gender")
    phone = request.data.get("phone", "")
    address = request.data.get("address", "")

    if not patient_uid or not full_name or not age or not gender:
        return Response({"error": "Missing required fields"}, status=400)

    # Check duplicate UID
    if Patient.objects.filter(patient_uid=patient_uid).exists():
        return Response({"error": "Patient UID already exists"}, status=400)

    patient = Patient.objects.create(
        patient_uid=patient_uid,
        full_name=full_name,
        age=age,
        gender=gender,
        phone=phone,
        address=address,
    )

    return Response({
        "message": "Patient created successfully",
        "id": patient.id,
        "patient_uid": patient.patient_uid,
        "full_name": patient.full_name,
    }, status=201)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_scans(request):
    # Check if the user is a Doctor
    if request.user.profile.role != 'DOCTOR':
        return Response({"error": "Unauthorized access"}, status=403)

    # Fetch every scan in the database
    scans = MRIScan.objects.all().order_by("-created_at")
    
    data = []
    for s in scans:
        data.append({
            "id": s.id,
            "patient": {
                "full_name": s.patient.full_name,
                "patient_uid": s.patient.patient_uid
            },
            "tumor_type": s.tumor_type,
            "confidence": s.confidence,
            "status": s.status,
            "mri_image_url": s.mri_image_url,
            "scan_date": s.scan_date,
            "created_at": s.created_at,
            "uploaded_by_username": s.uploaded_by.username
        })
    return Response(data)