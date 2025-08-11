# import os
# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
# from dotenv import load_dotenv

# # Chỉ load .env khi chạy local (hoặc khi APP_ENV chưa được set)
# if os.getenv("APP_ENV") in (None, "local"):
#     load_dotenv()  # load các biến trong file .env (chỉ local dev mới cần)

# APP_ENV = os.getenv("APP_ENV", "local")

# if APP_ENV == "local":
#     DATABASE_URL = os.getenv("DATABASE_URL_LOCAL")
# elif APP_ENV == "docker":
#     DATABASE_URL = os.getenv("DATABASE_URL_DOCKER")
# elif APP_ENV == "production":
#     DATABASE_URL = os.getenv("DATABASE_URL")
# else:
#     DATABASE_URL = None

# if not DATABASE_URL:
#     raise ValueError("DATABASE_URL is not set. Check your environment variables.")

# engine = create_engine(DATABASE_URL)
# SessionLocal = sessionmaker(bind=engine)
# Base = declarative_base()
