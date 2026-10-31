import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

class Config:
    BASE_DIR = BASE_DIR
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-memzo-fallback-secret-key-391823901")
    
    # Database
    DB_DIR = BASE_DIR / "database"
    DB_DIR.mkdir(parents=True, exist_ok=True)
    DB_PATH = DB_DIR / "memzo.db"
    
    db_env = os.environ.get("DATABASE_URL")
    if db_env and not db_env.startswith("sqlite:///database/"):
        SQLALCHEMY_DATABASE_URI = db_env
    else:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{DB_PATH.as_posix()}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Uploads
    UPLOAD_FOLDER = BASE_DIR / "static" / "images" / "products"
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max-limit
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "svg"}

    # Security & Session
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    WTF_CSRF_ENABLED = True


class TestConfig(Config):
    TESTING = True
    WTF_CSRF_ENABLED = False
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
