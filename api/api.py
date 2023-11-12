""" 
This file contains the API endpoints for the backend.
"""

from re import T
from flask import Flask, request, jsonify, session
from flask_cors import CORS, cross_origin
from Configuration import Configuration
from schemas import db, event_attendance, User, Event, UserRatings
import bcrypt
from pytz import timezone
import ast

eastern = timezone("EST")

app = Flask(__name__)
app.config.from_object(Configuration)
app.config["CORS_HEADERS"] = "Content-Type"
db.init_app(app)

with app.app_context():
    db.create_all()


@app.route("/api/health", methods=["GET"])
def get_health():
    """Verifies that the backend is live"""
    return jsonify({"status": "Backend is live"}), 200


@app.route("/api/users/<userid>/getSubscribers", methods=["POST"])
def get_subscribers(userid):
    """Gets the subscribers of a user with the given id

    Args:
        userid (int): user id of the user whose subscribers are being requested

    Returns:
        json: array of arrays of [id, first name, last name] representing the
        subscribers of the user with the given id
    """
    user = db.get_or_404(User, userid)
    returnarray = [[u.id, u.firstname, u.lastname] for u in user.subscribers]
    return jsonify(returnarray), 200


@app.route("/api/users/<userid>/getSubscribedTo", methods=["POST"])
def getsubscribed_to(userid):
    """Gets the users that the user with the given id is subscribed to

    Args:
        userid (int): user id of the user whose subscriptions are being requested

    Returns:
        json: array of arrays of [id, first name, last name] representing the users
        that the user with the given id is subscribed to
    """
    user = db.get_or_404(User, userid)
    returnarray = [[u.id, u.firstname, u.lastname] for u in user.subscribed_to_users]
    return jsonify(returnarray), 200


@app.route("/api/users/<otheruser>/subscribe/<userid>", methods=["POST"])
def subscribe(userid, otheruser):
    """Subscribes the user with the given id to the other user with userid otheruser

    Returns:
        json: json object with status field set to "subscribed" if successful, or
        error field set to error message if unsuccessful
    """
    user = db.get_or_404(User, userid)
    requestingUser = db.get_or_404(User, otheruser)
    if userid == otheruser:
        return jsonify({"error": "cannot subscribe to yourself"}), 400

    subscriberlist = user.subscribers
    if requestingUser in subscriberlist:
        return jsonify({"error": "user is already subscribed"}), 400
    subscriberlist.append(requestingUser)
    requestingUser.subscribed_to_users.append(user)

    db.session.commit()
    return jsonify({"status": "subscribed"})


@app.route("/api/users/<otheruser>/unsubscribe/<userid>", methods=["POST"])
def unsubscribe(userid, otheruser):
    """Unsubscribes the user with the given id from the other user with userid otheruser

    Returns:
        json: json object with status field set to "unsubscribed" if successful, or
        error field set to error message if unsuccessful
    """
    user = db.get_or_404(User, userid)
    requestingUser = db.get_or_404(User, otheruser)
    if userid == otheruser:
        return jsonify({"error": "cannot unsubscribe from yourself"}), 400

    subscriberlist = user.subscribers
    if requestingUser not in subscriberlist:
        return jsonify({"error": "user was never subscribed"}), 400
    subscriberlist.remove(requestingUser)
    requestingUser.subscribed_to_users.remove(user)

    db.session.commit()
    return jsonify({"status": "unsubscribed"})


@app.route("/api/login", methods=["POST"])
def login():
    """
    Logs in a user with the provided email and password.

    Returns:
        A JSON response containing a greeting message and the user's ID if the login is successful.
        Otherwise, returns a JSON response with an error message and a 401 status code.
    """

    email = request.json["email"]
    password = request.json["password"]

    user = User.query.filter_by(email=email).first()
    if user is None or not bcrypt.checkpw(password.encode("utf-8"), user.password):
        return jsonify({"error": "Invalid username or password"}), 401

    return jsonify({"greeting": "Welcome, " + user.firstname, "id": user.id}), 202


