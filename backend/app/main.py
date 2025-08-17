# app/main.py
from fastapi import FastAPI
from app.database import engine, SessionLocal
from app import models
from app.routers import users, schedule
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# Tạo bảng trong DB nếu chưa có
models.Base.metadata.create_all(bind=engine)

# XÓA dữ liệu schedules khi khởi động server
@app.on_event("startup")
def clear_schedules():
    db = SessionLocal()
    try:
        db.execute("DELETE FROM schedules;")
        db.commit()
        print("✅ All schedules deleted on startup")
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
