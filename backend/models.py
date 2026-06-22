from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class GlobalConfig(Base):
    __tablename__ = "global_configs"

    id = Column(Integer, primary_key=True, default=1)
    max_pdf_pages = Column(Integer, default=10, nullable=False)
    max_slides_allowed = Column(Integer, default=12, nullable=False)
    allow_signups = Column(Boolean, default=True, nullable=False)