@app.route("/api/getUserInfo", methods=["POST"])
def get_user_info():
    """Gets the user info of the user with the given id

    Returns:
        json: json object with user info fields
    """
    id = request.json["id"]
    requestingUser = request.json["myID"]
    user = db.get_or_404(User, id)
    otheruser = db.get_or_404(User, requestingUser)

    return jsonify(
        {
            "firstname": user.firstname,
            "lastname": user.lastname,
            "phonenumber": user.phonenumber
            if user.showContactInfo or id == requestingUser
            else "Private",
            "emailaddr": user.email
            if user.showContactInfo or id == requestingUser
            else "Private",
            "interests": ast.literal_eval(user.interests),
            "privacy": {
                "showContactInformation": user.showContactInfo,
                "showRegisteredEvents": user.showRegisteredEvents,
            },
            "avatar": user.userImg,
        }
    )


@app.route("/api/events/<eventid>/getRating", methods=["GET"])
def get_rating(eventid):
    """Gets the rating of the event with the given id

    Args:
        eventid (int): event id of the event whose rating is being requested

    Returns:
        json: json object with fields rating and numreviewers or 404 if no rating exists
    """
    event = db.get_or_404(Event, eventid)
    return jsonify({"rating": event.rating, "numreviewers": event.numReviewers})


@app.route("/api/users/<userid>/getreviewfor/<eventid>", methods=["GET"])
def get_review(userid, eventid):
    """Gets the rating of the user with the given id for the event with the given id

    Args:
        userid (int): user id of the user whose rating is being requested
        eventid (int): event id of the event whose rating is being requested

    Returns:
        json: json object with field rating or 404 if no rating exists
    """
    event = db.get_or_404(Event, eventid)
    user = db.get_or_404(User, userid)
    rating = UserRatings.query.filter_by(userID=userid, eventID=eventid).first()
    if rating is None:
        return 404
    return jsonify({"rating": rating.ratingValue})


@app.route("/api/users/<userid>/setreviewfor/<eventid>", methods=["POST"])
def set_review(userid, eventid):
    """Sets the rating of the user with the given id for the event with the given id

    Args:
        userid (int): user id of the user whose rating is being set
        eventid (int): event id of the event whose rating is being set

    Returns:
        json: json object with field status or 404 if no user or event exists
    """
    event = db.get_or_404(Event, eventid)
    user = db.get_or_404(User, userid)
    host = db.get_or_404(User, event.organizerID)
    givenRating = request.json["rating"]
    rating = UserRatings.query.filter_by(userID=userid, eventID=eventid).first()
    if rating is None:
        exists = (
            db.session.query(event_attendance)
            .filter(
                event_attendance.c.userID == userid,
                event_attendance.c.eventID == eventid,
            )
            .first()
        )
        if not exists:
            return jsonify({"error": "user not registered for this event"}), 404
        rating_val = givenRating
        new_rating = UserRatings(userid, eventid, rating_val)
        event.rating = (event.rating * event.numReviewers + givenRating) / (
            event.numReviewers + 1
        )
        host.rating = (host.rating * host.numReviewers + givenRating) / (
            host.numReviewers + 1
        )

        event.numReviewers = event.numReviewers + 1
        host.numReviewers = host.numReviewers + 1

        # add to db
        db.session.add(new_rating)
        db.session.commit()
    else:
        event.rating = (
            event.rating * event.numReviewers - rating.ratingValue + givenRating
        ) / event.numReviewers
        host.rating = (
            host.rating * host.numReviewers - rating.ratingValue + givenRating
        ) / host.numReviewers
        rating.ratingValue = givenRating
        db.session.commit()

    return jsonify({"status": "updated rating"})


@app.route("/api/setPrivacy", methods=["POST"])
def set_privacy():
    """Sets the privacy settings of the user with the given id

    Returns:
        json: json object with field status or 404 if no user exists
    """
    id = request.json["id"]
    showContactInfo = request.json["showContactInfo"]
    showRegisteredEvents = request.json["showRegisteredEvents"]
    user = db.get_or_404(User, id)

    user.showContactInfo = showContactInfo
    user.showRegisteredEvents = showRegisteredEvents
    db.session.commit()

    return jsonify({"status": "updated privacy"})


@app.route("/api/setEmail", methods=["POST"])
def set_email():
    """Sets the email of the user with the given id

    Returns:
        json: json object with field status or 404 if no user exists or 400 if an
         email is already in use
    """
    id = request.json["id"]
    email = request.json["email"]
    user = db.get_or_404(User, id)

    otherUser = User.query.filter_by(email=email).first()
    if otherUser is not None and otherUser != user:
        return jsonify({"error": "email already in use"}), 400
    user.email = email
    db.session.commit()

    return jsonify({"status": "updated email"})


