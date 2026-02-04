from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import predict_image

@csrf_exempt
def predict(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST method allowed"}, status=405)

    if "file" not in request.FILES:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    file = request.FILES["file"]

    try:
        label, confidence = predict_image(file)
        return JsonResponse({
            "prediction": label,
            "confidence": confidence
        })
    except Exception as e:
        print("Prediction error:", e)
        return JsonResponse({"error": "Prediction failed"}, status=500)
