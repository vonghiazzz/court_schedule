from fastapi import FastAPI
from app.core.database import engine, SessionLocal, Base
from app.modules.users import models as user_models
from app.modules.schedule import models as schedule_models
from app.modules.users import router as users_router
from app.modules.schedule import router as schedule_router
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

app = FastAPI()

# Tạo bảng trong DB nếu chưa có
Base.metadata.create_all(bind=engine)

# API clear dữ liệu bảng schedules
@app.delete("/clear-schedules")
def clear_schedules():
    db = SessionLocal()
    try:
        db.execute(text("DELETE FROM schedules;"))
        db.commit()
        return {"message": "✅ All schedules cleared"}
    finally:
        db.close()

# API thêm cột mới
@app.post("/add-columns")
def add_columns():
    db = SessionLocal()
    try:
        db.execute(text("ALTER TABLE schedules ADD COLUMN IF NOT EXISTS dispute_relationship VARCHAR(255);"))
        db.execute(text("ALTER TABLE schedules ADD COLUMN IF NOT EXISTS litigant VARCHAR(255);"))
        db.commit()
        return {"message": "✅ Columns dispute_relationship & litigant added"}
    finally:
        db.close()
app.include_router(users_router.router)
app.include_router(schedule_router.router)

origins = [
    "http://localhost",
    "http://localhost:3001", # Địa chỉ của frontend
    "http://localhost:3000", # Địa chỉ của frontend
    "https://court-schedule-nine.vercel.app",
    "https://talented-liberation-production.up.railway.app",  # backend trên Railway

]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", include_in_schema=False)
def root():
    return {"message": "Court Schedule API is running. Go to /docs for API docs."}
