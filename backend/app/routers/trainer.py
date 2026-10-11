from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User, UserRole, WorkoutPlan, PersonalChatMessage
from app.security import get_current_user, hash_password

router = APIRouter(prefix="/trainer", tags=["Trainer"])

class AddMemberSchema(BaseModel):
    full_name: str
    phone_number: str
    password: str
    category: str = "GENERAL_FITNESS"
    custom_monthly_gym_fee: float = 1000.0

class WorkoutDietSchema(BaseModel):
    category: str
    title: str
    description: str

@router.get("/dashboard")
def get_trainer_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.TRAINER:
        raise HTTPException(status_code=403, detail="Access denied. Trainer only.")

    assigned_members = db.query(User).filter(
        User.role == UserRole.MEMBER,
        User.assigned_trainer_id == current_user.id
    ).all()

    # 7-Day Inactive Members Alert Logic
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    inactive_assigned_members = []

    members_data = []
    for m in assigned_members:
        is_inactive = m.last_attended_at is None or m.last_attended_at <= one_week_ago
        
        members_data.append({
            "id": m.id,
            "name": m.full_name,
            "phone": m.phone_number,
            "category": m.category,
            "fee_paid": m.fee_paid,
            "last_attended": m.last_attended_at,
            "is_inactive": is_inactive
        })

        if is_inactive:
            inactive_assigned_members.append({
                "id": m.id,
                "name": m.full_name,
                "phone": m.phone_number,
                "last_attended": m.last_attended_at or "No Attendance Recorded"
            })

    return {
        "trainer_name": current_user.full_name,
        "salary": current_user.salary,
        "gym_owner_id": current_user.gym_owner_id,
        "total_assigned_members": len(assigned_members),
        "inactive_members_alert_count": len(inactive_assigned_members),
        "inactive_members_list": inactive_assigned_members,
        "assigned_members": members_data
    }

@router.post("/add-member")
def trainer_add_member(data: AddMemberSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.TRAINER:
        raise HTTPException(status_code=403, detail="Access denied")

    existing = db.query(User).filter(User.phone_number == data.phone_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered!")

    new_member = User(
        full_name=data.full_name,
        phone_number=data.phone_number,
        hashed_password=hash_password(data.password),
        role=UserRole.MEMBER,
        category=data.category,
        custom_monthly_gym_fee=data.custom_monthly_gym_fee,
        assigned_trainer_id=current_user.id,
        gym_owner_id=current_user.gym_owner_id,
        fee_paid=False
    )
    db.add(new_member)
    db.commit()
    return {"message": "Gym Member enrolled successfully!"}

@router.post("/create-workout")
def create_workout_diet_plan(data: WorkoutDietSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing_plan = db.query(WorkoutPlan).filter(WorkoutPlan.category == data.category).first()
    if existing_plan:
        existing_plan.title = data.title
        existing_plan.description = data.description
    else:
        new_plan = WorkoutPlan(
            category=data.category,
            title=data.title,
            description=data.description
        )
        db.add(new_plan)
    db.commit()
    return {"message": "Workout & Diet Chart updated successfully!"}