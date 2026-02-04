import os
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model_fixed.h5")

CLASS_LABELS = ['glioma', 'meningioma', 'notumor', 'pituitary']

_model = None  # cache model in memory


def get_model():
    global _model
    if _model is None:
        print(f"Loading model from {MODEL_PATH}")
        _model = load_model(MODEL_PATH)
        print("Model loaded successfully")
    return _model


def predict_image(file):
    """
    Takes Django uploaded file and returns:
    tumor_type, confidence
    """
    model = get_model()

    img = Image.open(file).convert("RGB")
    img = img.resize((128, 128))
    img_array = np.array(img).astype("float32") / 255.0
    img_array = img_array.reshape(1, 128, 128, 3)

    preds = model.predict(img_array)
    class_idx = int(np.argmax(preds))
    confidence = float(np.max(preds))
    label = CLASS_LABELS[class_idx]

    return label, round(confidence, 4)
