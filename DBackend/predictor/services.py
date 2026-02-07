from google import genai
from google.genai import types
from django.conf import settings


def generate_clinical_reasoning(tumor_type, confidence, age, gender):
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = f"""
ROLE: Medical Treatment Database.
    TASK: List only the standard pharmaceutical and physical treatments for {tumor_type}.

    PATIENT CONTEXT: {age}-year-old {gender} (Finding: {tumor_type})

    STRICT OUTPUT RULES:
    1. Output exactly 8 lines.
    2. Format: * [Category]: [Drug/Treatment Name] - [Brief Action]
    3. you can give respose it subpoint if same Category like Category :/n 1. 2.

    4. Do NOT provide an introduction, conclusion, or diagnosis.
    5. Focus on: Chemotherapy, Corticosteroids, Anticonvulsants, and Surgery.

    EXAMPLE OUTPUT:
    * Chemotherapy: Temozolomide - Systemic alkylating agent.
    * Steroids: Dexamethasone - Reduces cerebral edema.
    * Surgery: Craniotomy - Tumor resection.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=5000
            )
        )
        return response.text.strip()

    except Exception as e:
        error_msg = str(e)

        # ⏳ Handle quota exhaustion gracefully
        if "RESOURCE_EXHAUSTED" in error_msg or "429" in error_msg:
            return (
                "**System Note:** AI reasoning temporarily unavailable due to "
                "usage limits. Please retry after a short interval."
            )

        # 🔁 Optional fallback model
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            return response.text.strip()
        except:
            return "**System Note:** AI reasoning currently unavailable."