import os

class Configuration:
    SECRET_KEY = os.environ.get("SECRET_KEY", "default-secret-key")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Fallback to a local sqlite database if no DATABASE_URL is set
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///./db.sqlite").replace("postgres://", "postgresql://", 1)
