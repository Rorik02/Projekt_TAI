from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    
    # Klucze obce wskazują na nazwy tabel w bazie danych ("users", "restaurants")
    user_id = Column(Integer, ForeignKey("users.id")) 
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    
    status = Column(String, default="confirmed") 
    total_amount = Column(Float)
    delivery_address = Column(Text)
    delivery_time_type = Column(String)
    payment_method = Column(String)
    document_type = Column(String)
    nip = Column(String, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # --- RELACJE ZWROTNE ---
    # Używamy pełnych ścieżek, tak jak w Twoich plikach
    user = relationship("app.modules.users.models.User", back_populates="orders")
    restaurant = relationship("app.modules.restaurants.models.Restaurant", back_populates="orders")
    
    # Relacja lokalna (w tym samym pliku, więc może być nazwa klasy lub string)
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    
    # Zakładam, że produkty są w tabeli "products" (zdefiniowanej w module restaurants)
    product_id = Column(Integer, ForeignKey("products.id")) 
    
    quantity = Column(Integer)
    price = Column(Float)
    name = Column(String)

    order = relationship("Order", back_populates="items")
    
    # Relacja do produktu (ścieżka do modułu restauracji)
    product = relationship("app.modules.restaurants.models.Product")