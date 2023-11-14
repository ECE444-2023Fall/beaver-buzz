import { useEffect, useRef, useState } from "react";
import "./UserProfile.css";
import mailIcon from "../images/email.svg";
import phoneIcon from "../images/phone.svg";
import pencilIcon from "../images/pencil.svg";
import { Divider } from "semantic-ui-react";
import { useUserContext } from "../UserContext";
import { Button, Image } from "react-bootstrap";
import UploadAvatar from "../components/Avatar";
import defaultImage from "../images/defaultEvent.png";
import moment from "moment-timezone";
import { useNavigate, useParams } from "react-router";
import Multiselect from "multiselect-react-dropdown";
import { CATEGORIES } from "../constants/Constants";
import "../LoginSignup/Form.css";
import defaultUser from "../images/defaultUser.png";

class Event {
  constructor(
    eventBuilding,
    eventDesc,
    eventEnd,
    eventImg,
    eventImgType,
    eventName,
    eventRoom,
    eventStart,
    id,
    oneLiner,
    organizerID,
    registered
  ) {
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

const UserPage = () => {
  const { userId, setUserId } = useUserContext();

  const params = useParams();

  const requestedUserId = params["id"];

  const [value, setValue] = useState("Hosting");
  const [showPastEvents, setShowPastEvents] = useState(false);
  const navigate = useNavigate();

  async function onOptionChange(value) {
    setEvents([]);
    fetchEvents(value, showPastEvents);
    await setValue(value);
  }

  async function onCheck() {
    setEvents([]);
    await setShowPastEvents(!showPastEvents);
    fetchEvents(value, !showPastEvents);
  }

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interests, setInterests] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatar, setAvatar] = useState(null);

  const [events, setEvents] = useState([]);
  const [privacy, setPrivacy] = useState({});

  const [buttonState, setButtonState] = useState(null);

  function subscribeButtonClicked() {
    var mode;
    if (buttonState == "Subscribe") {
      setButtonState("Unsubscribe");
      mode = "subscribe";
    } else {
      setButtonState("Subscribe");
      mode = "unsubscribe";
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    };

    fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/users/${userId}/${mode}/${requestedUserId}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      });
  }

  function isSubscribedTo() {
    const requestOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    };

    fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/users/${userId}/isSubscribedTo/${requestedUserId}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((data) => {
        var res = data.result;
        if (res) {
          setButtonState("Unsubscribe");
        } else {
          setButtonState("Subscribe");
        }
      });
  }

  function fetchEvents(option, showPastEvents) {
    if (requestedUserId == userId) {
      navigate("/profile");
      return;
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        option: option,
        showPastEvents: showPastEvents,
        myID: userId,
      }),
    };

    fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/users/${requestedUserId}/events`,
      requestOptions
    )
      .then((response) => response.json())
      .then((data) => {
        var eventsArray = [];

        for (var i = 0; i < data.length; i++) {
          var start = data[i].eventStart.toString().replace("GMT", "EST");
          var end = data[i].eventEnd.toString().replace("GMT", "EST");

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

  useEffect(() => {
    function fetchUser() {
      if (userId != null) {
        const requestOptions = {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ id: requestedUserId, myID: userId }),
        };
        fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/getUserInfo`,
          requestOptions
        )
          .then((response) => response.json())
          .then((data) => {
            setEmail(data.emailaddr);
            setPhone(data.phonenumber);
            setFirstName(data.firstname);
            setLastName(data.lastname);
            setInterests(data.interests);
            setPrivacy(data.privacy);

            if (data.avatar) {
              setAvatar(data.avatar);
            } else {
              setAvatar(defaultUser);
            }
          });
      }
    }

    fetchUser();
    fetchEvents(value, showPastEvents);
    isSubscribedTo();
  }, []);

  const arrayDataItems = events.map((event) => (
    <li
      key={event.id}
      onClick={(e) => {
        console.log("hi");
        navigate("../events/" + event.id);
      }}
    >
      <div className="event-vertical-container">
        <div className="event-list-title-font">{event.eventName}</div>
        <Image
          className="eventImage"
          src={event.eventImg ? event.eventImg : defaultImage}
        ></Image>
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
          <div className="event-list-value-font">
            {event.eventBuilding}, {event.eventRoom}
          </div>
        </div>

        <div className="horizontal_divider"></div>
      </div>
    </li>
  ));

  async function onOptionChange(value) {
    setEvents([]);
    fetchEvents(value, showPastEvents);
    await setValue(value);
  }

  async function onCheck() {
    setEvents([]);
    await setShowPastEvents(!showPastEvents);
    fetchEvents(value, !showPastEvents);
  }

  return (
    <div className="mainFlexBox">
      <div className="left">
        <div className="flexbox-user-container">
            <UploadAvatar id={userId} avatar={avatar} />
          <Button
            className="subscribeButton"
            onClick={(e) => {
              subscribeButtonClicked();
            }}
          >
            {buttonState}{" "}
          </Button>
          <div className="person-name-font">
            {firstName} {lastName}
          </div>
          <div className="person-table">
            <div className="sectionFont">First name</div>
            <div className="flexbox-horizontal-container">
              <input
                className="inputField"
                disabled="disabled"
                defaultValue={firstName}
              />
            </div>

            <div className="sectionFont">Last name</div>
            <div className="flexbox-horizontal-container">
              <input
                className="inputField"
                disabled="disabled"
                defaultValue={lastName}
              />
            </div>

            <Divider></Divider>
            <div className="sectionFont">Contact info</div>
            <Divider></Divider>

            <div className="flexbox-horizontal-container">
              <div>
                <img src={mailIcon} />
              </div>
              <input
                className="inputField"
                disabled="disabled"
                defaultValue={email}
              />
            </div>

            <div className="horizontal_divider"></div>

            <div className="flexbox-horizontal-container">
              <div>
                <img src={phoneIcon} />
              </div>
              <input
                className="inputField"
                disabled="disabled"
                defaultValue={phone}
              />
            </div>

            <Divider></Divider>
            <div className="sectionFont">Interests</div>
            <Divider></Divider>
            <Multiselect
              //options={CATEGORIES} // Options to display in the dropdown
              selectedValues={interests}
              showCheckbox="true"
              className="interests"
              //disablePreSelectedValues='true'
              placeholder=""
              disable="true"
              displayValue="name" // Property name to display in the dropdown options
            />
          </div>
        </div>
      </div>
      
      <div className="left">
        <div className="event-wish-list-table">
          <div className="flexbox-horizontal-container">
            <div className="event-list-title">{firstName}'s events</div>
            <div className="event-list-title-right">
              <input
                type="checkbox"
                className="checkbox"
                checked={showPastEvents}
                onChange={onCheck}
              ></input>
              <p className="checkboxTitle">Show past events</p>

              <select
                className="comboBoxOption"
                id="option"
                value={value}
                onChange={(e) => onOptionChange(e.target.value)}
              >
                <option value="Hosting">Hosting</option>
                <option value="Attending">Attending</option>
              </select>
            </div>
          </div>
          {events.length == 0 ? (
            <div className="event-list-title">
              No events of this category or this information is private
            </div>
          ) : (
            <ul className="eventList">{arrayDataItems}</ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
