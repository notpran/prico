from pydantic import AnyHttpUrl, BaseSettings
from typing import List, Union

class Settings(BaseSettings):
    PROJECT_NAME: str = "Prico"
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    API_V1_STR: str = "/api/v1"
    # MongoDB
    MONGO_DETAILS: str = "mongodb://localhost:27017"
    # JWT
    SECRET_KEY: str = "a_very_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        case_sensitive = True

settings = Settings()
