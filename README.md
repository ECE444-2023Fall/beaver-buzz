# BeaverBuzz by Premium Potatoes

## About
BeaverBuzz is a community-based event-sharing platform that enables clubs and organizers to post events and reach out to the University of Toronto (UofT) student community. It also allows UofT students to explore new communities and discover new interests and activities. This app aims to create a better-connected student body at UofT and provide access to a range of extracurricular activities. 

## How to Use this Repo
* Pull the Repo: use  `git clone`
* Set up the virtual environment using the following steps
    1. `pip install virtualenv`
    2. `virtualenv venv`
    3. `source venv/bin/activate`
    4. `pip install -r requirements.txt`
* Use `yarn start` to run Frontend React App (the React app uses App.js to show the frontend)
* Use `yarn start-api` to run Backend Flask App (the flask app uses api.py to display the backend and interact with the database)

## Features
* **Event information**: date, time, location, additional details, flyer, comment section
* **Events discovery:** see events users with similar interests have RSVPed and trending events
* **Search**: by event name, organizer, category, and time
* **Subcriptions**: users can subscribe to organizers
*** User information**: users can see the list of their registered events, subscribed organizers, categories on their profile
* **Notifications**: choice of email or push notifications prior to events
* **Calendar**: events users are registered for are downloadable as calendar events

## Built With

* [![React][React.js]][React-url]
* [![Flask][Flasky]][Flask-url]
* [![PostgreSQL][Postgres]][Postgres-url]
* [![Heroku][Heroku]][Heroku-url]
* [![Nginxx][Nginx]][nginx-url]
* [![docker][Docker]][docker-url]


## Roadmap 
Premium Potatoes utilize Jira Software for project management which can be accessed: [![jira][Jira]][jira-url]
or [here](https://premiumpotatoes.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog).

## Contact
Premium Potatoes Github: [Github](https://github.com/ECE444-2023Fall/project-1-web-application-design-group22-premium-potatoes)

<!-- MARKDOWN LINKS & IMAGES -->
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Flasky]: https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white
[Flask-url]: https://flask.palletsprojects.com/
[Postgres]: https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white
[Postgres-url]: https://www.postgresql.org/
[Heroku]: https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white
[Heroku-url]: https://www.heroku.com/
[Nginx]: https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white
[nginx-url]: https://www.nginx.com/
[Docker]: https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white
[docker-url]: https://www.docker.com/
[Jira]: https://img.shields.io/badge/jira-%230A0FFF.svg?style=for-the-badge&logo=jira&logoColor=white
[jira-url]: https://premiumpotatoes.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog