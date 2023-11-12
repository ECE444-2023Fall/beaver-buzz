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
        eventCategories="Arts,Food",
    )
    newevent2 = Event(
        eventName="ECE444 Study Session",
        organizerID=newaccount.id,
        eventStart=datetime.datetime.now(),
        eventEnd=datetime.datetime.now(),
        eventBuilding="Sanford Fleming",
        eventRoom="Test Room",
        oneLiner="Help with project",
        eventCategories="Academic",
    )
    db.session.add(newevent2)
    db.session.add(newaccount)
    db.session.add(newevent)
    db.session.commit()
#Done by Vishnu Akundi
@pytest.fixture
def populate_db2():
    newaccount = User(
        email="prempotat@gmail.com",
        password="password",
        firstname="Prem",
        lastname="Potat",
    )
    newaccount2 = User(
        email="joebrandon@gmail.com",
        password="password",
        firstname="Joe",
        lastname="Brandon",
    )
    db.session.add(newaccount)
    db.session.add(newaccount2)
    db.session.commit()
    newevent = Event(
        eventName="Test Event",
        organizerID= newaccount.id,
        eventStart=datetime.datetime.now(),
        eventEnd=datetime.datetime.now(),
        eventBuilding="Test Building",
        eventRoom="Test Room",
        oneLiner="Test One Liner",
        eventCategories="Arts,Food",
    )
    newevent2 = Event(
        eventName="ECE444 Study Session",
        organizerID=newaccount2.id,
        eventStart=datetime.datetime.now(),
        eventEnd=datetime.datetime.now(),
        eventBuilding="Sanford Fleming",
        eventRoom="Test Room",
        oneLiner="Help with project",
        eventCategories="Academic,Career",
    )
    db.session.add(newevent2)
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
def test_search(client, populate_db2):
    #Search Filter 
    res = client.get("/api/search?filters=Arts&searchbar=&userid=%5Bobject+Object%5D")
    temp = json.loads(res.get_data())
    for i in range(len(temp)):
        assert("Arts" in temp[i]['eventCategories'])
    #SearchBar 
    res = client.get("/api/search?filters=&searchbar=ECE444&userid=%5Bobject+Object%5D")
    temp = json.loads(res.get_data())
    for i in range(len(temp)):
        assert(temp[i]['eventName'] == "ECE444 Study Session")
    #Organizer Name
    res = client.get("/api/search?filters=&searchbar=Prem&Organizer=true&userid=%5Bobject+Object%5D")
    temp = json.loads(res.get_data())
    for i in range(len(temp)):
        assert(temp[i]['eventName'] == "Test Event")
    #Search for Filter in Search Bar 
    res = client.get("/api/search?filters=&searchbar=Academic&userid=%5Bobject+Object%5D")
    temp = json.loads(res.get_data())
    for i in range(len(temp)):
        assert(temp[i]['eventName'] == "ECE444 Study Session")
#Done by Vishnu Akundi
def test_allevents(client, populate_db2):
    res=client.get("/api/allevents")
    assert(res.status_code == 200)
    temp = json.loads(res.get_data())
    eventnames = []
    for i in temp:
        eventnames.append(i['eventName'])
    assert(set(eventnames)==set(["ECE444 Study Session", "Test Event"]))