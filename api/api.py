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

    return jsonify({
        "greeting": "Welcome, " + user.firstname,
        "id": user.id
    })




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

# route /events/<id> to get a specific event
@app.route("/api/events/<id>", methods=["GET"])
def getEvent(id):
    event = Event.query.filter_by(id=id).first()
    return jsonify(event.serialize())

@app.route("/api/events/new", methods=["POST"])
def createEvent():
    n = request.json
    eventName = n["eventName"]
    organizerID = n["organizerID"]
    eventStart = n["eventStart"]
    eventEnd = n["eventEnd"]
    eventBuilding = n["eventBuilding"]
    eventRoom = n["eventRoom"]
    oneLiner = n["oneLiner"]

    newevent = Event(eventName=eventName,
        organizerID=organizerID,
        eventStart=eventStart,
        eventEnd=eventEnd,
        eventBuilding=eventBuilding,
        eventRoom=eventRoom,
        oneLiner=oneLiner)
    
    db.session.add(newevent)
    db.session.commit()
    return jsonify(newevent.serialize())

@app.route("/api/events/<eventid>/register/<userid>", methods=["POST"])
def registerEvent(eventid, userid):
    event = db.get_or_404(Event, eventid)
    user = db.get_or_404(User, userid)
    event.users.append(user)
    event.registered += 1
    db.session.commit()
    return jsonify(event.serialize())

@app.route("/api/events/<eventid>/unregister/<userid>", methods=["POST"])
def unregisterEvent(eventid, userid):
    event = db.get_or_404(Event, eventid)
    user = db.get_or_404(User, userid)
    event.users.remove(user)
    event.registered -= 1
    db.session.commit()
    return jsonify(event.serialize())

# TODO: below functions to be further implemented and used by Vishnu and Tracy for discover page

@app.route("/api/events/all", methods=["GET"])
def getEvents():
    events = Event.query.all()
    return jsonify([e.serialize() for e in events])

@app.route("/api/events/<eventid>/update", methods=["POST"])
def updateEvent(eventid, name, date, time, location):
    event = Event.query.filter_by(id=eventid).first()
    event.name = name
    event.date = date
    event.time = time
    event.location = location
    db.session.commit()
    return jsonify(event.serialize())

@app.route("/api/events/<eventid>/delete", methods=["POST"])
def deleteEvent(eventid):
    event = Event.query.filter_by(id=eventid).first()
    db.session.delete(event)
    db.session.commit()
    return jsonify(event.serialize())

@app.route("/api/users/<userid>/events", methods=["GET"])
def getRegisteredEvents(userid):
    user = User.query.filter_by(id=userid).first()
    events = user.events
    return jsonify([e.serialize() for e in events])

@app.route("/api/events/<eventid>/registered", methods=["GET"])
def getRegisteredUsers(eventid):
    event = Event.query.filter_by(id=eventid).first()
    users = event.users
    return jsonify([u.serialize() for u in users])

# route get events by date
@app.route("/api/events/dates", methods=["GET"])
def getEventsByDate(date):
    events = Event.query.filter_by(date=date).all()
    return jsonify([e.serialize() for e in events])

@app.route("/api/events/location", methods=["GET"])
def getEventsByLocation(location):
    events = Event.query.filter_by(location=location).all()
    return jsonify([e.serialize() for e in events])

@app.route("/api/events/interest", methods=["GET"])
def getEventsByInterest(interest):
    events = Event.query.filter(Event.interests.like("%" + interest + "%")).all()
    return jsonify([e.serialize() for e in events])

@app.route("/events/category", methods=["GET"])
def getEventsByCategory(category):
    events = Event.query.filter(Event.categories.any(name=category)).all()
    return jsonify([e.serialize() for e in events])

@app.route("/api/users/<userid>/events", methods=["GET"])
def getEventsByUser(userid):
    user = User.query.filter_by(id=userid).first()
    events = user.events
    return jsonify([e.serialize() for e in events])
