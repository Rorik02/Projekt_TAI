from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    price: float
    name: str

class OrderItemResponse(OrderItemCreate):
    id: int
    class Config:
        from_attributes = True 


class OrderCreate(BaseModel):
    restaurant_id: int
    total_amount: float
    delivery_address: str
    delivery_time_type: str
    payment_method: str
    document_type: str
    nip: Optional[str] = None
    remarks: Optional[str] = None
    items: List[OrderItemCreate]

class OrderResponse(BaseModel):
    id: int
    status: str
    created_at: datetime
    total_amount: float
    restaurant_id: int
    delivery_address: str
    delivery_time_type: str
    payment_method: str
    document_type: str
    nip: Optional[str]

    remarks: Optional[str] = None

    items: List[OrderItemResponse]
    
    restaurant_name: str
    restaurant_address: str
    
    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    new_status: str

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

# --- MODEL REQUEST ---
class ReorderRequest(BaseModel):
    order_id: int