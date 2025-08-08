import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

APP_ENV = os.getenv("APP_ENV", "local")

if APP_ENV == "docker":
    DATABASE_URL = os.getenv("DATABASE_URL_DOCKER")
elif APP_ENV == "production":
    DATABASE_URL = os.getenv("DATABASE_URL")  # Railway sẽ tự set biến này
else:
    DATABASE_URL = os.getenv("DATABASE_URL_LOCAL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set. Check your .env file or environment variables.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()
