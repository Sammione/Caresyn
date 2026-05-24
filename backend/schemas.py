from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: str
    is_urgent: bool = False

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    patient_id: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}

class AssessmentBase(BaseModel):
    symptoms_reported: str
    risk_level: str
    detected_risks: str
    recommendations: str

class AssessmentCreate(AssessmentBase):
    pass

class Assessment(AssessmentBase):
    id: int
    patient_id: int
    created_at: datetime

    model_config = {"from_attributes": True}

class PatientBase(BaseModel):
    name: str
    age: int
    gestational_age_weeks: int
    is_first_pregnancy: bool = True
    medical_history: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    created_at: datetime
    assessments: List[Assessment] = []
    tasks: List[Task] = []

    model_config = {"from_attributes": True}

class AgentInput(BaseModel):
    patient_id: int
    symptoms: str
