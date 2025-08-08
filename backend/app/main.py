# app/main.py
from fastapi import FastAPI
from app.database import engine
from app import models
from app.routers import users, schedule
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

models.Base.metadata.create_all(bind=engine)
app.include_router(users.router)
app.include_router(schedule.router)

origins = [
    "http://localhost",
    "http://localhost:3001", # Địa chỉ của frontend
    "https://court-schedule-nine.vercel.app"
]

# Cho phép React frontend truy cập
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)