import { useState, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import './Host.css';
import '../Login/form.css'
import {useNavigate} from "react-router-dom";
import UserContext from '../UserContext';

export default function HostPage() {
    const { register, handleSubmit } = useForm();
    const [tags, setTags] = useState([]);
    const navigate = useNavigate();
    const {userId} = useContext(UserContext);

    const onSubmit = (data) => {
        console.log(data);
        data['organizerID'] = userId;
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
            if(data.event_id) {
                navigate("/events/" + data.event_id);
            }
            console.log(data)
            });

    };

    const handleTagChange = (e) => {
        const selectedTags = Array.from(e.target.selectedOptions, (option) => option.value);
        setTags(selectedTags);
    };

    return (
        <div>
            <div className="host-container">
            <h1>Host</h1>
            <Form onSubmit={handleSubmit(onSubmit)} className='host-form'>
                <Form.Group controlId="eventName">
                    <Form.Label>Event Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter event name" {...register("eventName", { required: true })} />
                </Form.Group>

                <Form.Group controlId="oneLiner">
                    <Form.Label>One-liner</Form.Label>
                    <Form.Control type="text" placeholder="Enter one-liner" {...register("oneLiner")} />
                </Form.Group>

                <Form.Group controlId="eventDate">
                    <Form.Label>Date</Form.Label>
                    <Form.Control type="date" placeholder="Enter date" {...register("eventDate", { required: true })} />
                </Form.Group>

                <Form.Group controlId="eventStart">
                    <Form.Label>Time</Form.Label>
                    <Form.Control type="time" placeholder="Enter start time" {...register("eventStart", { required: true })} />
                </Form.Group>

                <Form.Group controlId="eventEnd">
                    <Form.Label>Time</Form.Label>
                    <Form.Control type="time" placeholder="Enter end time" {...register("eventEnd", { required: true })} />
                </Form.Group>

                <Form.Group controlId="building">
                    <Form.Label>Building</Form.Label>
                    <Form.Control type="text" placeholder="Enter building name" {...register("building", { required: true })} />
                </Form.Group>

                <Form.Group controlId="room">
                    <Form.Label>Room</Form.Label>
                    <Form.Control type="text" placeholder="Enter building room" {...register("room", { required: true })} />
                </Form.Group>

                <Form.Group controlId="description">
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="Enter description" {...register("description")} />
                </Form.Group>

                <Form.Group controlId="image">
                    <Form.Label>Upload Image</Form.Label>
                    <Form.Control type="file" {...register("image")} />
                </Form.Group>

                <Form.Group controlId="tags">
                    <Form.Label>Tags</Form.Label>
                    <Form.Control as="select" multiple onChange={handleTagChange}>
                        <option value="music">Music</option>
                        <option value="food">Food</option>
                        <option value="sports">Sports</option>
                        <option value="art">Art</option>
                    </Form.Control>
                </Form.Group>

                <Button variant="primary" type="submit" className='host-button'>
                    Post Event
                </Button>
            </Form>
            </div>
        </div>
    )
}