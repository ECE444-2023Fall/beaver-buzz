import React, { useContext, useState, useEffect } from 'react';
import { Button } from './components/Button';
import UserContext from './UserContext';
import './event.css';
import eventDefault from './images/event-default.jpg';
import { useParams } from "react-router-dom";

export default function EventPage() {

    const [data, setData] = useState([]);
    const { id } = useParams();

    useEffect(() => {
        const fetchInfo = () => {
            return fetch(`/api/events/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            )
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    return response.json().then((error) => {
                        console.log("Event does not exist.")
                        throw new Error(error);
                    })
                })
                .then((d) => setData(d))
                .catch((error) => { console.log(error); setData(-1); })
        };
        fetchInfo();
    }, [id]);

    const [userId] = useContext(UserContext);

    const register = () => {
        fetch(`/api/events/${id}/register/${userId}`, {
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

    // eventImage uses default event image when the event data doesn't contain an event image
    return (
        <div>
            {data !== -1 ? (
                <div>
                    <head>
                        <title>{data.eventName}</title>
                    </head>
                    <body>
                        <div id="eventContainer">
                            <h1 id="eventTitle">{data.eventName}</h1>
                            <p id="eventDescription">{data.eventDesc}</p>
                            <img id="eventImage" src={data.eventImg ? data.eventImg : eventDefault} alt="Event"></img>
                            <div id="eventInfo">
                                <p><strong>Organizer: </strong>{data.organizerID}</p>
                                <p><strong>Date and Time: </strong>{data.eventStart}</p>
                                <p><strong>Location: </strong>{data.eventBuilding}, Room {data.eventRoom}</p>
                            </div>
                            <Button buttonStyle='btn--primary' onClick={register}>Register</Button>
                        </div>
                    </body>
                </div>
            ) : (
                window.location.href = "/"
            )}
        </div>
    );
}