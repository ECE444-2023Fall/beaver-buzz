import os
import re

fallback_url = "postgres://zsitdxsagpsldt:16d14b5c5bdabc1b38c5b5d435757f84f7afcf0bf1f5d93db76f34b069e6a77c@ec2-34-193-110-25.compute-1.amazonaws.com:5432/df4cpci37ne0rp"

class Configuration:
    SECRET_KEY = "ry4nch3n"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    original_uri = os.environ.get('SQLALCHEMY_DATABASE_URI', fallback_url)
    corrected_uri = re.sub(r'^postgres:', 'postgresql:', original_uri)
    SQLALCHEMY_DATABASE_URI = corrected_uri
