# app/database.py đã sửa
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

import logging

logging.basicConfig(level=logging.DEBUG)



# Chỉ load .env khi chạy local (máy dev)
if os.getenv("APP_ENV") in (None, "local"):
    load_dotenv()
APP_ENV = os.getenv("APP_ENV", "local")

if APP_ENV == "local":
    DATABASE_URL = os.getenv("DATABASE_URL_LOCAL")
elif APP_ENV == "docker":
    DATABASE_URL = os.getenv("DATABASE_URL_DOCKER")
elif APP_ENV == "production":
    DATABASE_URL = os.getenv("DATABASE_URL")
else:
    DATABASE_URL = None

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set. Check your environment variables.")

logging.debug(f"APP_ENV = {APP_ENV}")
logging.debug(f"DATABASE_URL = {DATABASE_URL}")


engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


print("APP_ENV:", APP_ENV)
print("DATABASE_URL:", DATABASE_URL)
