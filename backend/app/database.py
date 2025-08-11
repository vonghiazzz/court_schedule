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
    # Mặc dù bạn đã có DATABASE_URL trong .env, hãy đảm bảo rằng
    # biến môi trường được ưu tiên nếu nó đã được thiết lập từ bên ngoài.
    DATABASE_URL = os.getenv("DATABASE_URL")
else:
    DATABASE_URL = None

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set. Check your environment variables.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()