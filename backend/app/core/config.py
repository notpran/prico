from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings
from typing import List, Union

class Settings(BaseSettings):
    PROJECT_NAME: str = "Prico"
    BACKEND_CORS_ORIGINS: List[Union[AnyHttpUrl, str]] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8080", 
        "http://localhost:4200",
        "http://localhost:5000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:4200",
        "http://127.0.0.1:5000",
        "https://*.github.dev",
        "https://*.preview.app.github.dev",
        "*",  # Allow all origins for testing (remove in production)
    ]
    API_V1_STR: str = "/api/v1"
    # MongoDB
    MONGO_DETAILS: str = "mongodb://localhost:27017"
    MONGODB_URL: str = "mongodb://localhost:27017"
    # JWT
    SECRET_KEY: str = "a_very_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days

    class Config:
        case_sensitive = True

settings = Settings()
