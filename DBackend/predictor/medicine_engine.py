def suggest_medicine(tumor, patient):
    age = patient["age"]
    allergies = patient["allergies"]
    creatinine = patient["creatinine"]

    recommendations = []

    if tumor == "glioma":
        if "temozolomide" not in allergies:
            dose = "75 mg/m²"
            if creatinine > 2.0:
                dose = "Dose reduction required"
            recommendations.append({
                "medicine": "Temozolomide",
                "dose": dose,
                "reason": "Standard first-line therapy for glioma"
            })

    elif tumor == "meningioma":
        recommendations.append({
            "medicine": "Dexamethasone",
            "dose": "4–8 mg/day",
            "reason": "Reduces cerebral edema"
        })

    elif tumor == "pituitary":
        recommendations.append({
            "medicine": "Cabergoline",
            "dose": "0.25 mg twice weekly",
            "reason": "Common treatment for pituitary adenoma"
        })

    return recommendations
