from sqlalchemy import Column, Integer, String, Boolean
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True, index=True)
    phone_number = Column(String)
    hashed_password = Column(String)
    role = Column(String)
    street = Column(String)
    city = Column(String)
    postal_code = Column(String)
    terms_accepted = Column(Boolean)
    marketing_consent = Column(Boolean)
    data_processing_consent = Column(Boolean)
