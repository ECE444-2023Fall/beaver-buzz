import pytest
from pathlib import Path
from schemas import User, Event, db
from api import app
import datetime
import json
import bcrypt

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

@pytest.fixture
def populate_login_db():
    newaccount = User(
        email="afilkostic@gmail.com",
        password= bcrypt.hashpw("password".encode("utf-8"), bcrypt.gensalt()),
        firstname="Filip",
        lastname="Kostic",
    )
    db.session.add(newaccount)
    db.session.commit()

@pytest.fixture
def populate_user_info_db():
    newaccount = User(
        email="afilkostic@gmail.com",
        password= bcrypt.hashpw("password".encode("utf-8"), bcrypt.gensalt()),
        firstname="Filip",
        lastname="Kostic",
        phonenumber = "647-760-9134",
        interests = str([{"name": "Sports", "id": 2}, {"name": "Math", "id": 4}]),
    )
    db.session.add(newaccount)
    db.session.commit()

@pytest.fixture
def populate_set_info_db():
    newaccount = User(
        email="afilkostic@gmail.com",
        password= bcrypt.hashpw("password".encode("utf-8"), bcrypt.gensalt()),
        firstname="Filip",
        lastname="Kostic",
        phonenumber = "647-760-9134",
        interests = str([{"name": "Sports", "id": 2}, {"name": "Math", "id": 4}]),
    )

    newaccount2 = User(
        email="benny@gmail.com",
        password= bcrypt.hashpw("password".encode("utf-8"), bcrypt.gensalt()),
        firstname="Benny",
        lastname="Guy",
        phonenumber = "123-456-7890",
        interests = str([{"name": "Sports", "id": 2}]),
    )


    db.session.add(newaccount)
    db.session.add(newaccount2)
    db.session.commit()

