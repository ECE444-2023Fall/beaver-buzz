from re import T
from flask import Flask, request, jsonify, session
from flask_cors import CORS, cross_origin
from Configuration import Configuration
from schemas import db, event_attendance, User, Event
import bcrypt
from datetime import datetime
from pytz import timezone
from sqlalchemy import or_
import random

eastern = timezone('EST')

app = Flask(__name__)
app.config.from_object(Configuration)
app.config['CORS_HEADERS'] =  'Content-Type'
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

@app.route("/api/getUserInfo", methods=["POST"])
def getInfo():
    id = request.json["id"]

    user = User.query.filter_by(id=id).first()

    return jsonify({
        "firstname": user.firstname,
        "lastname": user.lastname,
        "phonenumber": user.phonenumber,
        "emailaddr": user.email,
        "interests": user.interests,
    })


@app.route("/api/setEmail", methods=["POST"])
def setEmail():
    id = request.json["id"]
    email = request.json["email"]
    user = User.query.filter_by(id=id).first()

    otherUser = User.query.filter_by(email=email).first()
    if otherUser is not None and otherUser != user:
        return jsonify({
            "error": "email already in use"
        })
    user.email = email
    db.session.commit()

    return jsonify({
        "status": "updated email"
    })




@app.route("/api/setLastname", methods=["POST"])
def setLastname():
    id = request.json["id"]
    lastname = request.json["lastname"]
    user = User.query.filter_by(id=id).first()

    user.lastname = lastname
    db.session.commit()

    return jsonify({
        "status": "updated last name"
    })


@app.route("/api/setFirstname", methods=["POST"])
def setFirstname():
    id = request.json["id"]
    firstname = request.json["firstname"]
    user = User.query.filter_by(id=id).first()

    user.firstname = firstname
    db.session.commit()

    return jsonify({
        "status": "updated first name"
    })


@app.route("/api/setPhone", methods=["POST"])
def setPhone():
    id = request.json["id"]
    phone = request.json["phone"]
    user = User.query.filter_by(id=id).first()

    otherUser = User.query.filter_by(phonenumber=phone).first()
    if otherUser is not None and otherUser != user:
        return jsonify({
            "error": "phone number is already in use"
        })

    user.phonenumber = phone

    db.session.commit()

    return jsonify({
        "status": "updated phone"
    })