@app.route("/api/setLastname", methods=["POST"])
def set_lastname():
    """Sets the last name of the user with the given id

    Returns:
        json: json object with field status or 404 if no user exists
    """
    id = request.json["id"]
    lastname = request.json["lastname"]
    user = db.get_or_404(User, id)

    user.lastname = lastname
    db.session.commit()

    return jsonify({"status": "updated last name"})


@app.route("/api/setFirstname", methods=["POST"])
def set_firstname():
    """Sets the first name of the user with the given id

    Returns:
        json: json object with field status or 404 if no user exists
    """
    id = request.json["id"]
    firstname = request.json["firstname"]
    user = db.get_or_404(User, id)

    user.firstname = firstname
    db.session.commit()

    return jsonify({"status": "updated first name"})


@app.route("/api/setPhone", methods=["POST"])
def set_phone():
    """Sets the phone number of the user with the given id

    Returns:
        json: json object with field status or 404 if no user exists or 400
        if a phone number is already in use
    """
    id = request.json["id"]
    phone = request.json["phone"]
    user = db.get_or_404(User, id)

    otherUser = User.query.filter_by(phonenumber=phone).first()
    if otherUser is not None and otherUser != user:
        return jsonify({"error": "phone number is already in use"}), 400

    user.phonenumber = phone

    db.session.commit()

    return jsonify({"status": "updated phone"})


@app.route("/api/users/<userid>/isSubscribedTo/<otherid>", methods=["POST"])
def is_subscribed_to(userid, otherid):
    """Checks if the user with the given id is subscribed to the other user
    with the given id

    Returns:
        json: json object with field result set to True if the user is
        subscribed to the other user, False otherwise
    """
    user = db.get_or_404(User, userid)
    otheruser = db.get_or_404(User, otherid)
    if otheruser in user.subscribed_to_users:
        return jsonify({"result": True})
    else:
        return jsonify({"result": False})


@app.route("/api/setInterests", methods=["POST"])
def set_interests():
    """Sets the interests of the user with the given id

    Returns:
        json: json object with field status or 404 if no user exists
    """
    id = request.json["id"]
    interests = request.json["interests"]
    user = db.get_or_404(User, id)

    user.interests = str(interests)

    db.session.commit()

    return jsonify({"status": "updated interests"})


@app.route("/api/setAvatar", methods=["POST"])
def set_avatar():
    """Sets the avatar of the user with the given id

    Returns:
        json: json object with field status or 404 if no user exists
    """
    id = request.json["id"]
    avatar = request.json["avatar"]
    user = db.get_or_404(User, id)

    user.userImg = avatar

    db.session.commit()

    return jsonify({"status": "updated avatar"})


@app.route("/api/register", methods=["POST"])
def register():
    """registers a user with the provided fields

    Returns:
        json: A JSON response containing a greeting message and the user's ID if
        the registration is successful or 400 status code.
    """
    email = request.json["email"]
    password = request.json["password"]
    firstname = request.json["firstname"]
    lastname = request.json["lastname"]
    phonenumber = request.json["phonenumber"]
    interests = str(request.json["interests"])

    user = User.query.filter_by(email=email).first()
    if user is not None:  # An account with this email exists
        return jsonify({"error": "User with this email already exists"}), 400

    user = User.query.filter_by(phonenumber=phonenumber).first()
    if user is not None:  # An account with this phonenumber exists
        return jsonify({"error": "User with this phone number already exists"}), 400

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

    return jsonify({"greeting": "Welcome, " + newaccount.firstname}), 201


# route /events/<id> to get a specific event
@app.route("/api/events/<id>", methods=["GET"])
def get_event(id):
    """Gets the event with the given id

    Args:
        id (int): event id of the event being requested

    Returns:
        json: json object with event fields or 404 if no event exists
    """
    event = Event.query.filter_by(id=id).first()
    if event is not None:
        # print("timezone is:", event.eventStart.tzname())
        event.eventStart = event.eventStart.astimezone(eastern)
        event.eventEnd = event.eventEnd.astimezone(eastern)
        return jsonify(event.serialize()), 200
    return jsonify({"error": "Event not found"}), 404