#Done by Vishnu Akundi, Julia Wang
@pytest.fixture
def populate_db():
    newaccount = User(
        email="prempotat@gmail.com",
        password= "password",
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
    # create a test user and event, register the user for the event
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

# Done by Filip Kostic
def test_login(client, populate_login_db):

    # Valid login
    res = client.post('api/login', json = {"email": "afilkostic@gmail.com", "password": "password"})
    value = res.json
    assert(value['greeting'] == "Welcome, Filip")
    assert(res.status_code == 202)

    # Email does not exist
    res = client.post('api/login', json = {"email": "random@gmail.com", "password": "password"})
    value = res.json
    assert(value['error'] == "Invalid username or password")
    assert(res.status_code == 401)

    # Email exists, wrong password
    res = client.post('api/login', json = {"email": "afilkostic@gmail.com", "password": "wrongpassword"})
    value = res.json
    assert(value['error'] == "Invalid username or password")
    assert(res.status_code == 401)

# Done by Filip Kostic
def test_register(client):

    # Test valid registration
    res = client.post('api/register', 
    json = {"email": "afilkostic@gmail.com", 
            "password": "password",
            "firstname": "Filip",
            "lastname": "Kostic",
            "phonenumber": '647-760-9134',
            "interests": [{"name": "Sports", "id": 2}, {"name": "Math", "id": 4}]})
    value = res.json
    assert(value['greeting'] == "Welcome, Filip")
    assert(res.status_code == 201)

    # Test existing email
    res = client.post('api/register', 
    json = {"email": "afilkostic@gmail.com", 
            "password": "password",
            "firstname": "Filip",
            "lastname": "Kostic",
            "phonenumber": '123-456-7890',
            "interests": [{"name": "Sports", "id": 2}, {"name": "Math", "id": 4}]})
    value = res.json
    assert(value['error'] == "User with this email already exists")
    assert(res.status_code == 400)

    # Test existing phone number
    res = client.post('api/register', 
    json = {"email": "random@gmail.com", 
            "password": "password",
            "firstname": "Filip",
            "lastname": "Kostic",
            "phonenumber": '647-760-9134',
            "interests": [{"name": "Sports", "id": 2}, {"name": "Math", "id": 4}]})
    value = res.json
    assert(value['error'] == "User with this phone number already exists")
    assert(res.status_code == 400)

    # Test if login possible with valid account
    res = client.post('api/login', json = {"email": "afilkostic@gmail.com", "password": "password"})
    value = res.json
    assert(value['greeting'] == "Welcome, Filip")
    assert(res.status_code == 202)

    # Test if login possible with invalid account
    res = client.post('api/login', json = {"email": "random@gmail.com", "password": "password"})
    value = res.json
    assert(value['error'] == "Invalid username or password")
    assert(res.status_code == 401)

# Done by Filip Kostic
def test_user_info(client, populate_user_info_db):

    # Test request
    res = client.post("/api/getUserInfo", 
    json = {"id": 1, "myID": 1})
    value = res.json
    assert(value['avatar'] == None)
    assert(value['emailaddr'] == "afilkostic@gmail.com")
    assert(value['firstname'] == "Filip")
    assert(value['lastname'] == "Kostic")
    assert(value['interests'] == str([{"name": "Sports", "id": 2}, {"name": "Math", "id": 4}]))
    assert(value['privacy'] == {'showContactInformation': True, 'showRegisteredEvents': True})
    assert(res.status_code == 200)

    # Test non-existent user
    res = client.post("/api/getUserInfo", 
    json = {"id": 2, "myID": 1})
    assert(res.status_code == 404)

    # Test non-existent requesting user
    res = client.post("/api/getUserInfo", 
    json = {"id": 1, "myID": 2})
    assert(res.status_code == 404)

# Done by Filip Kostic
def test_set_email(client, populate_set_info_db):

    # Test valid new email
    res = client.post("/api/setEmail", 
    json = {"id": 1, "email": "random@gmail.com"})
    value = res.json
    assert(res.status_code == 200)
    assert(value['status'] == "updated email")
    
    # Test if updating email had any backend effect
    res = client.post("/api/getUserInfo", 
    json = {"id": 1, "myID": 1})
    value = res.json
    assert(res.status_code == 200)
    assert(value['emailaddr'] == "random@gmail.com")

    # Test taken email
    res = client.post("/api/setEmail", 
    json = {"id": 1, "email": "benny@gmail.com"})
    value = res.json
    assert(res.status_code == 400)
    assert(value['error'] == "email already in use")

    # Test non-existent user
    res = client.post("/api/setEmail", 
    json = {"id": 5, "email": "benny@gmail.com"})
    value = res.json
    assert(res.status_code == 404)


# Done by Filip Kostic
def test_set_firstname(client, populate_set_info_db):

    # Test valid new firstname
    res = client.post("/api/setFirstname", 
    json = {"id": 1, "firstname": "Billy"})
    value = res.json
    assert(res.status_code == 200)
    assert(value['status'] == "updated first name")

    # Test Non existing user
    res = client.post("/api/setFirstname", 
    json = {"id": 5, "firstname": "Billy"})
    value = res.json
    assert(res.status_code == 404)

    # Test if updating firstname had any backend effect
    res = client.post("/api/getUserInfo", 
    json = {"id": 1, "myID": 1})
    value = res.json
    assert(res.status_code == 200)
    assert(value['firstname'] == "Billy")

# Done by Filip Kostic
def test_set_lastname(client, populate_set_info_db):
    pass
    # Test valid new lastname
    res = client.post("/api/setLastname", 
    json = {"id": 1, "lastname": "Boris"})
    value = res.json
    assert(res.status_code == 200)
    assert(value['status'] == "updated last name")

    # Test Non existing user
    res = client.post("/api/setLastname", 
    json = {"id": 5, "lastname": "Boris"})
    value = res.json
    assert(res.status_code == 404)

    # Test if updating lastname had any backend effect
    res = client.post("/api/getUserInfo", 
    json = {"id": 1, "myID": 1})
    value = res.json
    assert(res.status_code == 200)
    assert(value['lastname'] == "Boris")
    

# Done by Filip Kostic
def test_set_phone(client, populate_set_info_db):

    # Test valid new phone
    res = client.post("/api/setPhone", 
    json = {"id": 1, "phone": "553-532-1234"})
    value = res.json
    assert(res.status_code == 200)
    assert(value['status'] == "updated phone")
    
    # Test if updating phone had any backend effect
    res = client.post("/api/getUserInfo", 
    json = {"id": 1, "myID": 1})
    value = res.json
    assert(res.status_code == 200)
    assert(value['phonenumber'] == "553-532-1234")

    # Test taken phone
    res = client.post("/api/setPhone", 
    json = {"id": 1, "phone": "123-456-7890"})
    value = res.json
    assert(res.status_code == 400)
    assert(value['error'] == "phone number is already in use")

    # Test non-existent user
    res = client.post("/api/setPhone", 
    json = {"id": 5, "phone": "553-532-1234"})
    value = res.json
    assert(res.status_code == 404)


# Done by Filip Kostic
def test_set_interests(client, populate_set_info_db):

    # Test valid new interests
    res = client.post("/api/setInterests", 
    json = {"id": 1, "interests": str([{"name": "Sports", "id": 2}])})
    value = res.json
    assert(res.status_code == 200)
    assert(value['status'] == "updated interests")

    # Test Non existing user
    res = client.post("/api/setInterests", 
    json = {"id": 5, "interests": [{"name": "Sports", "id": 2}]})
    value = res.json
    assert(res.status_code == 404)

    # Test if updating interests had any backend effect
    res = client.post("/api/getUserInfo", 
    json = {"id": 1, "myID": 1})
    value = res.json
    assert(res.status_code == 200)
    assert(value['interests'] == str([{"name": "Sports", "id": 2}]))


# Done by Filip Kostic
def test_set_avatar(client, populate_set_info_db):

    # Test valid new avatar
    res = client.post("/api/setAvatar", 
    json = {"id": 1, "avatar": "test"})
    value = res.json
    assert(res.status_code == 200)
    assert(value['status'] == "updated avatar")

    # Test Non existing user
    res = client.post("/api/setAvatar", 
    json = {"id": 5, "avatar": "test"})
    value = res.json
    assert(res.status_code == 404)

    # Test if updating avatar had any backend effect
    res = client.post("/api/getUserInfo", 
    json = {"id": 1, "myID": 1})
    value = res.json
    assert(res.status_code == 200)
    assert(value['avatar'] == "test")

def test_set_privacy(client, populate_set_info_db):

    # Test valid new privacy
    res = client.post("/api/setPrivacy", 
    json = {"id": 1, "showContactInfo": False, "showRegisteredEvents": True})
    value = res.json
    assert(res.status_code == 200)
    assert(value['status'] == "updated privacy")

    # Test Non existing user
    res = client.post("/api/setPrivacy", 
    json = {"id": 5, "showContactInfo": False, "showRegisteredEvents": True})
    value = res.json
    assert(res.status_code == 404)

    # Test if updating avatar had any backend effect
    res = client.post("/api/getUserInfo", 
    json = {"id": 1, "myID": 1})
    value = res.json
    assert(res.status_code == 200)
    assert(value['privacy'] == {"showContactInformation": False, "showRegisteredEvents": True})

    # Test if private settings are visible to other users
    res = client.post("/api/getUserInfo", 
    json = {"id": 1, "myID": 2})
    value = res.json
    assert(res.status_code == 200)
    assert(value['emailaddr'] == "Private")
    assert(value['phonenumber'] == "Private")
