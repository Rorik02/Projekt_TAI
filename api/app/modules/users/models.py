from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True, index=True)
    phone_number = Column(String)
    hashed_password = Column(String)
    role = Column(String, default="user")
    
    street = Column(String)
    city = Column(String)
    postal_code = Column(String)
    
    terms_accepted = Column(Boolean, default=False)
    marketing_consent = Column(Boolean, default=False)
    data_processing_consent = Column(Boolean, default=False)

    restaurants = relationship("app.modules.restaurants.models.Restaurant", back_populates="owner")