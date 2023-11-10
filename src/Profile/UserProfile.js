import {useEffect, useRef, useState} from "react";
import "./UserProfile.css"
import mailIcon from "../images/email.svg"
import phoneIcon from "../images/phone.svg"
import pencilIcon from "../images/pencil.svg"
import {Divider} from "semantic-ui-react";
import {useUserContext} from '../UserContext'
import {Button, Image} from "react-bootstrap";
import UploadAvatar from "../components/Avatar";
import defaultImage from "../images/defaultEvent.png"
import moment from "moment-timezone";
import { useNavigate, useParams } from "react-router";
import Multiselect from "multiselect-react-dropdown";
import { CATEGORIES } from "../constants/Constants";

class Event {
    constructor(eventBuilding, eventDesc, eventEnd, eventImg, eventImgType, eventName, eventRoom, eventStart, id, oneLiner, organizerID, registered) {
        this.eventBuilding = eventBuilding;
        this.eventDesc = eventDesc;
        this.eventEnd = eventEnd;
        this.eventImg = eventImg;
        this.eventImgType = eventImgType;
        this.eventName = eventName;
        this.eventRoom = eventRoom;
        this.eventStart = eventStart;
        this.id = id;
        this.oneLiner = oneLiner;
        this.organizerID = organizerID;
        this.registered = registered;
    }
}

const UserPage=()=> {
    const {
        userId,
        setUserId
    } = useUserContext()

    const params = useParams();

    const requestedUserId = params['id']

    const [value, setValue] = useState("Hosting")
    const [showPastEvents, setShowPastEvents] = useState(false)
    const navigate = useNavigate()

    async function onOptionChange(value) {
        setEvents([]);
        fetchEvents(value, showPastEvents)
        await setValue(value);
    }

    async function onCheck() {
        setEvents([]);
         await setShowPastEvents(!showPastEvents);
        fetchEvents(value, !showPastEvents);

    }

    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [interests, setInterests] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")

    const [events, setEvents] = useState([]);
    const [privacy, setPrivacy] = useState({})

    function fetchEvents(option, showPastEvents) {
        if(requestedUserId == userId){
            navigate('/profile');
            return;
        }

        const requestOptions={
        method:"POST",
        headers:{
           'content-type':'application/json'
        },
        body:JSON.stringify({option: option, showPastEvents: showPastEvents, myID: userId})
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
        function fetchUser() {
            if (userId != null) {
                const requestOptions = {
                    method: "POST",
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({id: requestedUserId, myID: userId})
                }
                fetch('/api/getUserInfo', requestOptions)
                    .then(response => response.json())
                    .then(data => {
                        setEmail(data.emailaddr)
                        setPhone(data.phonenumber)
                        setFirstName(data.firstname)
                        setLastName(data.lastname)
                        setInterests(data.interests)
                        setPrivacy(data.privacy)
                    });
            }
        }




        fetchUser();
        fetchEvents(value, showPastEvents);

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

    async function onOptionChange(value) {
        setEvents([]);
        fetchEvents(value, showPastEvents)
        await setValue(value);
    }

    async function onCheck() {
        setEvents([]);
         await setShowPastEvents(!showPastEvents);
        fetchEvents(value, !showPastEvents);


    }

    return(
        <div className="alternateFlexBox">
            <div className="flexbox-user-container">
                <UploadAvatar/>
                <div className="person-name-font">{firstName} {lastName}</div>
                 <div className= "person-table">
                        <div className="sectionFont">First name</div>
                        <div className="flexbox-horizontal-container">
                            <input className="inputField" disabled='disabled' defaultValue={firstName}/>
                        </div>

                     <div className="sectionFont">Last name</div>
                        <div className="flexbox-horizontal-container">

                            <input className="inputField" disabled='disabled' defaultValue={lastName}/>
          
        
                        </div>

                        <Divider></Divider>
                        <div className="sectionFont">Contact info</div>
                        <Divider></Divider>

                        <div className="flexbox-horizontal-container">
                            <div>
                                <img src={mailIcon}/>
                            </div>
                            <input className="inputField" disabled='disabled' defaultValue={email}/>

                        </div>

                        <div className="horizontal_divider"></div>

                        <div className="flexbox-horizontal-container">
                            <div>
                                <img src={phoneIcon}/>
                            </div>
                            <input className="inputField" disabled='disabled' defaultValue={phone}/>
                        </div>

                        <Divider></Divider>
                        <div className="sectionFont">Interests</div>
                        <Divider></Divider>
                        <Multiselect   
                                //options={CATEGORIES} // Options to display in the dropdown
                                selectedValues = {interests}
                                showCheckbox='true'
                                className='interests'
                                //disablePreSelectedValues='true'
                                placeholder=""
                                disable='true'
                                displayValue="name" // Property name to display in the dropdown options
                            />
                            
          
                    </div>
            </div>

            <div className="event-wish-list-table">


                <div className="flexbox-horizontal-container">

                    <div className="event-list-title">{firstName}'s events</div>
                    <p className="checkboxTitle">Show past events</p>
                    <input type="checkbox" className = "checkbox"  checked={showPastEvents} onChange={onCheck}></input>
                    <select className="comboBoxOption" id="option" value = {value} onChange={(e) => onOptionChange((e.target.value))}>
                        <option value="Hosting">Hosting</option>
                        <option value="Attending">Attending</option>
                    </select>

                </div>
                {events.length == 0 ? <div className="event-list-title">No events of this catagory or this information is private</div> : <ul className="eventList">{arrayDataItems}</ul>}
                
            </div>
        </div>

    )
}

export default UserPage
