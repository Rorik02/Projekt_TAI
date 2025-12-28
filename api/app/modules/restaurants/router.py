# api/app/modules/restaurants/router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import urllib.request
import urllib.parse
import json
from app.db.database import get_db
from . import models, schemas

router = APIRouter()

MAPBOX_TOKEN = "pk.eyJ1Ijoicm9yaWsiLCJhIjoiY21qN3JvaDh5MDV4cDNncXpkM3RlNmVzZCJ9.HemoDNLmVXXnG2OTEb3H7g"

# --- Funkcja pomocnicza do Geocodingu (Mapbox) ---
def get_coordinates(city: str, street: str, number: str):
    """
    Pobiera współrzędne (lat, lon) używając Mapbox Geocoding API.
    Korzysta z wbudowanej biblioteki urllib (brak konieczności instalowania dodatków).
    """
    try:
        full_address = f"{street} {number}, {city}"
        # Kodowanie znaków specjalnych w URL (np. spacje, polskie znaki)
        encoded_query = urllib.parse.quote(full_address)
        
        url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{encoded_query}.json?access_token={MAPBOX_TOKEN}&limit=1"
        
        # Wykonanie zapytania
        with urllib.request.urlopen(url) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                if data.get("features"):
                    # Mapbox zwraca współrzędne w formacie [longitude, latitude]
                    # My potrzebujemy (latitude, longitude)
                    center = data["features"][0]["center"]
                    return float(center[1]), float(center[0])
    except Exception as e:
        print(f"Błąd geokodowania Mapbox: {e}")
        pass
        
    return None, None

# --- Endpoints ---

@router.get("/", response_model=List[schemas.RestaurantOut])
def get_restaurants(cuisine: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Restaurant)
    restaurants = query.all()
    
    if cuisine:
        restaurants = [r for r in restaurants if cuisine.lower() in r.cuisines.lower()]
        
    return restaurants

@router.post("/", response_model=schemas.RestaurantOut)
def create_restaurant(restaurant: schemas.RestaurantCreate, db: Session = Depends(get_db)):
    # 1. Pobieramy współrzędne z Mapbox (funkcja jest teraz synchroniczna)
    lat, lon = get_coordinates(restaurant.city, restaurant.street, restaurant.number)
    
    # 2. Tworzymy obiekt
    db_restaurant = models.Restaurant(
        name=restaurant.name, 
        rating=restaurant.rating, 
        cuisines=restaurant.cuisines,
        city=restaurant.city,
        street=restaurant.street,
        number=restaurant.number,
        latitude=lat,
        longitude=lon
    )
    
    # 3. Zapisujemy
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    
    return db_restaurant

@router.delete("/{restaurant_id}")
def delete_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    db.delete(restaurant)
    db.commit()
    return {"message": "Restaurant deleted successfully"}

# --- Produkty ---

@router.get("/{restaurant_id}/products", response_model=List[schemas.ProductOut])
def get_products(restaurant_id: int, db: Session = Depends(get_db)):
    return db.query(models.Product).filter(models.Product.restaurant_id == restaurant_id).all()

@router.post("/products", response_model=schemas.ProductOut)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(
        name=product.name,
        price=product.price,
        category=product.category,
        restaurant_id=product.restaurant_id
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}