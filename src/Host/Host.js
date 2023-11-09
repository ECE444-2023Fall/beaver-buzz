import { useState, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import './Host.css';
import '../Login/form.css'
import {useNavigate} from "react-router-dom";
import UserContext from '../UserContext';

const getBase64 = blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

export default function HostPage() {
    const { register, handleSubmit } = useForm();
    const [tags, setTags] = useState([]);
    const navigate = useNavigate();
    const {userId} = useContext(UserContext);

    const onSubmit = async (data) => {
        data['organizerID'] = userId;
        data['image'] = await getBase64(data['image'].item(0));
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
                    <Form.Control type="text" placeholder="Enter event name" maxLength={50}{...register("eventName", { required: true })} />
                </Form.Group>

                <Form.Group controlId="oneLiner">
                    <Form.Label>One-liner</Form.Label>
                    <Form.Control type="text" placeholder="Enter one-liner" maxLength={75} {...register("oneLiner")} />
                </Form.Group>

                <Form.Group controlId="eventDate">
                    <Form.Label>Date</Form.Label>
                    <Form.Control type="date" placeholder="Enter date" {...register("eventDate", { required: true })} />
                </Form.Group>
                <div class="form-row">
                <div class="col">
                <Form.Group controlId="eventStart">
                    <Form.Label>Start Time</Form.Label>
                    <Form.Control type="time" placeholder="Enter start time" {...register("eventStart", { required: true })} />
                </Form.Group></div>
                <div class="col">
                <Form.Group controlId="eventEnd">
                    <Form.Label>End Time</Form.Label>
                    <Form.Control type="time" placeholder="Enter end time" {...register("eventEnd", { required: true })} />
                </Form.Group></div>
                </div>

                <Form.Group controlId="building">
                    <Form.Label>Building</Form.Label>
                    <Form.Control type="text" placeholder="Enter building name" maxLength={25} {...register("building", { required: true })} />
                </Form.Group>

                <Form.Group controlId="room">
                    <Form.Label>Room</Form.Label>
                    <Form.Control type="text" placeholder="Enter building room" maxLength={10} {...register("room", { required: true })} />
                </Form.Group>

                <Form.Group controlId="description">
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={3} maxLength={256} placeholder="Enter description" {...register("description")} />
                </Form.Group>

                <Form.Group controlId="image">
                    <Form.Label>Upload Image</Form.Label>
                    <Form.Control type="file" accept=".jpg,.gif,.png" {...register("image")} />
                </Form.Group>

                <Form.Group controlId="tags">
                    <Form.Label>Tags</Form.Label>
                    <select class="form-control" id="exampleFormControlSelect1" onChange={handleTagChange}>
                        <option>Tag1</option>
                        <option>Tag2</option>
                        <option>Tag3</option>
                        <option>Tag4</option>
                    </select>
                    {/* <Form.Control as="select" multiple onChange={handleTagChange}>
                        <option value="music">Music</option>
                        <option value="food">Food</option>
                        <option value="sports">Sports</option>
                        <option value="art">Art</option>
                    </Form.Control> */}
                </Form.Group>

                <Button variant="primary" type="submit" className='host-button'>
                    Post Event
                </Button>
            </Form>
            </div>
        </div>
    )
}