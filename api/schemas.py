from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func

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
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    interests = db.Column(db.Text)
    userImg = db.Column(db.Text)
    userImgType = db.Column(db.Text)
    # events that this person has organized (1 to many relationship)
    organizedEvents = db.relationship("Event", backref="user")
    # events that this person is attending
    registeredEvents = db.relationship(
        "Event", secondary=event_attendance, backref="users"
    )
    # users that this person is subscribed to
    subscribed_to_users = db.relationship(
        "User", secondary=user_subscribed_to, backref="subscribers"
    )

    def __init__(
        self,
        password,
        firstname,
        lastname,
        email,
        phonenumber=None,
        interests=None,
        userImg=None,
        userImgType=None,
    ):
        self.password = password
        self.firstname = firstname
        self.lastname = lastname
        self.email = email
        self.phonenumber = phonenumber
        self.interests = interests
        self.userImg = userImg
        self.userImgType = userImgType

    def __repr__(self):
        return f"<Student {self.firstname}, {self.lastname}>"

    def serialize(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

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
    eventCategories = db.Column(db.Text)
    registered = db.Column(db.Integer, default=0)

    def __init__(
        self,
        eventName,
        organizerID,
        eventStart,
        eventEnd,
        eventBuilding,
        eventRoom,
        oneLiner,
        eventDesc=None,
        eventImg=None,
        eventImgType=None,
        eventCategories=None,
    ):
        self.eventName = eventName
        self.organizerID = organizerID
        self.eventStart = eventStart
        self.eventEnd = eventEnd
        self.eventBuilding = eventBuilding
        self.eventRoom = eventRoom
        self.oneLiner = oneLiner
        self.eventDesc = eventDesc
        self.eventImg = eventImg
        self.eventImgType = eventImgType
        self.eventCategories = eventCategories

    def __repr__(self):
        return f"<Event {self.eventName}>"

    def serialize(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
