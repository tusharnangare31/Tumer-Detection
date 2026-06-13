from django.contrib import admin
from .models import Patient, MRIScan, DoctorReview, Report


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('patient_uid', 'full_name', 'age', 'gender', 'created_at')
    search_fields = ('patient_uid', 'full_name', 'phone')
    list_filter = ('gender', 'created_at')
    ordering = ('-created_at',)


@admin.register(MRIScan)
class MRIScanAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'tumor_type', 'confidence', 'status', 'scan_date', 'uploaded_by')
    search_fields = ('patient__patient_uid', 'patient__full_name', 'tumor_type')
    list_filter = ('tumor_type', 'status', 'scan_date')
    ordering = ('-created_at',)


@admin.register(DoctorReview)
class DoctorReviewAdmin(admin.ModelAdmin):
    list_display = ('scan', 'doctor', 'final_diagnosis', 'verified', 'reviewed_at')
    list_filter = ('verified', 'reviewed_at')
    ordering = ('-reviewed_at',)


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('scan', 'generated_at')
    ordering = ('-generated_at',)
