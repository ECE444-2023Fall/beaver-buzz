import os


class Configuration:
    SECRET_KEY = "ry4nch3n"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = r"sqlite:///./db.sqlite"