@app.route("/api/events/new", methods=["POST"])
def create_event():
    """Creates a new event with the provided event fields

    Returns:
        json: json object with event id field or 400 if invalid event fields are provided
    """
    n = request.json
    eventName = n["eventName"]
    if not eventName or eventName == "":
        return jsonify({"Error": "Please enter a valid event name"}), 400

    organizerID = n["organizerID"]
    if not organizerID:
        return jsonify({"Error": "Please log in first!"}), 400

    date_format = "%Y-%m-%d %H:%M"
    if not n["eventDate"] or not n["eventStart"] or not n["eventEnd"]:
        return jsonify({"Error": "Please enter a valid date and time"}), 400

    eventStart = eastern.localize(
        datetime.strptime(n["eventDate"] + " " + n["eventStart"], date_format)
    )
    eventEnd = eastern.localize(
        datetime.strptime(n["eventDate"] + " " + n["eventEnd"], date_format)
    )

    eventBuilding = n["building"]
    eventRoom = n["room"]
    if not eventBuilding or not eventRoom or eventBuilding == "" or eventRoom == "":
        return jsonify({"Error": "Please enter a valid location"}), 400

    oneLiner = n["oneLiner"]
    if not oneLiner or oneLiner == "":
        return jsonify({"Error": "Please enter a valid one-liner"}), 400

    eventDesc = n["description"]
    eventImg = n["image"]
    eventTags = str(n["tags"])

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
        eventCategories=eventTags,
    )

    db.session.add(newevent)
    db.session.commit()
    return jsonify({"event_id": newevent.id})


@app.route("/api/events/<eventid>/register/<userid>", methods=["POST"])
def register_event(eventid, userid):
    """Registers the user with the given id for the event with the given id

    Args:
        eventid (int): event id of the event being registered for
        userid (int): user id of the user registering for the event

    Returns:
        json: json object with event fields or 404 if no event or user exists
    """
    event = db.get_or_404(Event, eventid)
    user = db.get_or_404(User, userid)
    event.users.append(user)
    event.registered += 1
    db.session.commit()
    return jsonify(event.serialize())


@app.route("/api/events/<eventid>/unregister/<userid>", methods=["POST"])
def unregister_event(eventid, userid):
    """Unregisters the user with the given id for the event with the given id

    Args:
        eventid (int): event id of the event being unregistered for
        userid (int): user id of the user unregistering for the event

    Returns:
        json: json object with event fields or 404 if no event or user exists

    """
    event = db.get_or_404(Event, eventid)
    user = db.get_or_404(User, userid)
    event.users.remove(user)
    event.registered -= 1
    db.session.commit()
    return jsonify(event.serialize())


@app.route("/api/events/all", methods=["GET"])
def get_events():
    """Gets all events

    Returns:
        json: array of json objects with event fields
    """
    events = Event.query.all()
    return jsonify([e.serialize() for e in events])


@app.route("/api/events/<eventid>/update", methods=["POST"])
def update_event(
    eventid,
    eventName,
    organizerID,
    eventStart,
    eventEnd,
    eventBuilding,
    eventRoom,
    oneLiner,
    eventDesc,
    eventImg,
    eventImgType,
    eventCategories,
):
    """Updates the event with the given id with the provided event fields

    Args:
        eventid (int): event id of the event being updated
        eventName (string): new name of the event
        organizerID (int): id of the organizer of the event
        eventStart (string): new start time of the event
        eventEnd (string): new end time of the event
        eventBuilding (string): building where the event is held
        eventRoom (string): room where the event is held
        oneLiner (string): one liner description of the event
        eventDesc (string): description of the event
        eventImg (bytes): image of the event
        eventImgType (string): type of the image
        eventCategories (list): list of categories for the event

    Returns:
        json: json object with updated event fields
    """
    event = Event.query.filter_by(id=eventid).first()
    event.name = eventName
    event.organizer_id = organizerID
    event.start_time = eventStart
    event.end_time = eventEnd
    event.building = eventBuilding
    event.room = eventRoom
    event.one_liner = oneLiner
    event.description = eventDesc
    event.image = eventImg
    event.image_type = eventImgType
    event.categories = eventCategories
    db.session.commit()
    return jsonify(event.serialize())


