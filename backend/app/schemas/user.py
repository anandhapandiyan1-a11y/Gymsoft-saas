from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, PlanType, MemberCategory

# --- Auth Schemas ---
class UserRegister(BaseModel):
    full_name: str
    phone_number: str
    password: str
    role: UserRole = UserRole.MEMBER
    
    # Gym Details (Owner Register)
    gym_name: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    upi_id: Optional[str] = None
    plan_type: Optional[PlanType] = PlanType.PLAN_2K

class UserLogin(BaseModel):
    phone_number: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str

# --- Owner Schemas ---
class AddTrainerSchema(BaseModel):
    full_name: str
    phone_number: str
    password: str
    salary: float = 15000.0

class AddMemberSchema(BaseModel):
    full_name: str
    phone_number: str
    password: str
    category: MemberCategory = MemberCategory.GENERAL_FITNESS
    custom_monthly_gym_fee: float = 1000.0
    assigned_trainer_id: Optional[int] = None

# --- Workout & Competition Schemas ---
class WorkoutCreateSchema(BaseModel):
    category: MemberCategory
    title: str
    description: str

class PosterCreateSchema(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: str
    organizer_name: str
    contact_phone: str
    event_date: Optional[str] = None