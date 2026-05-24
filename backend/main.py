import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from dotenv import load_dotenv

import models, schemas
from database import engine, get_db
from agent import analyze_patient_symptoms

load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CareSyn API", version="1.0.0")

# Allow Vercel frontend in production, all origins in local dev
FRONTEND_URL = os.getenv("FRONTEND_URL", "*")
origins = [FRONTEND_URL] if FRONTEND_URL != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to CareSyn API"}

@app.post("/patients/", response_model=schemas.Patient)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = models.Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@app.get("/patients/", response_model=List[schemas.Patient])
def get_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    patients = db.query(models.Patient).offset(skip).limit(limit).all()
    return patients

@app.post("/agent/analyze", response_model=schemas.Assessment)
def run_agent_analysis(input_data: schemas.AgentInput, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == input_data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # 1. AI Analysis
    patient_data = {
        "age": patient.age,
        "gestational_age_weeks": patient.gestational_age_weeks,
        "is_first_pregnancy": patient.is_first_pregnancy,
        "medical_history": patient.medical_history
    }
    
    analysis_result = analyze_patient_symptoms(patient_data, input_data.symptoms)
    
    # 2. Store Assessment
    assessment = models.Assessment(
        patient_id=patient.id,
        symptoms_reported=input_data.symptoms,
        risk_level=analysis_result["risk_level"],
        detected_risks=analysis_result["detected_risks"],
        recommendations=analysis_result["recommendations"]
    )
    db.add(assessment)
    
    # 3. Create Follow-up Task based on AI recommendation
    task = models.Task(
        patient_id=patient.id,
        title=analysis_result["suggested_task"],
        description=f"Generated from symptoms: {input_data.symptoms}\n\nDraft SMS: {analysis_result['draft_sms']}",
        is_urgent=analysis_result["is_urgent"]
    )
    db.add(task)
    
    db.commit()
    db.refresh(assessment)
    
    return assessment

@app.get("/tasks/", response_model=List[schemas.Task])
def get_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tasks = db.query(models.Task).order_by(models.Task.is_urgent.desc()).offset(skip).limit(limit).all()
    return tasks
