from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.modules.restaurants.models import Restaurant

from app.db.database import get_db

# --- POPRAWKA TUTAJ ---
# Skoro nie ma jej w security.py, to na 99% jest zdefiniowana w routerze użytkowników.
# Jeśli nadal będzie błąd, sprawdź w pliku app/modules/users/router.py skąd bierzesz tę funkcję.
try:
    from app.modules.users.router import get_current_user
except ImportError:
    # Fallback: Jeśli masz osobny plik dependencies.py, odkomentuj linię niżej:
    # from app.dependencies import get_current_user
    pass

# Importy lokalne
from . import models, schemas 
from app.modules.users.models import User 

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

# ... (reszta pliku endpointów create_order, get_my_orders bez zmian) ...
# Wklej tu resztę kodu, którą już masz w tym pliku
@router.post("/", response_model=schemas.OrderResponse)
def create_order(
    order_data: schemas.OrderCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    new_order = models.Order(
        user_id=current_user.id,
        restaurant_id=order_data.restaurant_id,
        total_amount=order_data.total_amount,
        status="confirmed",
        delivery_address=order_data.delivery_address,
        delivery_time_type=order_data.delivery_time_type,
        payment_method=order_data.payment_method,
        document_type=order_data.document_type,
        nip=order_data.nip,
        remarks=order_data.remarks
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for item in order_data.items:
        new_item = models.OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price,
            name=item.name
        )
        db.add(new_item)
    
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/", response_model=List[schemas.OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return db.query(models.Order)\
        .filter(models.Order.user_id == current_user.id)\
        .order_by(models.Order.created_at.desc())\
        .all()

@router.get("/active", response_model=Optional[schemas.OrderResponse])
def get_active_order(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    active_statuses = ["confirmed", "preparing", "delivery", "arrived"]
    return db.query(models.Order)\
        .filter(models.Order.user_id == current_user.id)\
        .filter(models.Order.status.in_(active_statuses))\
        .order_by(models.Order.created_at.desc())\
        .first()

@router.get("/owner", response_model=List[schemas.OrderResponse])
def get_restaurant_orders(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # 1. Sprawdzamy, czy użytkownik jest właścicielem
    if current_user.role != "właściciel":
        return [] # Albo błąd 403, ale pusta lista bezpieczniejsza na start

    # 2. Szukamy restauracji tego właściciela
    my_restaurant = db.query(Restaurant).filter(Restaurant.owner_id == current_user.id).first()
    
    if not my_restaurant:
        return []

    # 3. Pobieramy zamówienia dla tej konkretnej restauracji
    orders = db.query(models.Order)\
        .filter(models.Order.restaurant_id == my_restaurant.id)\
        .order_by(models.Order.created_at.desc())\
        .all()
        
    return orders