from django.contrib import admin
from .models import Patient, MRIScan, DoctorReview, Report

admin.site.register(Patient)
admin.site.register(MRIScan)
admin.site.register(DoctorReview)
admin.site.register(Report)
