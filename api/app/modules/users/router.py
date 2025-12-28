from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from jose import jwt, JWTError

# Importy z Twojej aplikacji
from app.db.database import get_db
from app.modules.users import models, schemas
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import SECRET_KEY, ALGORITHM

router = APIRouter()

# To pozwala FastAPI wiedzieć, że token przychodzi z endpointu logowania
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

# ==========================================
# 1. REJESTRACJA
# ==========================================
@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Sprawdzamy czy email jest wolny
    if db.query(models.User).filter(models.User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Konto o podanym email już istnieje")

    # Hashujemy hasło
    hashed_pwd = hash_password(user_data.password)
    
    # Przygotowujemy dane (usuwamy jawne hasło, wstawiamy hash)
    user_dict = user_data.dict()
    del user_dict['password']
    
    new_user = models.User(**user_dict, hashed_password=hashed_pwd)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

# ==========================================
# 2. LOGOWANIE
# ==========================================
@router.post("/login")
def login_user(data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    
    # Weryfikacja
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Błędny email lub hasło")

    # Tworzenie tokena JWT
    access_token = create_access_token(data={"sub": user.email, "role": user.role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role
    }

# ==========================================
# 3. AKTUALNY UŻYTKOWNIK (/me)
# ==========================================
# Ten endpoint służy do sprawdzenia "kim jestem" na podstawie tokena.
# Przydatne przy odświeżaniu strony (F5).
@router.get("/me", response_model=schemas.UserOut)
def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Nieprawidłowy token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Nieprawidłowy token")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
        
    return user

# ==========================================
# 4. LISTA UŻYTKOWNIKÓW (Dla Admina)
# ==========================================
@router.get("/", response_model=List[schemas.UserOut])
def read_all_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

# ==========================================
# 5. ZMIANA ROLI (Admin -> User)
# ==========================================
@router.put("/{user_id}/role")
def update_user_role(user_id: int, role: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
    
    user.role = role
    db.commit()
    db.refresh(user)
    return {"message": "Rola została zmieniona", "new_role": user.role}

# ==========================================
# 6. USUWANIE UŻYTKOWNIKA
# ==========================================
@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
    
    db.delete(user)
    db.commit()
    return {"message": "Użytkownik został usunięty"}