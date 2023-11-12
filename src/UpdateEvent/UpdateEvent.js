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
                    setData(d)
                })
                .catch((error) => { console.log(error); setData(-1); })
        };
        fetchInfo();
    }, [id]);

    const onSubmit = async (data) => {
        console.log(data);
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
                    navigate("/events/" + data.event_id);
                }
                console.log(data)
            });

    };

    return (
        <div>
            <div className="host-container">
                <h1>Update Event</h1>
                <Form onSubmit={handleSubmit(onSubmit)} className='host-form'>
                    <Form.Group controlId="eventName">
                        <Form.Label>Event Name</Form.Label>
                        <Form.Control type="text" defaultValue={data.eventName} maxLength={50}{...register("eventName", { required: true })} />
                    </Form.Group>

                    <Form.Group controlId="oneLiner">
                        <Form.Label>One-liner</Form.Label>
                        <Form.Control type="text" defaultValue={data.oneLiner} maxLength={75} {...register("oneLiner", { required: true })} />
                    </Form.Group>

                    <Form.Group controlId="eventDate">
                        <Form.Label>Date</Form.Label>
                        <Form.Control type="date" defaultValue={data.eventDate} {...register("eventDate", { required: true })} />
                    </Form.Group>
                    <div className="form-row">
                        <div className="col">
                            <Form.Group controlId="eventStart">
                                <Form.Label>Start Time</Form.Label>
                                <Form.Control type="time" defaultValue={data.startTime} {...register("eventStart", { required: true })} />
                            </Form.Group></div>
                        <div className="col">
                            <Form.Group controlId="eventEnd">
                                <Form.Label>End Time</Form.Label>
                                <Form.Control type="time" defaultValue={data.endTime} {...register("eventEnd", { required: true })} />
                            </Form.Group></div>
                    </div>

                    <Form.Group controlId="building">
                        <Form.Label>Building</Form.Label>
                        <Form.Control type="text" defaultValue={data.eventBuilding} maxLength={25} {...register("building", { required: true })} />
                    </Form.Group>

                    <Form.Group controlId="room">
                        <Form.Label>Room</Form.Label>
                        <Form.Control type="text" defaultValue={data.eventRoom} maxLength={10} {...register("room", { required: true })} />
                    </Form.Group>

                    <Form.Group controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={3} maxLength={256} defaultValue={data.eventDesc} {...register("description", { required: true })} />
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