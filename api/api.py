"""
This file contains the API endpoints for the backend.
"""
import os
from re import T
from flask import Flask, request, jsonify, session
from flask_cors import CORS, cross_origin
import bcrypt
from Configuration import Configuration
from schemas import db, event_attendance, User, Event, UserRatings
from utils.emails.mailing import Mailer, format_email
import bcrypt
from datetime import datetime, timedelta
import pytz
from sqlalchemy import or_, func
import random
import ast
import json

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/api/*": {"origins": ["https://premiumpotatoes-4fb5418fe273.herokuapp.com", "https://www.beaver-buzz.ca"]}
    },
)
app.config.from_object(Configuration)
app.config["CORS_HEADERS"] = "Content-Type"
db.init_app(app)

with app.app_context():
    db.create_all()

utc = pytz.UTC
est = pytz.timezone("US/Eastern")


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
    if user is None or not bcrypt.checkpw(
        password.encode("utf-8"), user.password.encode("utf-8")
    ):
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
        return (
            jsonify({"error": "Rating does not exist for this event by this user."}),
            404,
        )
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
    if otherUser is not None and otherUser != user and phone is not None:
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
    if user is not None and user.phonenumber is not None:  # An account with this phonenumber exists
        return jsonify({"error": "User with this phone number already exists"}), 400

    passwordHash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode(
        "utf-8"
    )

    print(passwordHash)

    newaccount = User(
        email=email,
        password=passwordHash,
        firstname=firstname,
        lastname=lastname,
        phonenumber=phonenumber,
        interests=interests,
    )

    mailer = Mailer('smtp.gmail.com', 465, (os.environ.get('GMAIL_LOGIN'), os.environ.get('GMAIL_APP_PWD')))
    subject = 'Registration Confirmation'
    i_list = [i['name'] for i in request.json["interests"]]
    i_list = str(i_list).translate({ord(i): None for i in "'[]"})
    html = open('./utils/emails/registration.html').read().format(
            subject=subject,firstname=firstname,lastname=lastname,
            email=email,phonenumber=phonenumber,interests=i_list,
            potatoemail=mailer.sender)
    msg = format_email(mailer.sender, email, subject, html)
    mailer.send_mail(email,msg.as_string())
    mailer.kill()

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
        user = db.get_or_404(User, event.organizerID)
        # print("timezone is:", event.eventStart.tzname())
        event.eventStart = event.eventStart
        event.eventEnd = event.eventEnd
        results = event.serialize()
        results["organizerName"] = str(user.firstname) + " " + str(user.lastname)
        results["attendeeList"] = [int(id) for user in event.users]
        if event.eventCategories is not None:
            results["eventCategories"] = ast.literal_eval(event.eventCategories)
        return jsonify(results), 200
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

    eventStart = utc.localize(
        datetime.strptime(n["eventDate"] + " " + n["eventStart"], date_format)
    )

    eventEnd = utc.localize(
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

    mailer = Mailer('smtp.gmail.com', 465, (os.environ.get('GMAIL_LOGIN'), os.environ.get('GMAIL_APP_PWD')))
    subject = 'Event Registration Confirmation'
    html = open('./utils/emails/event_registration.html').read().format(
            subject=subject, event_name=event.eventName, 
            event_date=event.eventStart, 
            event_loc=event.eventBuilding + ', ' + event.eventRoom)
    msg = format_email(mailer.sender, user.email, subject, html)
    mailer.send_mail(user.email,msg.as_string())
    mailer.kill()

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


# TODO: below functions to be further implemented and used by Vishnu and Tracy for discover page
@app.route("/api/events/all", methods=["GET"])
def get_events():
    """Gets all events

    Returns:
        json: array of json objects with event fields
    """
    events = Event.query.all()
    return jsonify([e.serialize() for e in events])


@app.route("/api/events/<eventid>/update", methods=["POST"])
def updateEvent(eventid):
    """Updates the event with the given id with the provided event fields

    Args:
        eventid (int): event id of the event being updated

    Returns:
        json: json object with the event id
    """
    n = request.json

    event = Event.query.filter_by(id=eventid).first()

    date_format = "%Y-%m-%d %H:%M"
    eventStart = utc.localize(
        datetime.strptime(n["eventDate"] + " " + n["eventStart"], date_format)
    )
    eventEnd = utc.localize(
        datetime.strptime(n["eventDate"] + " " + n["eventEnd"], date_format)
    )

    event.eventName = n["eventName"]
    event.eventStart = eventStart
    event.eventEnd = eventEnd
    event.eventBuilding = n["building"]
    event.eventRoom = n["room"]
    event.oneLiner = n["oneLiner"]
    event.eventDesc = n["description"]
    if n["image"] is not False:
        event.eventImg = n["image"]
    event.eventCategories = str(n["eventCategories"])
    db.session.commit()
    return jsonify({"event_id": event.id})


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
            dt = datetime.now(est).replace(tzinfo=utc)
            if dt <= event.eventEnd:
                final.append(event.serialize())

    return jsonify(final)


@app.route("/api/allevents", methods=["GET"])
@cross_origin()
def allevents():
    """
    Returns all events for initialization purposes. search() function is used when a search is executed.
    """
    current_time = datetime.now(est).replace(tzinfo=utc)
    results = [e.serialize() for e in Event.query.filter(Event.eventStart > current_time).all()]
    users = User.query.all()
    users_dict = {}
    for u in users:
        users_dict[u.id] = u.firstname + " " + u.lastname
    for result in results:
        result["display_time"] = str(result["eventStart"].time().strftime("%I:%M %p"))
        if result["organizerID"] in users_dict:
            name = users_dict[result["organizerID"]]
            result["organizerName"] = name
        else:
            u = User.query.get(result["organizerID"])
            result["organizerName"] = u.firstname + " " + u.lastname
    return jsonify(results)


@app.route("/api/search", methods=["GET"])
@cross_origin()
def search():
    """
    This function conducts the search operation. This includes search by query, filter, organizer name, and searching for tag in search bar.
    """
    query = request.args.get("searchbar")
    location_filters = request.args.get("filters")
    # c_user = request.args.get('userid')
    # NEED TO IMPLEMENT USER EVENT INTERESTS
    # curr_user = User.query.filter_by(id=c_user).first()
    # curr_user_interests = curr_user.interests.split(',')

    eventtags = [
        "Academic",
        "Sports",
        "Science",
        "Math",
        "Technology",
        "Engineering",
        "Students",
        "Arts",
        "Music",
        "Games",
        "Career",
        "Food",
    ]

    if location_filters:
        location_filters = location_filters.split(",")
    else:
        location_filters = []
    org_filter = request.args.get("Organizer")
    if query == None:
        query = ""
    temp_q = query.capitalize().split(" ")
    if org_filter:
        if len(temp_q) > 1:
            fn = temp_q[0]
            ln = temp_q[1]
        else:
            fn = temp_q[0]
            ln = temp_q[0]
    if not org_filter:
        org_filter = False
    print("ORGANIZER")
    print(org_filter)
    print("QUERY")
    print(query)
    filtered_results = []
    users_dict = {}
    current_time = datetime.now(est).replace(tzinfo=utc)
    # Both Query and Filters
    if query != "" and len(location_filters) != 0:
        if org_filter is False:
            if query.capitalize() not in eventtags:
                filtered_results = Event.query.filter(
                    or_(
                        *[
                            Event.eventCategories.contains(location_filters[i])
                            for i in range(len(location_filters))
                        ]
                    ),
                    func.lower(Event.eventName).contains(query.lower()),
                    Event.eventStart > current_time
                ).all()
            else:
                filtered_results = Event.query.filter(
                    or_(
                        *[
                            Event.eventCategories.contains(location_filters[i])
                            for i in range(len(location_filters))
                        ]
                    ),
                    Event.eventCategories.contains(query.capitalize()),
                    Event.eventStart > current_time
                ).all()
        else:
            if fn == ln:
                users = User.query.filter(
                    or_(func.lower(User.firstname).contains(fn.lower()), func.lower(User.lastname).contains(ln))
                ).all()
            else:
                users = User.query.filter(
                    func.lower(User.firstname).contains(fn.lower()), func.lower(User.lastname).contains(ln.lower())
                ).all()

            user_ids = [user.id for user in users]
            for u in users:
                users_dict[u.id] = u.firstname + " " + u.lastname

            filtered_results = Event.query.filter(
                or_(
                    *[
                        Event.eventCategories.contains(location_filters[i])
                        for i in range(len(location_filters))
                    ]
                ),
                Event.organizerID.in_(user_ids),
                Event.eventStart > current_time
            ).all()

    # No Query and Have Filter
    elif len(location_filters) != 0:
        filtered_results = Event.query.filter(
            or_(
                *[
                    Event.eventCategories.contains(location_filters[i])
                    for i in range(len(location_filters))
                ]
            ),
            Event.eventStart > current_time,
        ).all()

    # Query but no Filter
    elif len(location_filters) == 0 and query != "":
        if org_filter is False:
            if query.capitalize() not in eventtags:
                filtered_results = Event.query.filter(
                    func.lower(Event.eventName).contains(query.lower()),
                    Event.eventStart > current_time
                ).all()
            else:
                filtered_results = Event.query.filter(
                    Event.eventCategories.contains(query.capitalize()),
                    Event.eventStart > current_time
                ).all()
        else:
            if fn == ln:
                users = User.query.filter(
                    or_(func.lower(User.firstname).contains(fn.lower()), func.lower(User.lastname).contains(ln.lower()))
                ).all()
            else:
                users = User.query.filter(
                    func.lower(User.firstname).contains(fn.lower()), func.lower(User.lastname).contains(ln.lower())
                ).all()

            user_ids = [user.id for user in users]
            for u in users:
                users_dict[u.id] = u.firstname + " " + u.lastname

            filtered_results = Event.query.filter(Event.organizerID.in_(user_ids),Event.eventStart > current_time).all()
    else:
        filtered_results = Event.query.filter(Event.eventStart > current_time).all()
    results = [e.serialize() for e in filtered_results]
    for result in results:
        result["display_time"] = str(result["eventStart"].time().strftime("%I:%M %p"))
        if result["organizerID"] in users_dict:
            name = users_dict[result["organizerID"]]
            result["organizerName"] = name
        else:
            u = User.query.get(result["organizerID"])
            result["organizerName"] = u.firstname + " " + u.lastname
    return jsonify(results)
