# api/app/modules/restaurants/schemas.py
from pydantic import BaseModel
from typing import List, Optional

# --- Produkty ---
class ProductBase(BaseModel):
    name: str
    price: float
    category: str

class ProductCreate(ProductBase):
    restaurant_id: int

class ProductOut(ProductBase):
    id: int
    restaurant_id: int
    class Config:
        from_attributes = True

class Product(ProductBase):
    id: int
    class Config:
        orm_mode = True



# --- Restauracje ---
class RestaurantBase(BaseModel):
    name: str
    cuisines: str
    
    # Pola adresowe
    city: str
    street: str
    number: str

class RestaurantCreate(RestaurantBase):
    # Dodajemy pole rating, aby router mógł je odczytać (domyślnie 0.0)
    rating: Optional[float] = 0.0

class RestaurantOut(RestaurantBase):
    id: int
    rating: float
    
    # Pola geolokalizacji
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    products: List[ProductOut] = []

    class Config:
        from_attributes = True