import time
import os
from flask import Flask, render_template, request, url_for, redirect
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, DateTimeField, IntegerField
from wtforms.validators import DataRequired, Email
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from flask_bootstrap import Bootstrap

# Set up a database file path
basedir = os.path.abspath(os.path.dirname(__file__))

# instantiate flask app
app = Flask(__name__)
app.config["SECRET_KEY"] = "hard to guess string"
# replace URI with postgresql://username:password@host:port/database_name during demo
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(
    basedir, "database.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# connect app to database
db = SQLAlchemy(app)

# add bootstrap
bootstrap = Bootstrap(app)

# Database Models
# Tracks users and which events they've signed up for
event_attendance = db.Table(
    "event_attendance",
    db.Column("userID", db.Integer, db.ForeignKey("user.id")),
    db.Column("eventID", db.Integer, db.ForeignKey("event.id")),
)


# Model for user
class User(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    firstName = db.Column(db.String(100), nullable=False)
    lastName = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(80), unique=True, nullable=False)
    phoneNumber = db.Column(db.Unicode(20))
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    interests = db.Column(db.Text)
    # events that this person has organized (1 to many relationship)
    organizedEvents = db.relationship("Event", backref="user")
    # events that this person is attending
    registeredEvents = db.relationship(
        "Event", secondary=event_attendance, backref="users"
    )

    def __init__(self, firstName, lastName, email, phoneNumber=None, interests=None):
        self.firstName = firstName
        self.lastName = lastName
        self.email = email
        self.phoneNumber = phoneNumber
        self.interests = interests

    def __repr__(self):
        return f"<Student {self.firstName}, {self.lastName}>"


# Model for Event
class Event(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    organizerID = db.Column(db.Integer, db.ForeignKey("user.id"))
    eventName = db.Column(db.String(100), nullable=False)
    eventStart = db.Column(db.DateTime(timezone=True), nullable=False)
    eventEnd = db.Column(db.DateTime(timezone=True), nullable=False)
    eventLocation = db.Column(db.String(100), nullable=False)
    oneLiner = db.Column(db.String(80), nullable=False)
    eventDesc = db.Column(db.Text)
    eventImg = db.Column(db.Text)
    eventImgType = db.Column(db.Text)

    def __init__(
        self,
        eventName,
        organizerID,
        eventStart,
        eventEnd,
        eventLocation,
        oneLiner,
        eventDesc=None,
        eventImg=None,
        eventImgType=None,
    ):
        self.eventName = eventName
        self.organizerID = organizerID
        self.eventStart = eventStart
        self.eventEnd = eventEnd
        self.eventLocation = eventLocation
        self.oneLiner = oneLiner
        self.eventDesc = eventDesc
        self.eventImg = eventImg
        self.eventImgType = eventImgType

    def __repr__(self):
        return f"<Event {self.eventName}>"


# Temporary form - only for demonstrating the database. should be removed once login/registration is implemented
class UserForm(FlaskForm):
    firstname = StringField("What is your first name?", validators=[DataRequired()])
    lastname = StringField("What is your last name?", validators=[DataRequired()])
    email = StringField(
        "What is your Email address?", validators=[DataRequired(), Email()]
    )
    phone = StringField("What is your phone number?", validators=[DataRequired()])
    interests = StringField("What are your interests?")
    submit = SubmitField("Submit")


# Temporary form - only for demonstrating the database. should be removed once login/registration is implemented
class EventForm(FlaskForm):
    eventname = StringField("What is the Event Name?", validators=[DataRequired()])
    organizer = IntegerField(
        "What is the Organizer ID for this event?", validators=[DataRequired()]
    )
    eventstart = DateTimeField(
        "When does the event start?", validators=[DataRequired()]
    )
    eventend = DateTimeField("When does the event end?", validators=[DataRequired()])
    eventlocation = StringField(
        "Where is the event located?", validators=[DataRequired()]
    )
    oneliner = StringField("Event One-Liner", validators=[DataRequired()])
    eventdesc = StringField("What is the event description?")
    submit = SubmitField("Submit")


# create db on app start
with app.app_context():
    db.create_all()


@app.route("/")
def main():
    return "Hello World"


@app.route("/time")
def get_current_time():
    return {"time": time.time()}


@app.route("/user", methods=["GET", "POST"])
def user():
    form = UserForm()
    if form.validate_on_submit():
        user = User(
            form.firstname.data,
            form.lastname.data,
            form.email.data,
            form.phone.data,
            form.interests.data,
        )

        db.session.add(user)
        db.session.commit()
        return redirect(url_for("user"))
    return render_template("user.html", form=form)


@app.route("/event", methods=["GET", "POST"])
def event():
    form = EventForm()
    if form.validate_on_submit():
        event = Event(
            form.eventname.data,
            form.organizer.data,
            form.eventstart.data,
            form.eventend.data,
            form.eventlocation.data,
            form.oneliner.data,
            form.eventdesc.data,
        )
        db.session.add(event)
        db.session.commit()
        return redirect(url_for("event"))
    return render_template("event.html", form=form)


@app.route("/show_all")
def show_all():
    return render_template(
        "show_all.html", users=User.query.all(), events=Event.query.all()
    )


# @app.errorhandler(404)
# def page_not_found(e):
#     return render_template("404.html"), 404


# @app.errorhandler(500)
# def page_not_found(e):
#     return render_template("500.html"), 500
