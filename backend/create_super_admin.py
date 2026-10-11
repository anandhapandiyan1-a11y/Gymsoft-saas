from app.database import SessionLocal
from app.models.user import User, UserRole
from app.security import hash_password

db = SessionLocal()

existing = db.query(User).filter(User.role == UserRole.SUPER_ADMIN).first()
if not existing:
    super_admin = User(
        full_name="Anandha pandiyan",
        phone_number="9789384341",
        hashed_password=hash_password("Anandha@123"),
        role=UserRole.SUPER_ADMIN
    )
    db.add(super_admin)
    db.commit()
    print("✨ Super Admin created successfully!")
else:
    print("Super Admin already exists!")
db.close()