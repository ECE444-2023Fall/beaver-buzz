import pytest
from pathlib import Path
from schemas import User, Event, db
from api import app
import datetime

TEST_DB = "test.db"


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
    db.session.add(newaccount)
    db.session.add(newevent)
    db.session.commit()

def test_registerEvent(client, populate_db):
    # create a test user and event, register the user for the event
    res = client.post("/api/events/1/register/1")
    # assert(res.get_json() is None)
    assert(res.status_code == 200)

    res = client.post("/api/events/2/register/2")
    assert(res.status_code == 404)


# class TestAPI():
#     def setup_class(self):
#         self.app = Flask(__name__)
#         self.app.config.from_object(Configuration)
#         self.app.config["TESTING"] = True
#         db.init_app(self.app)
#         with self.app.app_context():
#             db.create_all()

#             # newaccount = User(
#             #     email="prempotat@gmail.com",
#             #     password="password",
#             #     firstname="Prem",
#             #     lastname="Potat",
#             # )
#         # Event(
#         #     eventName="Test Event",
#         #     organizerID=0,
#         #     eventStart="2020-04-20 12:00:00",
#         #     eventEnd="2020-04-20 13:00:00",
#         #     eventBuilding="Test Building",
#         #     eventRoom="Test Room",
#         #     oneLiner="Test One Liner",
#         # )
#         # db.session.add(newaccount)
#         # db.session.commit()

#     def teardown_class(self):
#         self.app = Flask(__name__)
#         self.app.config.from_object(Configuration)
#         self.app.config["TESTING"] = True
#         db.init_app(self.app)
#         with self.app.app_context():
#             db.session.rollback()

#     def test_registerEvent(self):
#         # create a test user and event, register the user for the event
#         with self.app.app_context():
#             with self.app.test_client() as client:
#                 res = client.post("/api/events/1/register/1")
#                 assert(res is None)
#                 db.session.rollback()