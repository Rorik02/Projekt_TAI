# api/app/modules/restaurants/router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db # Twój generator sesji
from . import models, schemas

router = APIRouter()

# Pobieranie restauracji
@router.get("/", response_model=List[schemas.RestaurantOut])
def get_restaurants(cuisine: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Restaurant)
    restaurants = query.all()
    
    # Mały hack: musimy zamienić string "Pizza,Pasta" na listę ["Pizza", "Pasta"]
    # aby pasowało do schematu Pydantic, bo SQLite nie ma typu Array
    results = []
    for r in restaurants:
        r_dict = r.__dict__.copy() # Kopia słownika atrybutów
        if r.cuisines:
             r_dict['cuisines'] = r.cuisines.split(",")
        else:
             r_dict['cuisines'] = []
        results.append(r_dict)

    if cuisine:
        results = [r for r in results if cuisine in r['cuisines']]
        
    return results

# Dodawanie restauracji (pomocnicze)
@router.post("/", response_model=schemas.RestaurantOut)
def create_restaurant(restaurant: schemas.RestaurantCreate, db: Session = Depends(get_db)):
    # Zamiana listy na string
    cuisines_str = ",".join(restaurant.cuisines)
    
    db_restaurant = models.Restaurant(
        name=restaurant.name, 
        rating=restaurant.rating, 
        cuisines=cuisines_str
    )
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    
    # Fix dla wyświetlania odpowiedzi (zamiana stringa z powrotem na listę dla Pydantic)
    db_restaurant.cuisines = restaurant.cuisines 
    return db_restaurant

@router.delete("/{restaurant_id}")
def delete_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    # 1. Szukamy restauracji
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    
    # 2. Jeśli nie ma, zwracamy błąd 404
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # 3. Jeśli jest - usuwamy
    db.delete(restaurant)
    db.commit()
    
    return {"message": "Restaurant deleted successfully"}


# Pobieranie produktów danej restauracji
@router.get("/{restaurant_id}/products", response_model=List[schemas.ProductOut])
def get_products(restaurant_id: int, db: Session = Depends(get_db)):
    return db.query(models.Product).filter(models.Product.restaurant_id == restaurant_id).all()

# Dodawanie produktu
@router.post("/products", response_model=schemas.ProductOut)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(
        name=product.name,
        price=product.price,
        restaurant_id=product.restaurant_id
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# Usuwanie produktu
@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Deleted"}