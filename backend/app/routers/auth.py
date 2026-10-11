from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User, UserRole
from app.security import hash_password, verify_password, create_access_token, get_current_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])


def build_auth_response(user: User) -> dict:
    role_val = user.role.value if hasattr(user.role, 'value') else str(user.role)
    access_token = create_access_token(data={"sub": str(user.id), "role": role_val})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": role_val,
        "full_name": user.full_name,
        "user_id": user.id,
    }


class LoginSchema(BaseModel):
    phone_number: str
    password: str

class RegisterSchema(BaseModel):
    full_name: str
    phone_number: str
    password: str
    role: str = "OWNER"
    gym_name: str = None
    city: str = None
    address: str = None
    upi_id: str = Field(default=None, alias="gpay_upi_id")  # Accepts both upi_id and gpay_upi_id safely
    plan_type: str = "PLAN_2K"

    class Config:
        populate_by_name = True

class PasswordChangeSchema(BaseModel):
    old_password: str
    new_password: str

@router.post("/register")
def register(user_data: RegisterSchema, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.phone_number == user_data.phone_number).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    gym_code = None
    is_trial_active = False
    trial_expiry = None

    # Convert incoming string role to UserRole Enum safely
    try:
        user_role_enum = UserRole(user_data.role.upper())
    except ValueError:
        user_role_enum = UserRole.OWNER

    if user_role_enum == UserRole.OWNER:
        import uuid
        gym_code = f"GYM-{uuid.uuid4().hex[:6].upper()}"
        is_trial_active = True
        trial_expiry = datetime.utcnow() + timedelta(days=settings.TRIAL_DAYS)

    new_user = User(
        full_name=user_data.full_name,
        phone_number=user_data.phone_number,
        hashed_password=hash_password(user_data.password),
        role=user_role_enum,
        gym_name=user_data.gym_name,
        city=user_data.city,
        address=user_data.address,
        upi_id=user_data.upi_id,
        plan_type=user_data.plan_type,
        gym_code=gym_code,
        is_trial_active=is_trial_active,
        trial_expiry=trial_expiry
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return build_auth_response(new_user)

@router.post("/login")
def login(form_data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == form_data.phone_number).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid phone number or password")
    
    return build_auth_response(user)

@router.post("/change-password")
def change_password(
    data: PasswordChangeSchema, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password incorrect!")
    
    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully!"}