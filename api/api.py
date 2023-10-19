import time
import os
from flask import Flask, render_template, request, url_for, redirect
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, DateTimeField
from wtforms.validators import DataRequired, Email
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from flask_bootstrap import Bootstrap
from wtforms import ValidationError

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
# Model for user
class User(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    firstname = db.Column(db.String(100), nullable=False)
    lastname = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(80), unique=True, nullable=False)
    phonenumber = db.Column(db.Unicode(20))
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    interests = db.Column(db.Text)

    def __init__(self, username, password, firstname, lastname, email, phonenumber=None, interests=None):
        self.username = username
        self.password = password
        self.firstname = firstname
        self.lastname = lastname
        self.email = email
        self.phonenumber = phonenumber
        self.interests = interests

    def __repr__(self):
        return f"<Student {self.firstname}, {self.lastname}>"





# Temporary form - only for demonstrating the database. should be removed once login/registration is implemented
class LoginForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired()])
    password = StringField("Password", validators=[DataRequired()])


    login = SubmitField("Login")

class RegisterForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired()])
    password = StringField("Password", validators=[DataRequired()])
    firstname = StringField("What is your first name?", validators=[DataRequired()])
    lastname = StringField("What is your last name?", validators=[DataRequired()])
    email = StringField(
        "What is your Email address?", validators=[DataRequired(), Email()]
    )
    phonenumber = StringField("What is your phone number?", validators=[DataRequired()])
    interests = StringField("What are your interests?")
    register = SubmitField("Register")




@app.route("/")
def main():
    db.create_all()
    return "go to /register or /login to try out the features of this branch"






@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    name = None
    if form.validate_on_submit():
        u = User.query.filter_by(username=form.username.data).all()
        if len(u) == 1:
            if u[0].password == form.password.data:
                name = u[0].firstname
            else:
                name = "incorrect"
        elif len(u) == 0:
            name = "incorrect"
        else:
            raise Exception("Multiple users found in the database with the same username: " + str(u))

    return render_template("login.html", form=form, name=name)


@app.route("/register", methods=["GET", "POST"])
def register():
    form = RegisterForm()
    error = None
    if form.validate_on_submit():

        error = checkUniqueFields(form)

        if error is None:
            user = User(
                form.username.data,
                form.password.data,
                form.firstname.data,
                form.lastname.data,
                form.email.data,
                form.phonenumber.data,
                form.interests.data,
            )
            db.session.add(user)
            db.session.commit()

            return redirect(url_for("login"))
    return render_template("register.html", form=form, error=error)


def checkUniqueFields(form):
    u = User.query.filter_by(username=form.username.data).all()
    if len(u) == 1:
        return "An account with this username already exists"
    u = User.query.filter_by(email=form.email.data).all()
    if len(u) == 1:
        return "An account with this email already exists"
    return None





# @app.errorhandler(404)
# def page_not_found(e):
#     return render_template("404.html"), 404


# @app.errorhandler(500)
# def page_not_found(e):
#     return render_template("500.html"), 500
