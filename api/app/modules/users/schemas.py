from pydantic import BaseModel
from typing import Optional

# --- SCHEMATY UŻYTKOWNIKA ---

class UserBase(BaseModel):
    email: str

# To zostawiamy, żeby logowanie działało!
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(UserBase):
    password: str
    first_name: str
    last_name: str
    phone_number: str
    street: str
    city: str
    postal_code: str
    terms_accepted: bool
    marketing_consent: bool
    data_processing_consent: bool

class UserOut(UserBase):
    id: int
    first_name: str
    last_name: str
    role: str
    street: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str