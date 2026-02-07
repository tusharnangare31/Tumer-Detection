from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import predict_image

from django.http import JsonResponse
from .utils import predict_image
from .services import generate_clinical_reasoning

@csrf_exempt
def predict(request):
    if request.method == "POST":
        file = request.FILES.get("file")
        age = request.POST.get("age", "Unknown")
        gender = request.POST.get("gender", "Unknown")

        try:
            # 1. CNN Model Detection
            label, confidence = predict_image(file)

            # 2. Gemini Clinical Interpretation
            reasoning = generate_clinical_reasoning(label, confidence, age, gender)

            return JsonResponse({
                "prediction": label,
                "confidence": confidence,
                "clinical_reasoning": reasoning
            })
        except Exception as e:
            return JsonResponse({"error": "Analysis failed"}, status=500)