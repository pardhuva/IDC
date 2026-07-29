import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./idc.db"
    jwt_secret: str = os.urandom(32).hex()
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    cors_origins: str = "http://localhost:5173,http://localhost:4173"

    class Config:
        env_file = ".env"


settings = Settings()
