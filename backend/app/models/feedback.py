from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from app.database import Base

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("users.id"))
    gym_owner_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer, default=5)
    comment = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)