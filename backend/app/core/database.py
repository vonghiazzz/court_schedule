import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Luôn load biến từ file .env để đảm bảo
load_dotenv()

APP_ENV = os.getenv("APP_ENV", "local")

if APP_ENV == "local":
    DATABASE_URL = os.getenv("DATABASE_URL_LOCAL")
elif APP_ENV == "docker":
    DATABASE_URL = os.getenv("DATABASE_URL_DOCKER")
elif APP_ENV == "production":
    DATABASE_URL = os.getenv("DATABASE_URL_PRODUCTION")
else:
    DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Fallback to general DATABASE_URL if specific ones are not set
    DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(f"DATABASE_URL is not set for environment: {APP_ENV}")

# Determine if SSL is needed (for external databases like Render)
connect_args = {}
if DATABASE_URL and ("localhost" not in DATABASE_URL and "db:" not in DATABASE_URL):
    connect_args = {"sslmode": "require"}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()