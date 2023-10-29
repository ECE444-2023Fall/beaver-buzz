import pytest
from pathlib import Path
import json

from api.schemas import db
from api.Configuration import Configuration
from api.api import app


TEST_DB = "test.db"


@pytest.fixture
def client():
    BASE_DIR = Path(__file__).resolve().parent.parent
    app.config["TESTING"] = True
    app.config["DATABASE"] = BASE_DIR.joinpath(TEST_DB)
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{BASE_DIR.joinpath(TEST_DB)}"

    with app.app_context():
        db.create_all()  # setup
        yield app.test_client()  # tests run here
        db.drop_all()  # teardown


def test_invalid_login(client):
    """Login helper function"""
    response = client.post('/api/login',
                             data=json.dumps(dict(email='filip@gmail.com', password='12345678')),
                             content_type='application/json')
    responseJson = response.json
    expected = {'error': 'Invalid username or password'}
    assert(responseJson == expected)

def test_register(client):
    """Login helper function"""
    string = '123-456-235'
    unistring = string.encode('utf-8')
    response = client.post('/api/register',
                             data=json.dumps(dict(email='filip@gmail.com', password='12345678', firstname='filip', lastname='kostic', phonenumber='', interests='')),
                             content_type='application/json')
    responseJson = response.json
    expected = {'greeting': 'Welcome, filip'}
    assert(expected == responseJson)

def test_valid_login(client):

    string = '123-456-235'
    unistring = string.encode('utf-8')
    response = client.post('/api/register',
                             data=json.dumps(dict(email='filip@gmail.com', password='12345678', firstname='filip', lastname='kostic', phonenumber='', interests='')),
                             content_type='application/json')
    responseJson = response.json
    expected = {'greeting': 'Welcome, filip'}
    assert(expected == responseJson)
    """Login helper function"""
    response = client.post('/api/login',
                           data=json.dumps(dict(email='filip@gmail.com', password='12345678')),
                           content_type='application/json')
    responseJson = response.json
    expected = {'greeting': 'Welcome, filip'}
    assert (responseJson == expected)
