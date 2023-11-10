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
    const [avatar, setAvatar] = useState(null);

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
                        setAvatar(data.avatar);
                    });
            }
        }




        fetchUser();
        fetchEvents(value, showPastEvents);

    }, []);
    const firstNameRef = useRef(null);
    const [firstNameDisabled, setFirstNameDisabled] = useState('true')

     const submitFirstName = event => {
        setFirstNameDisabled(true)
        const newValue = firstNameRef.current.value;
        if (newValue !== firstName) {
                        const requestOptions = {
                method: "POST",
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({id: userId, firstname: newValue})
            }
            fetch('/api/setFirstname', requestOptions)
                .then(response => response.json())
                .then(data => {
                });
                        event.target.value = newValue
            setFirstName(newValue)
        }
    }

    const lastNameRef = useRef(null);
    const [lastNameDisabled, setLastNameDisabled] = useState('true')

    const submitLastName = event => {
        setLastNameDisabled(true)
        const newValue = lastNameRef.current.value;
        if (newValue !== lastName) {

            const requestOptions = {
                method: "POST",
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({id: userId, lastname: newValue})
            }
            fetch('/api/setLastname', requestOptions)
                .then(response => response.json())
                .then(data => {
                });
            //event.target.value = newValue
            setLastName(newValue)
        }
    }

    const emailRef = useRef(null);
    const [emailDisabled, setEmailDisabled] = useState('true')

    const submitEmail = event => {
        setEmailDisabled(true)
        const newValue = emailRef.current.value;
        if (newValue !== lastName && newValue != email) {
            const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (emailRegex.test(newValue)) {
                const requestOptions = {
                    method: "POST",
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({id: userId, email: newValue})
                }
                fetch('/api/setEmail', requestOptions)
                    .then(response => response.json())
                    .then(data => {
                        if(data.error != null) {
                            alert("Error: " + data.error)
                            event.target.value = email;
                        }
                        else {
                            event.target.value = newValue
                            setEmail(newValue);
                        }
                    });

            } else {
                event.target.value = email;
            }
        }
    }


    const phoneRef = useRef(null);
    const [phoneDisabled, setPhoneDisabled] = useState('true')

    const submitPhone = event => {
        setPhoneDisabled(true)
        const phoneNumberRegex = /^\d{3}-\d{3}-\d{4}$/;
        const newValue = event.target.value
        if (phoneNumberRegex.test(newValue) && newValue != phone) {

            const requestOptions = {
                method: "POST",
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({id: userId, phone: newValue})
            }
            fetch('/api/setPhone', requestOptions)
                .then(response => response.json())
                .then(data => {
                    if(data.error != null) {
                        alert("Error: " + data.error)
                        event.target.value = phone;
                    }
                    else {
                        event.target.value = newValue
                        setPhone(newValue);
                    }

                });
            // this is a valid email address
            // call setState({email: email}) to update the email
            // or update the data in redux store.
        } else {
            event.target.value = phone;
        }
    }

    const interestsRef = useRef(null);
    const [interestsDisabled, setInterestsDisabled] = useState('true')

    const submitInterests = event => {
        setInterestsDisabled(true)
        const newValue = event.target.value
        if (newValue !== lastName) {
            const requestOptions = {
                method: "POST",
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({id: userId, interests: newValue})
            }
            fetch('/api/setInterests', requestOptions)
                .then(response => response.json())
                .then(data => {
                    if (data.status) {
                        event.target.value = newValue
                    }
                });
            // this is a valid email address
            // call setState({email: email}) to update the email
            // or update the data in redux store.
        } else {
            event.target.value = phone;
        }
    }


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
            <UploadAvatar id={userId} avatar={avatar}/>
                <div className="person-name-font">{firstName} {lastName}</div>
                 <div className= "person-table">
                        <div className="sectionFont">First name</div>
                        <div className="flexbox-horizontal-container">
                            <input className="inputField"
                                   onKeyDown={(e) => {
                                    if(e.keyCode === 13) {
                                        submitFirstName(e);
                                    }
                                }}
                                   onBlur={submitFirstName}  onFocus={(e)=>e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)} disabled = {firstNameDisabled? "disabled" : ""}   defaultValue={firstName} ref={firstNameRef}/>
                            <div className="pencil">
                                <Button onClick={async () => {
                                    await setFirstNameDisabled(false);
                                    firstNameRef.current.focus()
                                }} className="pencilButton"><img src={pencilIcon} alt={"broken"}/></Button>
                            </div>
                        </div>

                     <div className="sectionFont">Last name</div>
                        <div className="flexbox-horizontal-container">

                            <input className="inputField"
                                onKeyDown={(e) => {
                                    if(e.keyCode === 13) {
                                        submitLastName(e);
                                    }
                                }}
                                   onBlur={submitLastName}  onFocus={(e)=>e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)} disabled = {lastNameDisabled? "disabled" : ""}   defaultValue={lastName} ref={lastNameRef}/>
                            <div className="pencil">
                                <Button onClick={async () => {
                                    await setLastNameDisabled(false);
                                    lastNameRef.current.focus()
                                }} className="pencilButton"><img src={pencilIcon} alt={"broken"} /></Button>
                            </div>
                        </div>

                        <Divider></Divider>
                        <div className="sectionFont">Contact info</div>
                        <Divider></Divider>

                        <div className="flexbox-horizontal-container">
                            <div>
                                <img src={mailIcon}/>
                            </div>
                            <input className="inputField"
                                   onKeyDown={(e) => {
                                    if(e.keyCode === 13) {
                                        submitEmail(e);
                                        }
                                    }}
                                   onBlur={submitEmail}  onFocus={(e)=>e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)} disabled = {emailDisabled? "disabled" : ""}   defaultValue={email} ref={emailRef}/>
                            <div className="pencil">
                                <Button onClick={async () => {
                                    await setEmailDisabled(false);
                                    emailRef.current.focus()
                                }} className="pencilButton"><img src={pencilIcon} alt={"broken"} /></Button>
                            </div>
                        </div>

                        <div className="horizontal_divider"></div>

                        <div className="flexbox-horizontal-container">
                            <div>
                                <img src={phoneIcon}/>
                            </div>
                            <input className="inputField"
                                   onKeyDown={(e) => {
                                    if(e.keyCode === 13) {
                                        submitPhone(e);
                                    }
                                }}

                                   onBlur={submitPhone}  onFocus={(e)=>e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)} disabled = {phoneDisabled? "disabled" : ""} defaultValue={phone} ref={phoneRef}/>
                            <div className="pencil">
                                <Button onClick={async () => {
                                    await setPhoneDisabled(false);
                                    phoneRef.current.focus()
                                }} className="pencilButton"><img src={pencilIcon}  alt={"broken"}/></Button>
                            </div>
                        </div>

                        <Divider></Divider>
                        <div className="sectionFont">Interests</div>
                        <Divider></Divider>
                            <textarea rows = "8" className="textAreaField" onKeyDown={(e) => {
                                if(e.keyCode === 13) {
                                    submitInterests(e);
                                }
                            }} onBlur={submitInterests}  onFocus={(e)=>e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)} disabled = {interestsDisabled? "disabled" : ""}  defaultValue={interests}  ref={interestsRef}/>
                            <div className="pencil">
                                <Button onClick={async () => {
                                    await setInterestsDisabled(false);
                                    interestsRef.current.focus()
                                }} className="pencilButton"><img src={pencilIcon} alt={"broken"}/></Button>
                            </div>
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
