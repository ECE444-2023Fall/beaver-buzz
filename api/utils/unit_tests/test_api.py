import pytest
from pathlib import Path
from schemas import User, Event, db
from api import app
import datetime
import json

TEST_DB = "test.db"

#Done by Julia Wang
@pytest.fixture
def client():
    BASE_DIR = Path(__file__).resolve().parent
    app.config["TESTING"] = True
    app.config["DATABASE"] = BASE_DIR.joinpath(TEST_DB)
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{BASE_DIR.joinpath(TEST_DB)}"

    with app.app_context():
        db.create_all()  # setup
        yield app.test_client()  # tests run here
        db.drop_all()  # teardown

#Done by Vishnu Akundi, Julia Wang
@pytest.fixture
def populate_db():
    newaccount = User(
        email="prempotat@gmail.com",
        password="password",
        firstname="Prem",
        lastname="Potat",
    )
    newevent = Event(
        eventName="Test Event",
        organizerID=newaccount.id,
        eventStart=datetime.datetime.now(),
        eventEnd=datetime.datetime.now(),
        eventBuilding="Test Building",
        eventRoom="Test Room",
        oneLiner="Test One Liner",
    )
    newevent2 = Event(
        eventName="ECE444 Study Session",
        organizerID=newaccount.id,
        eventStart=datetime.datetime.now(),
        eventEnd=datetime.datetime.now(),
        eventBuilding="Sanford Fleming",
        eventRoom="Test Room",
        oneLiner="Test One Liner",
    )
    db.session.add(newevent2)
    db.session.add(newaccount)
    db.session.add(newevent)
    db.session.commit()

#Done by Julia Wang
def test_registerEvent(client, populate_db):
    # create a test user and event, register the user for the event
    res = client.post("/api/events/1/register/1")
    # assert(res.get_json() is None)
    assert(res.status_code == 200)

    res = client.post("/api/events/2/register/2")
    assert(res.status_code == 404)

#Done by Julia Wang
def test_unregisterEvent(client, populate_db):
    # create a test user and event, register the user for the event
    res = client.post("/api/events/1/register/1")
    assert(res.status_code == 200)

    res = client.post("/api/events/1/unregister/1")
    assert(res.status_code == 200)

    res = client.post("/api/events/2/unregister/2")
    assert(res.status_code == 404)

#Done by Vishnu Akundi
def test_search(client, populate_db):
    res = client.get("/api/search?searchbar=&filters=Sanford Fleming")
    assert(res.status_code == 200)
    temp = json.loads(res.get_data())
    for i in range(len(temp)):
        assert(temp[i]['eventBuilding']== "Sanford Fleming")
    res = client.get("/api/search?searchbar=ECE444&filters=")
    assert(res.status_code == 200)
    temp = json.loads(res.get_data())
    for i in range(len(temp)):
        assert("ECE444" in temp[i]['eventName'])


# Done by Julia Wang
def test_createEvent(client, populate_db):
    # test that everything works
    res = client.post("/api/events/new",
        data=json.dumps(
            dict(
                eventName="Test Event",
                organizerID=1,
                eventDate = datetime.datetime.now().strftime("%Y-%m-%d"),
                eventStart=datetime.datetime.now().strftime("%H:%M"),
                eventEnd=datetime.datetime.now().strftime("%H:%M"),
                building="Test Building",
                room="1234",
                oneLiner="Test One Liner",
                tags = '["Test Tag 1", "Test Tag 2"]', 
                description="Test Description",
                image = None,
            )
        ),
        content_type="application/json",
    )
    assert(res.status_code == 200)

    # test for missing date
    res = client.post("/api/events/new",
        data=json.dumps(
            dict(
                eventName="Test Event",
                organizerID=1,
                eventDate = None,
                eventStart=datetime.datetime.now().strftime("%H:%M"),
                eventEnd=datetime.datetime.now().strftime("%H:%M"),
                building="Test Building",
                room="1234",
                oneLiner="Test One Liner",
                tags = '["Test Tag 1", "Test Tag 2"]', 
                description="Test Description",
                image = None,
            )
        ),
        content_type="application/json",
    )
    assert(res.status_code == 400)

    # test for missing location
    res = client.post("/api/events/new",
        data=json.dumps(
            dict(
                eventName="Test Event",
                organizerID=1,
                eventDate = None,
                eventStart=datetime.datetime.now().strftime("%H:%M"),
                eventEnd=datetime.datetime.now().strftime("%H:%M"),
                building="",
                room="1234",
                oneLiner="Test One Liner",
                tags = '["Test Tag 1", "Test Tag 2"]', 
                description="Test Description",
                image = None,
            )
        ),
        content_type="application/json",
    )
    assert(res.status_code == 400)

    res = client.post("/api/events/new",
        data=json.dumps(
            dict(
                eventName="Test Event",
                organizerID=1,
                eventDate = None,
                eventStart=datetime.datetime.now().strftime("%H:%M"),
                eventEnd=datetime.datetime.now().strftime("%H:%M"),
                building="Building Name",
                room=None,
                oneLiner="Test One Liner",
                tags = '["Test Tag 1", "Test Tag 2"]', 
                description="Test Description",
                image = None,
            )
        ),
        content_type="application/json",
    )
    assert(res.status_code == 400)

    # test for missing oneLiner
    res = client.post("/api/events/new",
        data=json.dumps(
            dict(
                eventName="Test Event",
                organizerID=1,
                eventDate = None,
                eventStart=datetime.datetime.now().strftime("%H:%M"),
                eventEnd=datetime.datetime.now().strftime("%H:%M"),
                building="Test Building",
                room="1234",
                oneLiner="",
                tags = '["Test Tag 1", "Test Tag 2"]', 
                description="Test Description",
                image = None,
            )
        ),
        content_type="application/json",
    )
    assert(res.status_code == 400)

# Done by Julia Wang
def test_getEvent(client, populate_db):
    res = client.get("/api/events/1")
    assert(res.status_code == 200)
    assert(res.get_json()['eventName']=="ECE444 Study Session")
    assert(res.get_json()['eventBuilding']=="Sanford Fleming")
    assert(res.get_json()['eventRoom']=="Test Room")
    assert(res.get_json()['oneLiner']=="Test One Liner")
    assert(res.get_json()['eventDesc']==None)
    assert(res.get_json()['eventImg']==None)

    # try to get an event that doesn't exist
    res = client.get("/api/events/3")
    assert(res.status_code == 404)