from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.security import get_current_user

router = APIRouter(prefix="/super-admin", tags=["Super Admin"])

@router.get("/dashboard")
def get_super_admin_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    total_gyms = db.query(User).filter(User.role == UserRole.OWNER).count()
    total_users = db.query(User).count()
    
    owners = db.query(User).filter(User.role == UserRole.OWNER).all()
    gym_owners_list = []
    for o in owners:
        gym_owners_list.append({
            "id": o.id,
            "name": o.full_name,
            "gym_name": o.gym_name or "N/A",
            "phone": o.phone_number,
            "plan": o.plan_type or "PLAN_2K",
            "trial_active": o.is_trial_active
        })
    
    return {
        "total_platform_users": total_users,
        "total_gym_owners": total_gyms,
        "gym_owners_list": gym_owners_list,
        "platform_status": "All SaaS nodes operating live successfully!"
    }