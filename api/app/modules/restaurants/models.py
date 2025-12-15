# api/app/modules/restaurants/models.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base # Import Twojej bazy

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    rating = Column(Float, default=0.0)
    cuisines = Column(String) # Będziemy tu trzymać listę po przecinku np. "Pizza,Pasta"

    # Relacja z produktami
    products = relationship("Product", back_populates="restaurant")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    name = Column(String)
    price = Column(Float)

    restaurant = relationship("Restaurant", back_populates="products")