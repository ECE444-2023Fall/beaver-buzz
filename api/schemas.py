from datetime import datetime

from flask_sqlalchemy import SQLAlchemy
from pytz import timezone

tz = timezone("US/Eastern")

db = SQLAlchemy()


# Tracks users and which events they've signed up for
# Tracks event attendance
event_attendance = db.Table(
    "event_attendance",
    db.Column("userID", db.Integer, db.ForeignKey("users.id")),
    db.Column("eventID", db.Integer, db.ForeignKey("events.id")),
)

# Tracks who a user is subscribed to
# Many-to-many relationship
user_subscribed_to = db.Table(
    "user_subscribed_to",
    db.Column("userID", db.Integer, db.ForeignKey("users.id")),
    db.Column("subscriberID", db.Integer, db.ForeignKey("users.id")),
)


# Database Schema for User model
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    password = db.Column(db.String(512), nullable=False)
    firstname = db.Column(db.String(100), nullable=False)
    lastname = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(80), unique=True, nullable=False)
    phonenumber = db.Column(db.Unicode(20))
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.now(tz))
    interests = db.Column(db.Text)
    userImg = db.Column(db.Text)
    userImgType = db.Column(db.Text)
    # events that this person has organized (1 to many relationship)
    organizedEvents = db.relationship("Event", backref="user")
    showContactInfo = db.Column(db.Boolean, default=True)
    showRegisteredEvents = db.Column(db.Boolean, default=True)

    # events that this person is attending
    registeredEvents = db.relationship(
        "Event", secondary=event_attendance, backref="users"
    )
    # users that this person is subscribed to
    subscribed_to_users = db.relationship(
        "User",
        secondary=user_subscribed_to,
        primaryjoin=(user_subscribed_to.c.userID == id),
        secondaryjoin=(user_subscribed_to.c.subscriberID == id),
        backref=db.backref("subscribers", lazy="dynamic"),
        lazy="dynamic",
    )
    # reference user's subscribers with user.subscribed_to_users.all()
    # reference people who have subscribed to user with user.subscribers.all()

    # Rating value from 0-5 for all of this user's events.
    # numReviewers stores the total number of reviews on all events hosted by this user
    rating = db.Column(db.Float, default=0.0)
    numReviewers = db.Column(db.Integer, default=0)

    def __init__(
        self,
        password,
        firstname,
        lastname,
        email,
        phonenumber=None,
        interests=None,
        user_img=None,
        user_img_type=None,
    ):
        self.password = password
        self.firstname = firstname
        self.lastname = lastname
        self.email = email
        self.phonenumber = phonenumber
        self.interests = interests
        self.userImg = user_img
        self.userImgType = user_img_type

    def __repr__(self):
        return f"<Student {self.firstname}, {self.lastname}>"

    def serialize(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


# Database Schema for Event Model
class Event(db.Model):
    __tablename__ = "events"
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    organizerID = db.Column(db.Integer, db.ForeignKey("users.id"))
    eventName = db.Column(db.String(100), nullable=False)
    eventStart = db.Column(db.DateTime(timezone=True), nullable=False)
    eventEnd = db.Column(db.DateTime(timezone=True), nullable=False)
    eventBuilding = db.Column(db.String(100), nullable=False)
    eventRoom = db.Column(db.String(100), nullable=False)
    oneLiner = db.Column(db.String(80), nullable=False)
    eventDesc = db.Column(db.Text)
    eventImg = db.Column(db.Text)
    eventImgType = db.Column(db.Text)
    eventCategories = db.Column(db.Text)  # tags
    # Rating value from 0-5 for a given event. numReviewers stores the number of people who have made a review
    rating = db.Column(db.Float, default=0.0)
    numReviewers = db.Column(db.Integer, default=0)
    # number of registered attendees
    registered = db.Column(db.Integer, default=0)

    def __init__(
        self,
        event_name,
        organizer_id,
        event_start,
        event_end,
        event_building,
        event_room,
        one_liner,
        event_desc=None,
        event_img=None,
        event_img_type=None,
        event_categories=None,
    ):
        self.eventName = event_name
        self.organizerID = organizer_id
        self.eventStart = event_start
        self.eventEnd = event_end
        self.eventBuilding = event_building
        self.eventRoom = event_room
        self.oneLiner = one_liner
        self.eventDesc = event_desc
        self.eventImg = event_img
        self.eventImgType = event_img_type
        self.eventCategories = event_categories

    def __repr__(self):
        return f"<Event {self.eventName}>"

    def serialize(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


# Tracks a user's ratings for each event
class UserRatings(db.Model):
    __tablename__ = "User Ratings"
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    userID = db.Column(db.Integer, db.ForeignKey("users.id"))
    eventID = db.Column(db.Integer, db.ForeignKey("events.id"))
    ratingValue = db.Column(db.Integer, nullable=False)

    def __init__(self, user_id, event_id, rating_value):
        self.userID = user_id
        self.eventID = event_id
        self.ratingValue = rating_value

    def __repr__(self):
        return f"<Rating by userID: {self.userID}, for eventID: {self.eventID}, rating: {self.ratingValue}>"

    def serialize(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
