from django.urls import path
from . import views

urlpatterns = [
    path("upload-scan/", views.upload_scan),
    path("my-patients/", views.my_patients),
    path("patient/<int:patient_id>/", views.patient_detail),
    path("my-scans/", views.my_scans), # For Technicians (their own scans)
    path("scans/", views.all_scans),   # ADD THIS: For Doctors (all scans)
    path("by-uid/<str:uid>/", views.get_patient_by_uid),
    path("create/", views.create_patient),
    path("doctor-registry/", views.doctor_registry, name="doctor_registry"),
]