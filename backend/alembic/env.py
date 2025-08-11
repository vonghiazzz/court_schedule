from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

import os
import sys
from dotenv import load_dotenv

# Load file .env
load_dotenv()

# Thêm đường dẫn tới thư mục app để import được
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), "app"))

from app.database import Base

# Lấy APP_ENV từ .env (mặc định = local)
APP_ENV = os.getenv("APP_ENV", "local")

# Lấy URL database theo môi trường
if APP_ENV == "local":
    DATABASE_URL = os.getenv("DATABASE_URL_LOCAL")
elif APP_ENV == "docker":
    DATABASE_URL = os.getenv("DATABASE_URL_DOCKER")
else:
    DATABASE_URL = os.getenv("DATABASE_URL")  # Railway hoặc server khác

# Cấu hình Alembic
config = context.config
fileConfig(config.config_file_name)
target_metadata = Base.metadata

def run_migrations_offline():
    """Chạy migration ở chế độ offline."""
    config.set_main_option("sqlalchemy.url", DATABASE_URL)
    context.configure(
        url=DATABASE_URL, target_metadata=target_metadata, literal_binds=True
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Chạy migration ở chế độ online."""
    config.set_main_option("sqlalchemy.url", DATABASE_URL)
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
