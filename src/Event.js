import React, { useContext, useState, useEffect } from 'react';
import { Button } from './components/Button';
import UserContext from './UserContext';
import './event.css';

const EVENTID = 1; //TODO: replace with actual event ID

export default function EventPage() {

    const [data, setData] = useState([]);

    const fetchInfo = () => {
        fetch(`/api/events/${EVENTID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        )
            .then((res) => res.json())
            .then((d) => setData(d))
    }

    useEffect(() => {
        fetchInfo();
    }, []);

    const [userId] = useContext(UserContext);

    const register = () => {
        fetch(`/api/events/${EVENTID}/register/${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        }).then((res) => {
            if (res.status === 200) {
                console.log("Successfully registered");
            } else {
                console.log("Failed to register");
            }
            console.log(res);
        }).catch((error) => {
            console.log(error);
        });
    }

    return (
        <div>
            <head>
                <title>{data.eventName}</title>
            </head>
            <body>
                <div id="eventContainer">
                    <h1 id="eventTitle">{data.eventName}</h1>
                    <p id="eventDescription">{data.eventDesc}</p>
                    <img id="eventImage" src="event-image.jpg" alt="Event"></img>
                    <div id="eventInfo">
                        <p><strong>Organizer: </strong>{data.organizerID}</p>
                        <p><strong>Date and Time: </strong>{data.eventStart}</p>
                        <p><strong>Location: </strong>{data.eventBuilding}, Room {data.eventRoom}</p>
                    </div>
                    <Button buttonStyle='btn--primary' onClick={register}>Register</Button>
                </div>
            </body>
        </div>
    );
}