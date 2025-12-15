from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.db.database import Base, engine
from app.modules.users.router import router as users_router
from app.modules.users import models 
from app.modules.restaurants.router import router as restaurants_router
from app.modules.restaurants import models as restaurant_models

print(">>> MAIN FILE:", os.path.abspath(__file__))
print(">>> DB PATH:", os.path.abspath("app/db/foodapp.db"))

# Tworzenie tabel w bazie SQLite
Base.metadata.create_all(bind=engine)
restaurant_models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS – pozwala Reactowi łączyć się z backendem
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
