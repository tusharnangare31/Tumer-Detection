import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import predict_image
from .services import generate_clinical_reasoning

logger = logging.getLogger(__name__)


@csrf_exempt
def predict(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST method is allowed"}, status=405)

    # Accept both 'image' (from public Upload page) and 'file' (from Detection page)
    file = request.FILES.get("image") or request.FILES.get("file")
    if not file:
        return JsonResponse({"error": "No image file provided. Use 'image' or 'file' field."}, status=400)

    age = request.POST.get("age", "Unknown")
    gender = request.POST.get("gender", "Unknown")

    try:
        # 1. CNN Model Detection
        logger.info("Running CNN prediction...")
        label, confidence = predict_image(file)
        logger.info(f"CNN Result: {label} (confidence: {confidence})")

        # 2. Gemini Clinical Interpretation
        logger.info("Generating clinical reasoning via Gemini...")
        reasoning = generate_clinical_reasoning(label, confidence, age, gender)

        return JsonResponse({
            "prediction": label,
            "confidence": confidence,
            "clinical_reasoning": reasoning
        })
    except Exception as e:
        logger.exception("Prediction failed")
        return JsonResponse({"error": "Analysis failed", "detail": str(e)}, status=500)