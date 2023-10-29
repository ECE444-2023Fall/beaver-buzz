import re

class Configuration:
    SECRET_KEY = "ry4nch3n"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    original_uri = "postgres://oeypxzjtmdwmso:fd700d3a605375df5d8c178763efe9a32b423aa4643a2360ed608a870bd2a753@ec2-34-193-110-25.compute-1.amazonaws.com:5432/dbj8go8nj9fmjj"
    corrected_uri = re.sub(r'^postgres:', 'postgresql:', original_uri)
    SQLALCHEMY_DATABASE_URI = corrected_uri
