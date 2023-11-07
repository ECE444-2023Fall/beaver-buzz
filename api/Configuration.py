import os
import re

class Configuration:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    original_uri = os.environ.get('SQLALCHEMY_DATABASE_URI')
    corrected_uri = re.sub(r'^postgres:', 'postgresql:', original_uri)
    SQLALCHEMY_DATABASE_URI = corrected_uri
