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
    1. Output exactly 5 lines.
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
            model="gemini-2.5-flash-lite",
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
                model="gemini-2.5-flash-lite",
                contents=prompt
            )
            return response.text.strip()
        except:
            return "**System Note:** AI reasoning currently unavailable."
        


def generate_official_report_text(tumor_type, confidence, age, gender):
    print("--- STARTING GEMINI REPORT GENERATION ---") 
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        prompt = f"""
        ROLE: Board-Certified Neuroradiologist.
        TASK: Write a formal "MRI Brain Diagnostic Report" for a PDF document.
        
        PATIENT DATA:
        - Age: {age}
        - Gender: {gender}
        - Clinical Finding: {tumor_type.upper()}
        - Confidence Score: {confidence:.2f}

        INSTRUCTIONS:
        - Write a complete clinical report.
        - Section 1: CLINICAL INDICATION (Make up a plausible reason for scan based on the finding).
        - Section 2: FINDINGS (Describe the tumor characteristics professionally).
        - Section 3: IMPRESSION (Final diagnosis summary).
        - Section 4: RECOMMENDATIONS (Standard neurosurgical/oncological protocols).
        - Tone: Formal, medical, concise.
        - Explain in deatail at least 10 paragraph
        - Format: Plain text paragraphs. No markdown stars (**).
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        
        print("--- GEMINI SUCCESS ---")
        return response.text.strip()

    except Exception as e:
        print(f"❌ GEMINI ERROR: {e}")
        return (
            "CLINICAL INDICATION: Screening for intracranial pathology.\n\n"
            f"FINDINGS: An anomaly consistent with {tumor_type} was detected with {(confidence * 100):.1f}% confidence. "
            "Further volumetric analysis is recommended.\n\n"
            "IMPRESSION: Findings suggestive of neoplastic process. "
            "Correlate with contrast-enhanced studies.\n\n"
            "RECOMMENDATION: Neurosurgical consultation advised."
        )