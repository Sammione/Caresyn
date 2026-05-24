import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

load_dotenv()

SUPPORTED_LANGUAGES = {
    "English": "English",
    "Hausa": "Hausa",
    "Yoruba": "Yoruba",
    "Igbo": "Igbo",
    "Pidgin": "Nigerian Pidgin English",
    "Swahili": "Swahili",
    "French": "French",
}

# We expect a JSON output from the model
class AgentOutput(BaseModel):
    risk_level: str = Field(description="Low, Medium, or High")
    detected_risks: str = Field(description="Comma separated list of detected risks (e.g., Preeclampsia, Gestational Diabetes)")
    recommendations: str = Field(description="Actionable recommendations for the nurse/coordinator (always in English)")
    draft_sms: str = Field(description="Draft SMS reminder/follow-up to send to the patient. Must be written in the patient's preferred language as instructed.")
    suggested_task: str = Field(description="A suggested follow up task for the coordinator (always in English)")
    is_urgent: bool = Field(description="Whether this case requires immediate escalation")

def analyze_patient_symptoms(patient_data: dict, symptoms: str) -> dict:
    api_key = os.getenv("OPENAI_API_KEY")
    preferred_language = patient_data.get("preferred_language", "English")
    language_label = SUPPORTED_LANGUAGES.get(preferred_language, "English")

    if not api_key:
        # Fallback simulated response for local dev without an API key
        print("WARNING: No OPENAI_API_KEY found, using simulated response.")
        is_high_risk = "swelling" in symptoms.lower() or "headache" in symptoms.lower()
        sms_map = {
            "Hausa": "Don Allah, je asibiti yanzu don duba lafiyarki." if is_high_risk else "Tuna alƙawarin lafiyarki na gaba.",
            "Yoruba": "Jọwọ lọ si ile-iwosan lẹsẹkẹsẹ fun ayẹwo." if is_high_risk else "Ranti ipinnu ìlera rẹ to mbọ.",
            "Igbo": "Biko gaa ụlọ ọgwụ ozugbo maka nlele." if is_high_risk else "Cheta nkwenye ahụike ọzọ gị.",
            "Pidgin": "Abeg go hospital now now make dem check you." if is_high_risk else "No forget your next clinic appointment o.",
            "Swahili": "Tafadhali nenda hospitalini mara moja kwa uchunguzi." if is_high_risk else "Kumbuka miadi yako inayokuja ya afya.",
            "French": "Veuillez consulter un médecin immédiatement." if is_high_risk else "N'oubliez pas votre prochain rendez-vous prénatal.",
        }
        draft_sms = sms_map.get(preferred_language, "Please visit the clinic immediately for a checkup." if is_high_risk else "Remember your next appointment.")
        return {
            "risk_level": "High" if is_high_risk else "Low",
            "detected_risks": "Preeclampsia Risk" if is_high_risk else "None",
            "recommendations": "Immediate blood pressure check and urine test." if is_high_risk else "Routine follow up.",
            "draft_sms": draft_sms,
            "suggested_task": "Schedule urgent doctor visit" if is_high_risk else "Regular checkup",
            "is_urgent": is_high_risk
        }

    llm = ChatOpenAI(model="gpt-4o-mini", api_key=api_key, temperature=0)
    parser = JsonOutputParser(pydantic_object=AgentOutput)

    prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are an expert Maternal Care Coordination AI. "
            "You analyze patient profiles and reported symptoms to detect high-risk cases (e.g., preeclampsia, gestational diabetes). "
            "IMPORTANT: The 'recommendations' and 'suggested_task' fields must always be written in English for the clinical team. "
            "However, the 'draft_sms' field MUST be written entirely in {language} — this SMS is sent directly to the patient. "
            "Make the SMS warm, clear, and appropriate for the urgency level. "
            "You must output strictly in JSON according to the schema."
        )),
        ("user", "Patient Profile: {profile}\n\nReported Symptoms: {symptoms}\n\nPatient Preferred Language for SMS: {language}\n\n{format_instructions}")
    ])

    chain = prompt | llm | parser

    profile_str = (
        f"Age: {patient_data.get('age')}, "
        f"Gestational Age: {patient_data.get('gestational_age_weeks')} weeks, "
        f"First Pregnancy: {patient_data.get('is_first_pregnancy')}, "
        f"History: {patient_data.get('medical_history')}, "
        f"Preferred Language: {language_label}"
    )

    try:
        response = chain.invoke({
            "profile": profile_str,
            "symptoms": symptoms,
            "language": language_label,
            "format_instructions": parser.get_format_instructions()
        })
        return response
    except Exception as e:
        print(f"Error calling LLM: {e}")
        return {
            "risk_level": "Unknown",
            "detected_risks": "Error processing",
            "recommendations": "Manual review required",
            "draft_sms": "Please contact the clinic.",
            "suggested_task": "Review patient file manually",
            "is_urgent": True
        }
