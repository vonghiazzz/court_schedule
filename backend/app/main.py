# app/main.py
from fastapi import FastAPI
from app.database import engine, SessionLocal
from app import models
from app.routers import users, schedule
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text


app = FastAPI()

# Tạo bảng trong DB nếu chưa có
models.Base.metadata.create_all(bind=engine)

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
        
app.include_router(users.router)
app.include_router(schedule.router)

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
