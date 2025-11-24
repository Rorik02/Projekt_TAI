from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    password: str
    role: str
    street: str
    city: str
    postal_code: str

    terms_accepted: bool
    marketing_consent: bool
    data_processing_consent: bool


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    role: str
    street: str
    city: str
    postal_code: str
    terms_accepted: bool
    marketing_consent: bool
    data_processing_consent: bool

    class Config:
        from_attributes = True
