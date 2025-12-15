# api/app/modules/restaurants/schemas.py
from pydantic import BaseModel
from typing import List, Optional

# Schematy Produktów
class ProductBase(BaseModel):
    name: str
    price: float

class ProductCreate(ProductBase):
    restaurant_id: int

class ProductOut(ProductBase):
    id: int
    restaurant_id: int
    class Config:
        from_attributes = True # Ważne dla SQLAlchemy

# Schematy Restauracji
class RestaurantBase(BaseModel):
    name: str
    rating: float
    cuisines: List[str]

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantOut(RestaurantBase):
    id: int
    # products: List[ProductOut] = [] # Opcjonalnie, jeśli chcesz pobierać od razu z produktami
    class Config:
        from_attributes = True