@app.route("/api/events/<eventid>/delete", methods=["POST"])
def delete_event(eventid):
    """Deletes the event with the given id

    Args:
        eventid (int): event id of the event being deleted

    Returns:
        json: json object with field result set to "deleted"
    """
    event = Event.query.filter_by(id=eventid).first()
    db.session.delete(event)
    db.session.commit()
    return jsonify({"result": "deleted"})


@app.route("/api/users/<userid>/events", methods=["GET"])
def get_registered_events(userid):
    """Gets the events that the user with the given id is registered for

    Args:
        userid (int): user id of the user whose registered events are being requested

    Returns:
        json: array of json objects with event fields
    """
    user = User.query.filter_by(id=userid).first()
    events = user.events
    return jsonify([e.serialize() for e in events])


@app.route("/api/events/<eventid>/registered", methods=["GET"])
def get_registered_users(eventid):
    """Gets the users that are registered for the event with the given id

    Args:
        eventid (int): event id of the event whose registered users are being requested

    Returns:
        json: array of json objects with user fields

    """
    event = Event.query.filter_by(id=eventid).first()
    users = event.users
    return jsonify([u.serialize() for u in users])


# route get events by date
@app.route("/api/events/dates", methods=["GET"])
def get_events_by_date(date):
    """Gets the events that are on the given date

    Args:
        date (string): date of the events being requested

    Returns:
        json: array of json objects with event fields
    """
    events = Event.query.filter_by(date=date).all()
    return jsonify([e.serialize() for e in events])


@app.route("/api/events/location", methods=["GET"])
def get_events_by_location(location):
    """Gets the events that are in the given location

    Args:
        location (string): location of the events being requested

    Returns:
        json: array of json objects with event fields
    """
    events = Event.query.filter_by(location=location).all()
    return jsonify([e.serialize() for e in events])


@app.route("/api/events/interest", methods=["GET"])
def get_events_by_interest(interest):
    """Gets the events that have the given interest

    Args:
        interest (string): interest of the events being requested

    Returns:
        json: array of json objects with event fields
    """
    events = Event.query.filter(Event.interests.like("%" + interest + "%")).all()
    return jsonify([e.serialize() for e in events])


@app.route("/events/category", methods=["GET"])
def get_events_by_category(category):
    """Gets the events that have the given category

    Args:
        category (string): category of the events being requested

    Returns:
        json: array of json objects with event fields
    """
    events = Event.query.filter(Event.categories.any(name=category)).all()
    return jsonify([e.serialize() for e in events])


@app.route("/api/users/<userid>/events", methods=["POST"])
def get_events_by_user(userid):
    """Gets the events that are organized by the user with the given id

    Args:
        userid (int): user id of the user whose organized events are being requested

    Returns:
        json: array of json objects with event fields
    """
    request_value = request.json
    requesting_user = request_value["myID"]
    user = User.query.filter_by(id=userid).first()
    final = []
    if (
        not user.showRegisteredEvents
        and userid != requesting_user
        and request_value["option"] == "Attending"
    ):
        return jsonify(final)
    events = (
        user.registeredEvents
        if request_value["option"] == "Attending"
        else user.organizedEvents
    )

    if request_value["showPastEvents"]:
        for event in events:
            final.append(event.serialize())

    else:
        for event in events:
            dt = datetime.now()
            if dt <= event.eventEnd:
                final.append(event.serialize())

    return jsonify(final)


@app.route("/api/search", methods=["GET"])
@cross_origin()
def search():
    """Searches for events based on the query and filters

    Returns:
        json: array of json objects with event fields
    """
    query = request.args.get("searchbar")
    location_filters = request.args.get("filters").split(",")
    if location_filters[0] == "":
        location_filters = []
    filtered_results = []
    if query != "" and len(location_filters) != 0:
        filtered_results = Event.query.filter(
            Event.eventBuilding.in_(location_filters), Event.eventName.contains(query)
        ).all()
    elif len(location_filters) != 0:
        filtered_results = Event.query.filter(
            Event.eventBuilding.in_(location_filters)
        ).all()
    elif len(location_filters) == 0 and query != "":
        filtered_results = Event.query.filter(Event.eventName.contains(query)).all()
    else:
        filtered_results = Event.query.all()

    return jsonify([e.serialize() for e in filtered_results])
