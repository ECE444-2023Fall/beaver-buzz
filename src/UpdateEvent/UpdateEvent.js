import { useState, useContext, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import './UpdateEvent.css';
import '../LoginSignup/Form.css'
import { useNavigate } from "react-router-dom";
import UserContext from '../UserContext';
import Multiselect from "multiselect-react-dropdown";
import { CATEGORIES } from "../constants/Constants";
import { useParams } from "react-router-dom";



const getBase64 = blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

export default function EventUpdatePage() {
    const { id } = useParams();
    const { register, handleSubmit } = useForm();
    const [selectedTags, setTags] = useState(null);
    const navigate = useNavigate();
    const { userId } = useContext(UserContext);
    const [data, setData] = useState([]);
    const [visibility, setVisibility] = useState(false)
    const [eventName, setEventName] = useState([])
    const [oneLiner, setOneLiner] = useState([])
    const [eventDate, setEventDate] = useState([])
    const [startTime, setStartTime] = useState([])
    const [endTime, setEndTime] = useState([])
    const [eventBuilding, setEventBuilding] = useState([])
    const [eventRoom, setEventRoom] = useState([])
    const [eventDesc, setEventDesc] = useState([])

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
                .then((d) => {
                    // console.log(d);
                    let date = new Date(d["eventStart"])
                    let endDate = new Date(d["eventEnd"])
                    d["eventDate"] = date.toISOString().split('T')[0]
                    let startTime = date.toLocaleTimeString('it-IT')
                    let endTime = endDate.toLocaleTimeString('it-IT')
                    d["startTime"] = startTime.substring(0, 5)
                    d["endTime"] = endTime.substring(0, 5)
                    setTags(d["eventCategories"])
                    setEventName(d["eventName"])
                    setOneLiner(d["oneLiner"])
                    setEventDate(d["eventDate"])
                    setStartTime(d["startTime"])
                    setEndTime(d["endTime"])
                    setEventBuilding(d["eventBuilding"])
                    setEventRoom(d["eventRoom"])
                    setEventDesc(d["eventDesc"])
                    setData(d)
                })
                .catch((error) => { console.log(error); setData(-1); })
        };
        fetchInfo();
    }, [id]);

    const onSubmit = async (data) => {
        console.log(data);
        data['eventName'] = eventName;
        data['oneLiner'] = oneLiner;
        data['eventDate'] = eventDate
        data['eventStart'] = startTime
        data['eventEnd'] = endTime
        data['building'] = eventBuilding
        data['room'] = eventRoom
        data['description'] = eventDesc
        data['organizerID'] = userId;
        data['image'] = data['image'].length == 0 ? false : await getBase64(data['image'].item(0));
        data['eventCategories'] = selectedTags;
        console.log(data);
        const requestOptions = {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(data)
        }

        fetch(`/api/events/${id}/update`, requestOptions)
            .then(response => response.json())
            .then(data => {
                if (data['event_id']) {
                    setVisibility(true)
                    setTimeout(() => {
                        setVisibility(false);
                        navigate("/events/" + data.event_id);
                    }, 5000);
                }
                console.log(data)
            });

    };

    return (
        <div>
            <div className="host-container">
                {visibility && <div className="alert-container">
                    <div className="alert alert-info">
                        <span className="close">X</span>
                        <p>Event has been successfully updated!</p>
                        <p>Routing to event page in 5 seconds</p>
                    </div>
                </div>
                }
                <Form onSubmit={handleSubmit(onSubmit)} className='host-form'>
                    <h1>Update Event</h1>
                    <Form.Group controlId="eventName">
                        <Form.Label>Event Name</Form.Label>
                        <Form.Control type="text" defaultValue={eventName} onChange={(e) => setEventName(e.target.value)} maxLength={50} />
                    </Form.Group>

                    <Form.Group controlId="oneLiner">
                        <Form.Label>One-liner</Form.Label>
                        <Form.Control type="text" defaultValue={oneLiner} onChange={(e) => setOneLiner(e.target.value)} maxLength={75} />
                    </Form.Group>

                    <Form.Group controlId="eventDate">
                        <Form.Label>Date</Form.Label>
                        <Form.Control type="date" defaultValue={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                    </Form.Group>
                    <div className="form-row">
                        <div className="col">
                            <Form.Group controlId="eventStart">
                                <Form.Label>Start Time</Form.Label>
                                <Form.Control type="time" defaultValue={startTime} onChange={(e) => setStartTime(e.target.value)} />
                            </Form.Group></div>
                        <div className="col">
                            <Form.Group controlId="eventEnd">
                                <Form.Label>End Time</Form.Label>
                                <Form.Control type="time" defaultValue={endTime} onChange={(e) => setEndTime(e.target.value)} />
                            </Form.Group></div>
                    </div>

                    <Form.Group controlId="building">
                        <Form.Label>Building</Form.Label>
                        <Form.Control type="text" defaultValue={eventBuilding} onChange={(e) => setEventBuilding(e.target.value)} />
                    </Form.Group>

                    <Form.Group controlId="room">
                        <Form.Label>Room</Form.Label>
                        <Form.Control type="text" defaultValue={eventRoom} onChange={(e) => setEventRoom(e.target.value)} />
                    </Form.Group>

                    <Form.Group controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={3} maxLength={256} defaultValue={eventDesc} onChange={(e) => setEventDesc(e.target.value)} />
                    </Form.Group>

                    <Form.Group controlId="image">
                        <Form.Label>Upload Image</Form.Label>
                        <Form.Control type="file" accept=".jpg,.gif,.png" {...register("image")} />
                    </Form.Group>

                    <Form.Group controlId="tags">
                        <Form.Label>Select related topics</Form.Label>
                        <div className="dropdown">
                            <Multiselect
                                options={CATEGORIES}
                                onSelect={(e) => setTags(e)}
                                onRemove={(e) => setTags(e)}
                                selectedValues={selectedTags}
                                showCheckbox="true"
                                displayValue="name"
                                optionLabel="name"
                            />
                        </div>

                    </Form.Group>

                    <Button variant="primary" type="submit" className='host-button'>
                        Update Event
                    </Button>
                </Form>
            </div>
        </div>
    )
}