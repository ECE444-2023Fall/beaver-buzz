import { useState, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import './Host.css';
import '../LoginSignup/Form.css'
import {useNavigate} from "react-router-dom";
import UserContext from '../UserContext';
import { MultiSelect } from 'primereact/multiselect';
        

const getBase64 = blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

export default function HostPage() {
    const { register, handleSubmit } = useForm();
    const [selectedTags, setTags] = useState(null);
    const navigate = useNavigate();
    const {userId} = useContext(UserContext);

    const tags = [
        {name: 'Academic'},
        {name: 'Arts'},
        {name: 'Career'},
        {name: 'Cultural'},
        {name: 'Food'},
        {name: 'Health'},
        {name: 'Music'},
        {name: 'Social'},
        {name: 'Sports'},
        {name: 'Technology'},
        {name: 'Other'}
    ];

    const onSubmit = async (data) => {
        console.log(data);
        data['organizerID'] = userId;
        data['image'] = data['image'].length == 0 ? '../images/defaultEvent.png' : await getBase64(data['image'].item(0));
        console.log(data);
        const requestOptions={
            method:"POST",
            headers:{
               'content-type':'application/json'
            },
            body:JSON.stringify(data)
        }
        
        fetch('/api/events/new', requestOptions)
            .then(response => response.json())
            .then(data => {
                if(data['event_id']) {
                    navigate("/events/" + data.event_id);
                }
                console.log(data)
            });

    };

    return (
        <div>
            <div className="host-container">
            <h1 className="form-title" style={{ marginTop: '20px' }} >Want to host an event?</h1>
                <Form onSubmit={handleSubmit(onSubmit)} className='host-form'>
                    <Form.Group controlId="eventName">
                        <Form.Label className="form-label">Event Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter event name"
                            maxLength={50}
                            {...register("eventName", { required: true })}
                            className="form-input"
                        />
                    </Form.Group>

            <Form.Group controlId="oneLiner">
                <Form.Label className="form-label">One-liner</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter one-liner"
                    maxLength={75}
                    {...register("oneLiner")}
                    className="form-input"
                />
            </Form.Group>

            <Form.Group controlId="eventDate">
                <Form.Label className="form-label">Date</Form.Label>
                <Form.Control
                    type="date"
                    placeholder="Enter date"
                    {...register("eventDate", { required: true })}
                    className="form-input"
                />
            </Form.Group>

            <div className="form-row">
                <div className="col">
                    <Form.Group controlId="eventStart">
                        <Form.Label className="form-label">Start Time</Form.Label>
                        <Form.Control
                            type="time"
                            placeholder="Enter start time"
                            {...register("eventStart", { required: true })}
                            className="form-input"
                        />
                    </Form.Group>
                </div>
                <div className="col">
                    <Form.Group controlId="eventEnd">
                        <Form.Label className="form-label">End Time</Form.Label>
                        <Form.Control
                            type="time"
                            placeholder="Enter end time"
                            {...register("eventEnd", { required: true })}
                            className="form-input"
                        />
                    </Form.Group>
                </div>
            </div>

            <Form.Group controlId="building">
                <Form.Label className="form-label">Building</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter building name"
                    maxLength={25}
                    {...register("building", { required: true })}
                    className="form-input"
                />
            </Form.Group>

            <Form.Group controlId="room">
                <Form.Label className="form-label">Room</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter building room"
                    maxLength={10}
                    {...register("room", { required: true })}
                    className="form-input"
                />
            </Form.Group>

            <Form.Group controlId="description">
                <Form.Label className="form-label">Description</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    maxLength={256}
                    placeholder="Enter description"
                    {...register("description")}
                    className="form-input"
                />
            </Form.Group>

            <Form.Group controlId="image">
                <Form.Label className="form-label">Upload Image</Form.Label>
                <Form.Control
                    type="file"
                    accept=".jpg,.gif,.png"
                    {...register("image")}
                    className="form-input"
                />
            </Form.Group>

            <Form.Group controlId="tags">
                <Form.Label className="form-label">Select related topics</Form.Label>
                    <div className="dropdown">
                     <MultiSelect 
                        value={selectedTags} 
                        onChange={(e) => setTags(e.value)} 
                        options={tags} 
                        optionLabel="name" 
                        placeholder="Select topics" className="w-full md:w-20rem" />
                    </div>
                    
                </Form.Group>

            <Button variant="primary" type="submit" className="host-button">
                Post Event
            </Button>

                </Form>
 
            </div>
        </div>
    )
}