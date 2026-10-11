from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User, UserRole, WorkoutPlan, CompetitionPoster, PersonalChatMessage
from app.models.attendance import Attendance, WeightLog
from app.models.feedback import Feedback
from app.security import get_current_user

router = APIRouter(prefix="/member", tags=["Member"])

class FeedbackSchema(BaseModel):
    rating: int
    comment: str

class ChatMessageSchema(BaseModel):
    receiver_id: int
    message: str

class WeightLogSchema(BaseModel):
    weight_kg: float
    notes: str = ""

@router.get("/dashboard")
def get_member_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.MEMBER:
        raise HTTPException(status_code=403, detail="Access denied")

    owner = db.query(User).filter(User.id == current_user.gym_owner_id).first()
    workout = db.query(WorkoutPlan).filter(WorkoutPlan.category == current_user.category).first()
    posters = db.query(CompetitionPoster).all()

    # Plan features
    current_plan = owner.plan_type if owner else "PLAN_2K"
    has_bmi_access = current_plan in ["PLAN_3K", "PLAN_4K"]
    has_progression_access = current_plan == "PLAN_4K"

    return {
        "member": {
            "name": current_user.full_name,
            "phone": current_user.phone_number,
            "category": current_user.category,
            "fee_amount": current_user.custom_monthly_gym_fee,
            "fee_paid": current_user.fee_paid,
            "last_attended": current_user.last_attended_at
        },
        "gym_info": {
            "gym_name": owner.gym_name if owner else "GymSoft Partner",
            "upi_id": owner.upi_id if owner else "N/A",
            "has_bmi_access": has_bmi_access,
            "has_progression_access": has_progression_access
        },
        "workout_plan": workout,
        "competition_posters": posters
    }

@router.post("/mark-attendance")
def mark_attendance(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.last_attended_at = datetime.utcnow()
    att = Attendance(user_id=current_user.id, gym_owner_id=current_user.gym_owner_id)
    db.add(att)
    db.commit()
    return {"message": "Attendance marked successfully!"}

@router.post("/submit-feedback")
def submit_feedback(
    data: FeedbackSchema, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    feedback = Feedback(
        member_id=current_user.id,
        gym_owner_id=current_user.gym_owner_id,
        rating=data.rating,
        comment=data.comment
    )
    db.add(feedback)
    db.commit()
    return {"message": "Feedback submitted successfully!"}

@router.post("/send-message")
def send_chat_message(
    data: ChatMessageSchema, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    msg = PersonalChatMessage(
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        message=data.message
    )
    db.add(msg)
    db.commit()
    return {"message": "Message sent successfully!"}

@router.get("/messages/{other_user_id}")
def get_chat_history(
    other_user_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    messages = db.query(PersonalChatMessage).filter(
        ((PersonalChatMessage.sender_id == current_user.id) & (PersonalChatMessage.receiver_id == other_user_id)) |
        ((PersonalChatMessage.sender_id == other_user_id) & (PersonalChatMessage.receiver_id == current_user.id))
    ).order_by(PersonalChatMessage.created_at.asc()).all()
    return messages

@router.post("/weight-log")
def log_weight(
    data: WeightLogSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    owner = db.query(User).filter(User.id == current_user.gym_owner_id).first()
    current_plan = owner.plan_type if owner else "PLAN_2K"
    if current_plan != "PLAN_4K":
        raise HTTPException(status_code=403, detail="Weight tracking requires PLAN_4K (Pro Enterprise)")
    
    weight_log = WeightLog(
        user_id=current_user.id,
        gym_owner_id=current_user.gym_owner_id,
        weight_kg=data.weight_kg,
        notes=data.notes
    )
    db.add(weight_log)
    db.commit()
    db.refresh(weight_log)
    return {"message": "Weight logged successfully!", "weight_log": {"id": weight_log.id, "weight_kg": weight_log.weight_kg, "notes": weight_log.notes, "created_at": weight_log.created_at}}

@router.get("/weight-history")
def get_weight_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    owner = db.query(User).filter(User.id == current_user.gym_owner_id).first()
    current_plan = owner.plan_type if owner else "PLAN_2K"
    if current_plan != "PLAN_4K":
        raise HTTPException(status_code=403, detail="Weight history requires PLAN_4K (Pro Enterprise)")
    
    logs = db.query(WeightLog).filter(
        WeightLog.user_id == current_user.id
    ).order_by(WeightLog.created_at.asc()).all()
    
    return [{"id": log.id, "weight_kg": log.weight_kg, "notes": log.notes, "created_at": log.created_at} for log in logs]