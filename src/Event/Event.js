import React, { useContext, useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { useUserContext } from '../UserContext';
import './Event.css';
import { useParams } from "react-router-dom";
import RateEvent from '../components/Rating';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export function convertDate(date) {
    if (!date) return "";
    // console.log(date);
    // const months = {
    //     Jan: "01",
    //     Feb: "02",
    //     Mar: "03",
    //     Apr: "04",
    //     May: "05",
    //     Jun: "06",
    //     Jul: "07",
    //     Aug: "08",
    //     Sep: "09",
    //     Oct: "10",
    //     Nov: "11",
    //     Dec: "12"
    // };
    // const dateParts = date.split(" ");
    // console.log(dateParts)
    // const month = months[dateParts[2]];
    // const day = dateParts[1];
    // const year = dateParts[3];
    // const time = dateParts[4];
    // const newDate = new Date(`${year}-${month}-${day}T${time}Z`);
    // // console.log(newDate);
    // let finalDate = newDate.toString().replace('GMT', 'EST')
    let finalDate = date.toString().replace('GMT', '')
    return finalDate;
}

export default function EventPage() {

    const [data, setData] = useState([]);
    const { id } = useParams();
    const [ratingVisible, setRatingVisible] = useState([])
    const [userAttending, setUserAttending] = useState([])
    const [eventOwner, setEventOwner] = useState([])
    const navigate = useNavigate();
    const [visibility, setVisibility] = useState(false)
    const [alertMessage, setAlertMessage] = useState([]);

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
                    console.log(d);
                    setData(d)
                    let currentDate = new Date();
                    let eventEnd = new Date(d.eventEnd.replace("GMT", "EST"))
                    if (eventEnd <= currentDate) {
                        setRatingVisible(true);
                    }
                    else {
                        setRatingVisible(false);
                    }
                    let isFound = d.attendeeList.some(user => {
                        // this comparison must be using double equal sign
                        if (userId != null && user == userId) {
                            return true;
                        }
                        return false;
                    });
                    setUserAttending(isFound);
                    setEventOwner(d.organizerID == userId ? true : false)

                })
                .catch((error) => { console.log(error); setData(-1); })
        };
        fetchInfo();
    }, [id, userId]);


    const register = () => {
        if (userId == null) {
            // redirect to login page
            window.location.href = "/login";
        }
        else if (!userAttending) {
            setUserAttending(true);
            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/events/${id}/register/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            }).then((res) => {
                if (res.status === 200) {
                    console.log("Successfully registered");
                    setAlertMessage("You have been successfully registered to the event!");
                    setVisibility(true);
                    setTimeout(() => {
                        setVisibility(false);
                    }, 5000);
                } else {
                    console.log("Failed to register");
                    setUserAttending(false);
                }
                console.log(res);
            }).catch((error) => {
                console.log(error);
            });
        }
        else {
            setUserAttending(false);
            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/events/${id}/unregister/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            }).then((res) => {
                if (res.status === 200) {
                    console.log("Successfully un-registered");
                    setAlertMessage("You have been successfully un-registered to the event!");
                    setVisibility(true);
                    setTimeout(() => {
                        setVisibility(false);
                    }, 5000);
                } else {
                    console.log("Failed to un-register");
                    setUserAttending(true);
                }
                console.log(res);
            }).catch((error) => {
                console.log(error);
            });
        }
    }

    const deleteEvent = () => {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/events/${id}/delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        }).then((res) => {
            if (res.status === 200) {
                console.log("Successfully Deleted");
                setAlertMessage("This event has been deleted. Redirecting to home page in 5 seconds");
                setVisibility(true);
                setTimeout(() => {
                    setVisibility(false);
                    navigate("/");
                }, 5000);
            } else {
                console.log("Failed to delete event");
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
                    <div>
                        {visibility && (
                            <div className="alert-container">
                                <div className="alert alert-info">
                                    <span className="close">X</span>
                                    <p>{alertMessage}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <head>
                        <title>{data.eventName}</title>
                    </head>
                    <body>
                        <div id="eventContainer">
                            {eventOwner &&
                                <div className="editButtonContainer">
                                    <Link onClick={deleteEvent} className="btn btn-primary" id="editButton">Delete Event</Link>
                                    {!ratingVisible &&
                                        <Link to="update-event" className="btn btn-primary" id="editButton">Edit Event</Link>
                                    }
                                </div>
                            }
                            <h1 id="eventTitle">{data.eventName}</h1>
                            {ratingVisible &&
                                <RateEvent title="" mode="eventrating" disabled={true} userID={userId} eventID={id}></RateEvent>
                            }
                            <p id="eventOneLiner">{data.oneLiner}</p>
                            <img id="eventImage" src={data.eventImg} alt="Event"></img>
                            <p id="eventDescription">{data.eventDesc}</p>
                            <div id="eventInfo">
                                <p><strong>Organizer: </strong><Link style={{ color: '#1e3765' }} to={'/user/' + data.organizerID}>{data.organizerName}</Link></p>
                                <p><strong>Date and Time: </strong>{convertDate(data.eventStart)}</p>
                                <p><strong>Location: </strong>{data.eventBuilding}, Room {data.eventRoom}</p>
                                <ul className="interestList">
                                    {data.eventCategories && data.eventCategories.map((item) => (
                                        <li className='interestListElement' key={item.id}>
                                            {item.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {userAttending && !eventOwner && !ratingVisible &&
                                <Button buttonStyle='btn--primary' onClick={register}>Unregister</Button>
                            }
                            {!userAttending && !eventOwner && !ratingVisible &&
                                <Button buttonStyle='btn--primary' onClick={register}>Register</Button>
                            }
                            {ratingVisible && userAttending &&
                                <RateEvent title="Rate this event" mode="myrating" userID={userId} eventID={id}></RateEvent>
                            }
                        </div>
                    </body>
                </div>
            ) : (
                window.location.href = "/"
            )}
        </div>
    );
}