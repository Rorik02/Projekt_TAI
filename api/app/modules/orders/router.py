from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.db.database import get_db
from app.modules.users.router import get_current_user
from app.modules.users.models import User
from app.modules.restaurants.models import Restaurant, Product
from . import models, schemas

router = APIRouter()
logger = logging.getLogger(__name__)

# ==========================================
# ENDPOINTY ZAMÓWIEŃ
# ==========================================

@router.post("/", response_model=schemas.OrderResponse)
def create_order(
    order_data: schemas.OrderCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Tworzy nowe zamówienie.
    """
    logger.info(f"Tworzenie zamówienia dla użytkownika {current_user.id}")
    
    try:
        # 1. Sprawdź czy restauracja istnieje
        restaurant = db.query(Restaurant).filter(Restaurant.id == order_data.restaurant_id).first()
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restauracja nie znaleziona")
        
        # 2. Walidacja produktów
        for item in order_data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Produkt o ID {item.product_id} nie znaleziony")
        
        # 3. Utwórz zamówienie
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
        
        # 4. Dodaj pozycje zamówienia
        for item in order_data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            new_item = models.OrderItem(
                order_id=new_order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
                name=product.name if product else item.name
            )
            db.add(new_item)
        
        db.commit()
        db.refresh(new_order)
        
        logger.info(f"Zamówienie {new_order.id} utworzone pomyślnie")
        
        # 5. Przygotuj odpowiedź
        response_data = {
            "id": new_order.id,
            "user_id": new_order.user_id,
            "restaurant_id": new_order.restaurant_id,
            "status": new_order.status,
            "total_amount": new_order.total_amount,
            "delivery_address": new_order.delivery_address,
            "delivery_time_type": new_order.delivery_time_type,
            "payment_method": new_order.payment_method,
            "document_type": new_order.document_type,
            "nip": new_order.nip,
            "remarks": new_order.remarks,
            "created_at": new_order.created_at,
            "items": new_order.items,
            "restaurant_name": restaurant.name,
            "restaurant_address": f"{restaurant.street} {restaurant.number}, {restaurant.city}"
        }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Błąd przy tworzeniu zamówienia: {str(e)}")
        raise HTTPException(status_code=500, detail="Wewnętrzny błąd serwera")

@router.get("/my-orders", response_model=List[schemas.OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Pobiera historię zamówień zalogowanego użytkownika.
    """
    logger.info(f"Pobieranie zamówień dla użytkownika {current_user.id}")
    
    try:
        orders = db.query(models.Order)\
            .filter(models.Order.user_id == current_user.id)\
            .order_by(models.Order.created_at.desc())\
            .all()
        
        result = []
        for order in orders:
            # Pobierz informacje o restauracji
            restaurant = db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
            
            order_data = {
                "id": order.id,
                "user_id": order.user_id,
                "restaurant_id": order.restaurant_id,
                "status": order.status,
                "total_amount": order.total_amount,
                "delivery_address": order.delivery_address,
                "delivery_time_type": order.delivery_time_type,
                "payment_method": order.payment_method,
                "document_type": order.document_type,
                "nip": order.nip,
                "remarks": order.remarks,
                "created_at": order.created_at,
                "items": order.items,
                "restaurant_name": restaurant.name if restaurant else "Nieznana restauracja",
                "restaurant_address": f"{restaurant.street} {restaurant.number}, {restaurant.city}" if restaurant else ""
            }
            result.append(order_data)
        
        logger.info(f"Znaleziono {len(result)} zamówień")
        return result
        
    except Exception as e:
        logger.error(f"Błąd pobierania zamówień: {str(e)}")
        raise HTTPException(status_code=500, detail="Wewnętrzny błąd serwera")

@router.get("/active", response_model=Optional[schemas.OrderResponse])
def get_active_order(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Pobiera aktualne zamówienie użytkownika.
    """
    active_statuses = ["confirmed", "preparing", "delivery", "arrived"]
    order = db.query(models.Order)\
        .filter(models.Order.user_id == current_user.id)\
        .filter(models.Order.status.in_(active_statuses))\
        .order_by(models.Order.created_at.desc())\
        .first()
    
    if order:
        restaurant = db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
        return {
            **order.__dict__,
            "items": order.items,
            "restaurant_name": restaurant.name if restaurant else "",
            "restaurant_address": f"{restaurant.street} {restaurant.number}, {restaurant.city}" if restaurant else ""
        }
    
    return None

@router.get("/owner", response_model=List[schemas.OrderResponse])
def get_restaurant_orders(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Pobiera zamówienia dla restauracji właściciela.
    """
    if current_user.role != "właściciel":
        return []
    
    my_restaurant = db.query(Restaurant).filter(Restaurant.owner_id == current_user.id).first()
    
    if not my_restaurant:
        return []
    
    orders = db.query(models.Order)\
        .filter(models.Order.restaurant_id == my_restaurant.id)\
        .order_by(models.Order.created_at.desc())\
        .all()
    
    result = []
    for order in orders:
        restaurant = db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
        result.append({
            **order.__dict__,
            "items": order.items,
            "restaurant_name": restaurant.name if restaurant else "",
            "restaurant_address": f"{restaurant.street} {restaurant.number}, {restaurant.city}" if restaurant else ""
        })
    
    return result