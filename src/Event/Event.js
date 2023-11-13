import React, { useContext, useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { useUserContext } from '../UserContext';
import './Event.css';
import eventDefault from '.././images/event-default.jpg';
import { useParams } from "react-router-dom";
import RateEvent from '../components/Rating';

function convertDate(date) {
    if (!date) return "";
    // console.log(date);
    const months = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12"
    };
    const dateParts = date.split(" ");
    const month = months[dateParts[2]];
    const day = dateParts[2];
    const year = dateParts[3];
    const time = dateParts[4];
    const newDate = new Date(`${year}-${month}-${day}T${time}Z`);
    // console.log(newDate);
    return newDate.toLocaleString();
}

export default function EventPage() {

    const [data, setData] = useState([]);
    const { id } = useParams();

    const {
        userId,
        setUserId
    } = useUserContext()

    useEffect(() => {
        const fetchInfo = () => {
            return fetch(`${process.env.REACT_APP_BACKEND_URL}/api/events/${id}`, {
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
                .then((d) => {
                    console.log(d.eventImg);
                    setData(d)
                })
                .catch((error) => { console.log(error); setData(-1); })
        };
        fetchInfo();
    }, [id]);


    const register = () => {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/events/${id}/register/${userId}`, {
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
                            <RateEvent title = "" mode="eventrating" disabled='disabled' userID ={userId} eventID={id}></RateEvent>
                            <p id="eventOneLiner">{data.oneLiner}</p>
                            <img id="eventImage" src={data.eventImg ? data.eventImg : eventDefault} alt="Event"></img>
                            <p id="eventDescription">{data.eventDesc}</p>
                            <div id="eventInfo">
                                <p><strong>Organizer: </strong>{data.organizerID}</p>
                                <p><strong>Date and Time: </strong>{convertDate(data.eventStart)}</p>
                                <p><strong>Location: </strong>{data.eventBuilding}, Room {data.eventRoom}</p>
                            </div>
                            <Button buttonStyle='btn--primary' onClick={register}>Register</Button>
                            <RateEvent title = "Rate this event" mode="myrating" disabled='' userID ={userId} eventID={id}></RateEvent>
                        </div>
                    </body>
                </div>
            ) : (
                window.location.href = "/"
            )}
        </div>
    );
}