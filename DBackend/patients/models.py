from django.db import models
from django.contrib.auth.models import User


class Patient(models.Model):
    patient_uid = models.CharField(max_length=30, unique=True)  # Unique patient ID
    full_name = models.CharField(max_length=150)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=10)  # Male/Female/Other
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    # ✅ Patient profile photo URL (Cloudinary)
    profile_photo_url = models.URLField(max_length=500, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient_uid} - {self.full_name}"


class MRIScan(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("COMPLETED", "Completed"),
        ("VERIFIED", "Verified"),
    )

    TUMOR_CHOICES = (
        ("glioma", "Glioma"),
        ("meningioma", "Meningioma"),
        ("pituitary", "Pituitary"),
        ("notumor", "No Tumor"),
    )

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="scans")

    # Technician uploads scan (relation with USER)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="uploaded_scans")

    # ✅ MRI scan stored in Cloudinary (link only)
    mri_image_url = models.URLField(max_length=500, blank=True, null=True)

    tumor_type = models.CharField(max_length=20, choices=TUMOR_CHOICES)
    confidence = models.FloatField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    scan_date = models.DateTimeField()  # scan performed date/time
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Scan {self.id} - {self.patient.patient_uid} - {self.tumor_type}"


class DoctorReview(models.Model):
    scan = models.ForeignKey(MRIScan, on_delete=models.CASCADE, related_name="doctor_reviews")

    # Doctor user relation
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="doctor_reviews")

    comments = models.TextField(blank=True, null=True)
    final_diagnosis = models.CharField(max_length=200, blank=True, null=True)
    verified = models.BooleanField(default=False)
    reviewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"DoctorReview Scan {self.scan.id} by {self.doctor.username}"


class Report(models.Model):
    scan = models.OneToOneField(MRIScan, on_delete=models.CASCADE, related_name="report")

    # ✅ Report file stored in Cloudinary (or any cloud drive)
    report_pdf_url = models.URLField(max_length=500, blank=True, null=True)

    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report for Scan {self.scan.id}"
