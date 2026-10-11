import enum
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Text, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.database import Base

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    OWNER = "OWNER"
    TRAINER = "TRAINER"
    MEMBER = "MEMBER"

class PlanType(str, enum.Enum):
    PLAN_2K = "PLAN_2K"
    PLAN_3K = "PLAN_3K"
    PLAN_4K = "PLAN_4K"

class MemberCategory(str, enum.Enum):
    BODYBUILDER = "BODYBUILDER"
    WEIGHT_LOSS = "WEIGHT_LOSS"
    FAT_LOSS = "FAT_LOSS"
    MUSCLE_GAIN = "MUSCLE_GAIN"
    GENERAL_FITNESS = "GENERAL_FITNESS"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.MEMBER)
    is_active = Column(Boolean, default=True)
    
    # Multi-tenant Gym Info & Custom Gym Member Fees set by Owner
    gym_code = Column(String, index=True, nullable=True)
    gym_name = Column(String, nullable=True)
    city = Column(String, nullable=True)
    address = Column(String, nullable=True)
    business_number = Column(String, nullable=True)
    upi_id = Column(String, nullable=True)
    custom_monthly_gym_fee = Column(Float, default=1000.0)

    # SaaS Subscription Plan for Gym Owner (2K, 3K, 4K Tiers + 2-Day Free Trial)
    plan_type = Column(Enum(PlanType), default=PlanType.PLAN_2K)
    is_trial_active = Column(Boolean, default=True)
    trial_expiry = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=2))
    plan_expiry = Column(DateTime, nullable=True)

    # Trainer Info
    salary = Column(Float, default=15000.0)
    salary_due_date = Column(DateTime, nullable=True)

    # Member Info & Attendance Tracking
    category = Column(Enum(MemberCategory), nullable=True)
    last_attended_at = Column(DateTime, default=datetime.utcnow)
    fee_due_date = Column(DateTime, nullable=True)
    fee_paid = Column(Boolean, default=True)

    # Multi-tenant Hierarchy Relationships
    assigned_trainer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    gym_owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

class CompetitionPoster(Base):
    __tablename__ = "competition_posters"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=False)
    organizer_name = Column(String, nullable=False)
    contact_phone = Column(String, nullable=False)
    event_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    gym_owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    trainer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    category = Column(Enum(MemberCategory))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PersonalChatMessage(Base):
    __tablename__ = "personal_chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)