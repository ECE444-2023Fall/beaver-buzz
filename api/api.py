from flask import Flask, request, jsonify, session
from Configuration import Configuration
from schemas import db, event_attendance, User, Event
import bcrypt

app = Flask(__name__)
app.config.from_object(Configuration)
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/api/login", methods=["POST"])
def login():
    email = request.json["email"]
    password = request.json["password"]

    user = User.query.filter_by(email=email).first()
    if user is None or not bcrypt.checkpw(password.encode("utf-8"), user.password):
        return jsonify({"error": "Invalid username or password"}), 425

    return jsonify({"greeting": "Welcome, " + user.firstname})


@app.route("/api/register", methods=["POST"])
def register():
    email = request.json["email"]
    password = request.json["password"]
    firstname = request.json["firstname"]
    lastname = request.json["lastname"]
    phonenumber = request.json["phonenumber"]
    interests = request.json["interests"]

    user = User.query.filter_by(email=email).first()
    if user is not None:  # An account with this email exists
        return jsonify({"error": "User already exists"}), 420

    passwordHash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    newaccount = User(
        email=email,
        password=passwordHash,
        firstname=firstname,
        lastname=lastname,
        phonenumber=phonenumber,
        interests=interests,
    )
    db.session.add(newaccount)
    db.session.commit()

    return jsonify({"greeting": "Welcome, " + newaccount.firstname})
