from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- User Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    is_admin: Optional[bool] = False

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True


# --- Presentation Generation Schemas ---
class SlideElement(BaseModel):
    type: str = Field(..., description="Type of slide content, e.g., 'title', 'subtitle', 'bullet_point'")
    content: str = Field(..., description="The actual text content of the element")

class Slide(BaseModel):
    title: str = Field(..., description="Slide title")
    elements: List[SlideElement] = Field(default=[], description="List of elements on the slide")

class PresentationSchema(BaseModel):
    title: str = Field(..., description="Title of the presentation")
    slides: List[Slide] = Field(..., description="List of slides in the presentation")


# --- Admin Config Schemas ---
class AdminConfigUpdate(BaseModel):
    max_pdf_pages: Optional[int] = Field(None, ge=1)
    max_slides_allowed: Optional[int] = Field(None, ge=1)
    allow_signups: Optional[bool] = None

class GlobalConfigResponse(BaseModel):
    id: int
    max_pdf_pages: int
    max_slides_allowed: int
    allow_signups: bool

    class Config:
        from_attributes = True
        orm_mode = True
