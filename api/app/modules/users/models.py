from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
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
    
    role_request = Column(String, nullable=True)  

    street = Column(String)
    number = Column(String)
    city = Column(String)
    postal_code = Column(String)
    
    terms_accepted = Column(Boolean, default=False)
    marketing_consent = Column(Boolean, default=False)
    data_processing_consent = Column(Boolean, default=False)

    restaurants = relationship("app.modules.restaurants.models.Restaurant", back_populates="owner")
    
    additional_addresses = relationship("UserAddress", back_populates="user", cascade="all, delete-orphan")

    orders = relationship("app.modules.orders.models.Order", back_populates="user")


class UserAddress(Base):
    __tablename__ = "user_addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    city = Column(String)
    street = Column(String)
    number = Column(String)
    
    user = relationship("User", back_populates="additional_addresses")