@app.route("/api/setInterests", methods=["POST"])
def setInterests():
    id = request.json["id"]
    interests = request.json["interests"]
    user = User.query.filter_by(id=id).first()

    user.interests = interests

    db.session.commit()

    return jsonify({
        "status": "updated interests"
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
    if event is not None:
        # print("timezone is:", event.eventStart.tzname())
        event.eventStart = event.eventStart.astimezone(eastern)
        event.eventEnd = event.eventEnd.astimezone(eastern)
        return jsonify(event.serialize())
    return jsonify({"error": "Event not found"}), 420


@app.route("/api/events/new", methods=["POST"])
def createEvent():
    n = request.json
    eventName = n["eventName"]

    organizerID = n["organizerID"]
    date_format = "%Y-%m-%d %H:%M"
    eventStart = eastern.localize(datetime.strptime(n["eventDate"] + " " + n["eventStart"], date_format))
    eventEnd = eastern.localize(datetime.strptime(n["eventDate"] + " " + n["eventEnd"], date_format))
    # print("new event created in tz:", eventStart.tzname())

    eventBuilding = n["building"]
    eventRoom = n["room"]
    oneLiner = n["oneLiner"]
    eventDesc = n["description"]
    eventImg = n["image"] 

    organizer = User.query.filter_by(id=organizerID).first()
    if not organizer:
        return jsonify({"Error": "Please log in first!"})
    
    

    newevent = Event(
        eventName=eventName,
        organizerID=organizerID,
        eventStart=eventStart,
        eventEnd=eventEnd,
        eventBuilding=eventBuilding,
        eventRoom=eventRoom,
        oneLiner=oneLiner,
        eventDesc=eventDesc, 
        eventImg=eventImg,
        eventImgType="image/jpeg",
    )

    db.session.add(newevent)
    db.session.commit()
    return jsonify({"event_id": newevent.id})


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

@app.route("/api/users/<userid>/events", methods=["POST"])

def getEventsByUser(userid):
    request_value = request.json
    user = User.query.filter_by(id=userid).first()
    events = user.registeredEvents if request_value['option'] == 'Attending' else user.organizedEvents
    final = []
    if request_value['showPastEvents']:
        for event in events:
            final.append(event.serialize())

    else:
        for event in events:
            dt = datetime.now();
            if dt <= event.eventEnd:
                final.append(event.serialize())


    return jsonify(final)

@app.route('/api/allevents', methods=['GET'])
@cross_origin()
def allevents():
    results = [e.serialize() for e in Event.query.all()]
    users = User.query.all()
    users_dict={}
    for u in users:
        users_dict[u.id] = u.firstname + " " + u.lastname
    for result in results:
        result['display_time'] = str(result['eventStart'].time().strftime("%I:%M %p"))
        if result['organizerID'] in users_dict.keys():
            name = users_dict[result['organizerID']]
            result['organizerName'] =  name
        else:
            u = User.query.get(result['organizerID'])
            result['organizerName'] = u.firstname + " " + u.lastname
    return jsonify(results)




@app.route('/api/search', methods=['GET'])
@cross_origin()
def search():
    query = request.args.get('searchbar')
    location_filters = request.args.get('filters')
    if location_filters:
        location_filters = location_filters.split(',')
    else:
        location_filters = []
    org_filter = request.args.get('Organizer')
    temp_q = query.split(' ')
    if org_filter:
        if len(temp_q)>1:
            fn = temp_q[0]
            ln = temp_q[1]
        else:
            fn = temp_q[0]
            ln = temp_q[0]
    #type_filter = request.args.get('type_filter')
    if not org_filter:
        org_filter= False
    filtered_results = []
    users_dict = {}

    if query != '' and len(location_filters)!=0:



        if org_filter == False:
            filtered_results = Event.query.filter(or_(*[Event.eventCategories.contains(location_filters[i]) for i in range(len(location_filters))]), Event.eventName.contains(query)).all()
        else:
            if fn == ln:
                users = User.query.filter(or_(User.firstname.contains(fn),User.lastname.contains(ln))).all()
            else:
                users = User.query.filter(User.firstname.contains(fn),User.lastname.contains(ln)).all()

            user_ids = [user.id for user in users]
            for u in users:
                users_dict[u.id] = u.firstname + " " + u.lastname


            filtered_results = Event.query.filter(or_(*[Event.eventCategories.contains(location_filters[i]) for i in range(len(location_filters))]), Event.organizerID.in_(user_ids)).all()
    elif len(location_filters)!=0:
        filtered_results = Event.query.filter(or_(*[Event.eventCategories.contains(location_filters[i]) for i in range(len(location_filters))])).all()
    elif len(location_filters)==0 and query!="":
        if org_filter == False:
            filtered_results = Event.query.filter(Event.eventName.contains(query)).all()
        else:
            if fn == ln:
                users = User.query.filter(or_(User.firstname.contains(fn),User.lastname.contains(ln))).all()
            else:
                users = User.query.filter(User.firstname.contains(fn),User.lastname.contains(ln)).all()

            user_ids = [user.id for user in users]
            for u in users:
                users_dict[u.id] = u.firstname + " " + u.lastname

            filtered_results = Event.query.filter(Event.organizerID.in_(user_ids)).all()
    else:
        filtered_results = Event.query.all()

    results = [e.serialize() for e in filtered_results]
    for result in results:
        result['display_time'] = str(result['eventStart'].time().strftime("%I:%M %p"))
        if result['organizerID'] in users_dict.keys():
            name = users_dict[result['organizerID']]
            result['organizerName'] =  name
        else:
            u = User.query.get(result['organizerID'])
            result['organizerName'] = u.firstname + " " + u.lastname
    return jsonify(results)





