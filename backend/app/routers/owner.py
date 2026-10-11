from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from sqlalchemy import func
import os
import uuid

from app.database import get_db
from app.models.user import User, UserRole, CompetitionPoster
from app.models.attendance import Attendance
from app.schemas.user import AddTrainerSchema, AddMemberSchema, PosterCreateSchema
from app.security import get_current_user, hash_password

router = APIRouter(prefix="/owner", tags=["Owner"])

POSTER_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "posters")
os.makedirs(POSTER_UPLOAD_DIR, exist_ok=True)

@router.get("/dashboard-kpi")
def get_owner_kpi(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Access denied")

    # Fetch Total Members & Trainers under this Owner
    members = db.query(User).filter(User.gym_owner_id == current_user.id, User.role == UserRole.MEMBER).all()
    total_members = len(members)
    total_trainers = db.query(User).filter(User.gym_owner_id == current_user.id, User.role == UserRole.TRAINER).count()
    
    # Calculate Total Gym Fee Revenue from active members
    estimated_revenue = sum([m.custom_monthly_gym_fee or 0 for m in members])

    # 1-Week Inactive Attendance Alert Members
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    inactive_members = db.query(User).filter(
        User.gym_owner_id == current_user.id,
        User.role == UserRole.MEMBER,
        User.last_attended_at <= one_week_ago
    ).all()

    # Plan Features Control
    current_plan = current_user.plan_type or "PLAN_2K"
    has_bmi_access = current_plan in ["PLAN_3K", "PLAN_4K"]
    has_progression_access = current_plan == "PLAN_4K"
    has_analytics_access = current_plan == "PLAN_4K"

    return {
        "gym_name": current_user.gym_name,
        "gym_code": current_user.gym_code,
        "upi_id": current_user.upi_id,
        "plan_type": current_plan,
        "total_members": total_members,
        "total_trainers": total_trainers,
        "estimated_monthly_revenue": estimated_revenue,
        "has_bmi_access": has_bmi_access,
        "has_progression_access": has_progression_access,
        "has_analytics_access": has_analytics_access,
        "inactive_count": len(inactive_members),
        "inactive_list": [
            {
                "id": m.id, 
                "name": m.full_name, 
                "phone": m.phone_number, 
                "last_attended": m.last_attended_at
            } for m in inactive_members
        ]
    }

@router.get("/analytics/revenue")
def get_revenue_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Access denied")
    
    current_plan = current_user.plan_type or "PLAN_2K"
    if current_plan != "PLAN_4K":
        raise HTTPException(status_code=403, detail="Revenue analytics requires PLAN_4K (Pro Enterprise)")

    # Members with fee info
    members = db.query(User).filter(
        User.gym_owner_id == current_user.id, 
        User.role == UserRole.MEMBER
    ).all()
    
    # Trainers with salary
    trainers = db.query(User).filter(
        User.gym_owner_id == current_user.id, 
        User.role == UserRole.TRAINER
    ).all()
    
    # Attendance stats for last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    attendance_count = db.query(Attendance).filter(
        Attendance.gym_owner_id == current_user.id,
        Attendance.created_at >= thirty_days_ago
    ).count()
    
    # Category breakdown
    category_stats = {}
    for m in members:
        cat = m.category.value if hasattr(m.category, 'value') else str(m.category or 'UNKNOWN')
        if cat not in category_stats:
            category_stats[cat] = {'count': 0, 'revenue': 0}
        category_stats[cat]['count'] += 1
        category_stats[cat]['revenue'] += m.custom_monthly_gym_fee or 0
    
    # Fee payment status
    paid_members = [m for m in members if m.fee_paid]
    unpaid_members = [m for m in members if not m.fee_paid]
    total_due = sum([m.custom_monthly_gym_fee or 0 for m in unpaid_members])
    
    total_members = len(members)
    
    # Revenue calculation
    estimated_revenue = sum([m.custom_monthly_gym_fee or 0 for m in members])
    
    # Trainer salary expense
    total_trainer_salary = sum([t.salary or 0 for t in trainers])
    
    # Net profit estimate
    net_profit = estimated_revenue - total_trainer_salary
    
    return {
        "total_members": total_members,
        "paid_members": len(paid_members),
        "unpaid_members": len(unpaid_members),
        "total_due_amount": total_due,
        "estimated_monthly_revenue": estimated_revenue,
        "total_trainer_salary": total_trainer_salary,
        "estimated_net_profit": net_profit,
        "attendance_30_days": attendance_count,
        "category_breakdown": category_stats,
        "trainer_count": len(trainers),
        "member_list": [
            {"name": m.full_name, "category": m.category.value if hasattr(m.category, 'value') else str(m.category), "fee": m.custom_monthly_gym_fee, "paid": m.fee_paid}
            for m in members
        ],
        "trainer_list": [
            {"name": t.full_name, "salary": t.salary} for t in trainers
        ]
    }

@router.post("/add-trainer")
def add_trainer(trainer_data: AddTrainerSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Access denied")

    existing_user = db.query(User).filter(User.phone_number == trainer_data.phone_number).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    trainer = User(
        full_name=trainer_data.full_name,
        phone_number=trainer_data.phone_number,
        hashed_password=hash_password(trainer_data.password),
        role=UserRole.TRAINER,
        salary=trainer_data.salary,
        gym_code=current_user.gym_code,
        gym_owner_id=current_user.id
    )
    db.add(trainer)
    db.commit()
    return {"message": "Trainer added successfully!"}

@router.post("/add-member")
def add_member(member_data: AddMemberSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Access denied")

    existing_user = db.query(User).filter(User.phone_number == member_data.phone_number).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    member = User(
        full_name=member_data.full_name,
        phone_number=member_data.phone_number,
        hashed_password=hash_password(member_data.password),
        role=UserRole.MEMBER,
        category=member_data.category,
        custom_monthly_gym_fee=member_data.custom_monthly_gym_fee,
        assigned_trainer_id=member_data.assigned_trainer_id,
        gym_code=current_user.gym_code,
        gym_owner_id=current_user.id
    )
    db.add(member)
    db.commit()
    return {"message": "Member added successfully!"}

@router.get("/posters")
def get_posters(db: Session = Depends(get_db)):
    return db.query(CompetitionPoster).all()

@router.post("/add-poster")
async def create_poster(
    title: str = Form(...),
    description: str = Form(None),
    organizer_name: str = Form(...),
    contact_phone: str = Form(...),
    event_date: str = Form(None),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Validate file type
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    ext = os.path.splitext(image.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        ext = ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(POSTER_UPLOAD_DIR, filename)
    
    # Save file
    content = await image.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Store relative URL
    image_url = f"/static/posters/{filename}"
    
    poster = CompetitionPoster(
        owner_id=current_user.id,
        title=title,
        image_url=image_url,
        description=description,
        organizer_name=organizer_name,
        contact_phone=contact_phone,
        event_date=event_date,
    )
    db.add(poster)
    db.commit()
    return {"message": "Competition Poster published successfully!", "image_url": image_url}