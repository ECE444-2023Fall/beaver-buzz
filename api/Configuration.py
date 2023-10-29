import os
import re

class Configuration:
    SECRET_KEY = "ry4nch3n"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    original_uri = os.environ.get('SQLALCHEMY_DATABASE_URI', 'fallback_url_here')
    corrected_uri = re.sub(r'^postgres:', 'postgresql:', original_uri)
    SQLALCHEMY_DATABASE_URI = corrected_uri
