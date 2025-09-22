"""
Prico Backend - FastAPI Application
"""
from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
from dotenv import load_dotenv

# Import routers
from routers import users, communities, chat, projects, notifications, rtc, editor, execute, auth

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "prico_db")

app = FastAPI(
    title="Prico API",
    description="Prico API for the platform combining Discord, VSCode and GitHub functionalities",
    version="0.1.0"
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://frontend:3000",
    "https://prico.vercel.app",  # Add your production domain if any
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(MONGODB_URL)
    app.mongodb = app.mongodb_client[DB_NAME]

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

# Include routers
app.include_router(users.router)
app.include_router(communities.router)
app.include_router(chat.router)
app.include_router(projects.router)
app.include_router(notifications.router)
app.include_router(rtc.router)
app.include_router(editor.router)
app.include_router(execute.router)
app.include_router(auth.router)

# Base route
@app.get("/")
async def root():
    return {"message": "Welcome to Prico API"}

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}