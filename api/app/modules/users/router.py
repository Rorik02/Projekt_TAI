from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from .schemas import UserCreate, UserLogin, UserOut
from .service import create_user, authenticate_user
from .models import User

router = APIRouter()

@router.post("/register", response_model=UserOut)
def register_user(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Konto o podanym email już istnieje")

    return create_user(db, data)

@router.post("/login")
def login_user(data: UserLogin, db: Session = Depends(get_db)):
    token = authenticate_user(db, data.email, data.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"access_token": token}

@router.post("/register", response_model=UserOut)
def register_user(data: UserCreate, db: Session = Depends(get_db)):
    # sprawdzenie emaila
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Użytkownik z takim e-mailem już istnieje")

    return create_user(db, data)
