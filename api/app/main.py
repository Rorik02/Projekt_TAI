from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.db.database import Base, engine, SessionLocal
from app.modules.users.router import router as users_router
from app.modules.users import models 
from app.modules.restaurants.router import router as restaurants_router
from app.modules.restaurants import models as restaurant_models
from app.core.security import hash_password
from contextlib import asynccontextmanager

print(">>> MAIN FILE:", os.path.abspath(__file__))
print(">>> DB PATH:", os.path.abspath("app/db/foodapp.db"))

# Tworzenie tabel w bazie SQLite
Base.metadata.create_all(bind=engine)
restaurant_models.Base.metadata.create_all(bind=engine)

def create_default_admin():
    db = SessionLocal()
    try:
        # Tuta wpisz dane admina "na sztywno"
        ADMIN_EMAIL = "admin@foodapp.com"
        ADMIN_PASSWORD_TEXT = "Admin123!"  # <--- To będzie Twoje hasło
        
        # Sprawdzamy czy już istnieje
        existing_admin = db.query(models.User).filter(models.User.email == ADMIN_EMAIL).first()
        
        if not existing_admin:
            print(f"--- TWORZENIE ADMINA: {ADMIN_EMAIL} ---")
            
            # POPRAWKA: Używamy zmiennej z hasłem, a nie sztywnego tekstu "admin"
            pwd_hashed = hash_password(ADMIN_PASSWORD_TEXT)
            
            new_admin = models.User(
                email=ADMIN_EMAIL,
                hashed_password=pwd_hashed,
                role="admin",
                first_name="Admin",
                last_name="Systemowy",
                phone_number="000000000",
                
                street="Ulica Admina 1",
                city="Centrala",
                postal_code="00-001",
                terms_accepted=True,
                marketing_consent=False,
                data_processing_consent=True
            )
            db.add(new_admin)
            db.commit()
            print("--- ADMIN UTWORZONY POMYŚLNIE ---")
        else:
            print("--- ADMIN JUŻ ISTNIEJE ---")
            
    except Exception as e:
        print(f"Błąd tworzenia admina: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_default_admin() # Wywołanie funkcji przy starcie
    yield

# --- TUTAJ BYŁ BŁĄD ---
# Musisz przekazać lifespan do FastAPI, inaczej funkcja wyżej nigdy się nie uruchomi!
app = FastAPI(lifespan=lifespan) 

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Podpięcie routera
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(restaurants_router, prefix="/restaurants", tags=["Restaurants"])