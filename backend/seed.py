from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.security import hash_password

# Recreate tables fresh
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# 1. Super Admin
super_admin = User(
    full_name="Anandha pandiyan",
    phone_number="9789384341",
    hashed_password=hash_password("Anandha@123"),
    role=UserRole.SUPER_ADMIN
)
db.add(super_admin)

# 2. Gym Owner
owner = User(
    full_name="pandi Gym Owner",
    phone_number="9999999999",
    hashed_password=hash_password("owner123"),
    role=UserRole.OWNER,
    gym_name="SaaS Elite Fitness Hub"
)
db.add(owner)
db.commit()
db.refresh(owner)

# 3. Trainer
trainer = User(
    full_name="Vikram Trainer",
    phone_number="8888888888",
    hashed_password=hash_password("trainer123"),
    role=UserRole.TRAINER,
    gym_owner_id=owner.id,
    salary=25000.0
)
db.add(trainer)
db.commit()
db.refresh(trainer)

# 4. Member
member = User(
    full_name="Karthi Member",
    phone_number="7777777777",
    hashed_password=hash_password("member123"),
    role=UserRole.MEMBER,
    gym_owner_id=owner.id,
    assigned_trainer_id=trainer.id,
    category="BODYBUILDER",
    custom_monthly_gym_fee=1500.0,
    fee_paid=True
)
db.add(member)
db.commit()

print("Database Seeded Successfully for Client Demo!")
db.close()