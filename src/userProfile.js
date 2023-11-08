import { Event } from "./Profile";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import "./UserProfile.css"
import mailIcon from "./images/email.svg"
import phoneIcon from "./images/phone.svg"
import pencilIcon from "./images/pencil.svg"
import {Divider} from "semantic-ui-react";
import {useUserContext} from './UserContext'
import {Button, Image} from "react-bootstrap";
import UploadAvatar from "./components/Avatar";
import defaultImage from "./images/defaultEvent.png"


const UserPage=()=> {
    const params = useParams();
    const requestedUserId = params.id;
    const navigate = useNavigate();
    const {
        userId,
        setUserId
    } = useUserContext()



    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [interests, setInterests] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [events, setEvents] = useState([]);

    function fetchEvents() {
        if(requestedUserId == userId){
            navigate('/profile');
            return;
        }

        const requestOptions={
        method:"POST",
        headers:{
           'content-type':'application/json'
        },
        body:JSON.stringify({option: "Hosting", showPastEvents: false})
        }

        fetch('/api/users/' + requestedUserId + '/events', requestOptions)
        .then(response => response.json())
        .then(data => {
            var eventsArray = [];

            for (var i = 0; i < data.length; i++) {
                 var start = data[i].eventStart.toString().replace('GMT', 'EST');
                 var end = data[i].eventEnd.toString().replace('GMT', 'EST');

                var event = new Event(
                    data[i].eventBuilding,
                    data[i].eventDesc,
                    end,
                    data[i].eventImg,
                    data[i].eventImgType,
                    data[i].eventName,
                    data[i].eventRoom,
                    start,
                    data[i].id,
                    data[i].oneLiner,
                    data[i].organizerID,
                    data[i].registered
                );
                eventsArray.push(event);

            }
            setEvents(eventsArray);
        });
    }

    useEffect( () => {

        if(userId == 'null') {
            navigate('/login');
            return;
        }
        function fetchUser() {


                const requestOptions = {
                    method: "POST",
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({id: requestedUserId})
                }
                fetch('/api/getUserInfo', requestOptions)
                    .then(response => response.json())
                    .then(data => {
                        setEmail(data.emailaddr)
                        setPhone(data.phonenumber)
                        setFirstName(data.firstname)
                        setLastName(data.lastname)
                        setInterests(data.interests)
                    });
        }




        fetchUser();
        fetchEvents();

    }, []);
    


    const arrayDataItems = events.map((event) =>
    <li key={event.id}>
        <div className="event-vertical-container">
            <div className="event-list-title-font">{event.eventName}</div>
            <Image className="eventImage" src = {event.eventImg ? event.eventImg : defaultImage}></Image>
            <div className="event-list-font">{event.oneLiner}</div>
            <div className="flexbox-horizontal-container">
                <div className="event-list-font">Start time:</div>
                <div className="event-list-value-font">{event.eventStart}</div>
            </div>
            <div className="flexbox-horizontal-container">
                <div className="event-list-font">End time:</div>
                <div className="event-list-value-font">{event.eventEnd}</div>
            </div>

            <div className="flexbox-horizontal-container">
                <div className="event-list-font">Location:</div>
                <div className="event-list-value-font">{event.eventBuilding}, {event.eventRoom}</div>
            </div>

            <div className="horizontal_divider"></div>

        </div>

    </li>
    );


    return(
        <div className="mainFlexBox">
            <div className="flexbox-user-container">
                <UploadAvatar/>
                <div className="person-name-font">{firstName} {lastName}</div>
                 <div className= "person-table">
                    <div className="sectionFont">First name</div>
                    <div className="flexbox-horizontal-container">
                        <input className="inputField" disabled = 'disabled' defaultValue={firstName}/>
                    </div>
            

                     <div className="sectionFont">Last name</div>
                        <div className="flexbox-horizontal-container">
                            <input className="inputField" disabled = 'disabled' defaultValue={lastName}/>
                        </div>

                        <Divider></Divider>
                        <div className="sectionFont">Contact info</div>
                        <Divider></Divider>

                        <div className="flexbox-horizontal-container">
                            <div>
                                <img src={mailIcon}/>
                            </div>
                            <input className="inputField" disabled = 'disabled' defaultValue={email}/>
                        </div>

                        <div className="horizontal_divider"></div>

                        <div className="flexbox-horizontal-container">
                            <div>
                                <img src={phoneIcon}/>
                            </div>
                            <input className="inputField" disabled = 'disabled' defaultValue={phone}/>
                        </div>

                        <Divider></Divider>
                        <div className="sectionFont">Interests</div>
                        <Divider></Divider>
                            <textarea rows = "8" className="textAreaField" disabled = 'disabled' defaultValue={interests} />
       
                    </div>
            </div>

            <div className="event-wish-list-table">


                <div className="flexbox-horizontal-container">

                    <div className="event-list-title">{firstName}'s upcoming events</div>

                </div>

                <ul className="eventList">{arrayDataItems}</ul>
            </div>
        </div>

    )
}

export default UserPage;