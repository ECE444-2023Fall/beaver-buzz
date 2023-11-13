import pytest
from pathlib import Path
from schemas import db, User, Event
from api import app
import datetime

TEST_DB = "test.db"
BASE_DIR = Path(__file__).resolve().parent

"""Unit test functions made to initialize and test the database"""
"""Made by Himanish Jindal"""


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["DATABASE"] = BASE_DIR.joinpath(TEST_DB)
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{BASE_DIR.joinpath(TEST_DB)}"

    with app.app_context():
        db.create_all()  # setup
        yield app.test_client()  # tests run here
        db.drop_all()  # teardown


# check if database exists
def test_database(client):
    """initial test. ensure that the database exists"""
    tester = Path(f"{BASE_DIR.joinpath(TEST_DB)}").is_file()
    assert tester


# check if database is empty
def test_empty_db(client):
    """Ensure database is blank"""
    users = User.query.all()
    events = Event.query.all()
    assert not users and not events


# check if adding new user to database works
def test_add_user(client):
    """Add user to database and ensure database is updated"""
    new_user = User(
        email="jhimanish@gmail.com",
        password="password",
        firstname="Himanish",
        lastname="Jindal",
        phonenumber="4167211873",
        interests="thriller movies",
    )
    db.session.add(new_user)
    db.session.commit()

    # check if user exists
    user = User.query.filter_by(email="jhimanish@gmail.com").first()
    assert user == new_user


# check if adding new event to database works
def test_add_event(client):
    """Add event to database and ensure database is updated"""
    # new user is needed as event has a field for organizer (foreign relational key to user)
    new_user = User(
        email="jhimanish@gmail.com",
        password="password",
        firstname="Himanish",
        lastname="Jindal",
        phonenumber="4167211873",
        interests="thriller movies",
    )
    new_event = Event(
        eventName="Event 1",
        organizerID=new_user.id,
        eventStart=datetime.datetime(2023, 10, 29, 18, 00, 00, 00),
        eventEnd=datetime.datetime(2023, 10, 29, 20, 00, 00, 00),
        eventBuilding="Galbraith",
        eventRoom="339",
        oneLiner="One Liner of event",
        eventDesc="Description of Event",
    )
    db.session.add(new_user)
    db.session.add(new_event)
    db.session.commit()

    # check if event exists
    event = Event.query.filter_by(eventName="Event 1").first()
    assert event == new_event


# check if event attendance works properly with the event_attendance table
def test_event_attendance(client):
    # Creating test users and test event
    new_user1 = User(
        email="jhimanish@gmail.com",
        password="password",
        firstname="Himanish",
        lastname="Jindal",
        phonenumber="4167211873",
        interests="thriller movies",
    )
    new_user2 = User(
        email="test@gmail.com",
        password="password",
        firstname="Himanish",
        lastname="Jindal",
        phonenumber="4167211873",
        interests="science movies",
    )
    new_event = Event(
        eventName="Event 1",
        organizerID=new_user1.id,
        eventStart=datetime.datetime(2023, 10, 29, 18, 00, 00, 00),
        eventEnd=datetime.datetime(2023, 10, 29, 20, 00, 00, 00),
        eventBuilding="Galbraith",
        eventRoom="339",
        oneLiner="One Liner of event",
        eventDesc="Description of Event",
    )

    # Adding event to both users' registered events - means they will both attend the event
    new_user1.registeredEvents.append(new_event)
    new_user2.registeredEvents.append(new_event)

    db.session.add(new_user1)
    db.session.add(new_user2)
    db.session.add(new_event)
    db.session.commit()

    # checking if the event is in both users
    users = User.query.all()
    assert (
        new_event in users[0].registeredEvents
        and new_event in users[1].registeredEvents
    )
    # checking if event has list of users in attendance
    event = Event.query.filter_by(eventName="Event 1").first()
    print(event.users)
    assert new_user1 in event.users and new_user2 in event.users
