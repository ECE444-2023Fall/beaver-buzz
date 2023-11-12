import { useState, useContext } from "react";
import { Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import "./Host.css";
import "../LoginSignup/Form.css";
import { useNavigate } from "react-router-dom";
import UserContext from "../UserContext";
import Multiselect from "multiselect-react-dropdown";
import { CATEGORIES } from "../constants/Constants";

const getBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export default function HostPage() {
  const { register, handleSubmit } = useForm();
  const [tags, setTags] = useState(null);
  const navigate = useNavigate();
  const { userId } = useContext(UserContext);

  const onSubmit = async (data) => {
    console.log(data);
    data["organizerID"] = userId;
    data["image"] =
      data["image"].length == 0
        ? "../images/defaultEvent.png"
        : await getBase64(data["image"].item(0));
    data["tags"] = tags == null ? [] : tags.map((tag) => tag.name);
    console.log(data);
    const requestOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    };

    fetch("/api/events/new", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data["event_id"]) {
          // redirect to event page once created
          navigate("/events/" + data.event_id);
        }
        console.log(data);
      });
  };

  return (
    <div>
      <div className="host-container">
        <h1>Host</h1>
        {!userId ? (
          <div>
            <h2>Please log in to host an event </h2>
            <button className="host-button" onClick={() => navigate("/login")}>
              Log In
            </button>
          </div>
        ) : (
          <Form onSubmit={handleSubmit(onSubmit)} className="host-form">
            <Form.Group controlId="eventName" className="left-right">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter event name"
                maxLength={50}
                {...register("eventName", { required: true })}
              />
            </Form.Group>

            <Form.Group controlId="oneLiner" className="left-right">
              <Form.Label>One-liner</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter one-liner"
                maxLength={75}
                {...register("oneLiner")}
              />
            </Form.Group>

            <Form.Group controlId="eventDate" className="left-right">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                placeholder="Enter date"
                {...register("eventDate", { required: true })}
              />
            </Form.Group>

            <div class="form-row">
              <div class="col">
                <Form.Group controlId="eventStart">
                  <Form.Label className="add-padd">Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    placeholder="Enter start time"
                    {...register("eventStart", { required: true })}
                  />
                </Form.Group>
              </div>
              <div class="col">
                <Form.Group controlId="eventEnd">
                  <Form.Label className="add-padd">End Time</Form.Label>
                  <Form.Control
                    type="time"
                    placeholder="Enter end time"
                    {...register("eventEnd", { required: true })}
                  />
                </Form.Group>
              </div>
            </div>

            <div class="form-row">
              <div class="col">
                <Form.Group controlId="building">
                  <Form.Label className="add-padd">Building</Form.Label>
                  <Form.Control
                    className="w-60"
                    type="text"
                    placeholder="Enter building"
                    maxLength={25}
                    {...register("building", { required: true })}
                  />
                </Form.Group>
              </div>
              <div class="col">
                <Form.Group controlId="room">
                  <Form.Label className="add-padd">Room</Form.Label>
                  <Form.Control
                    className="w-25"
                    type="text"
                    placeholder="#"
                    maxLength={10}
                    {...register("room", { required: true })}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group controlId="description" className="left-right">
              <Form.Label className="add-padd">Description</Form.Label>
              <Form.Control
                className="w-100"
                as="textarea"
                rows={3}
                maxLength={256}
                placeholder="Enter description"
                {...register("description")}
              />
            </Form.Group>

            <Form.Group controlId="image" className="left-right">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control
                type="file"
                accept=".jpg,.gif,.png"
                {...register("image")}
              />
            </Form.Group>

            <Form.Group controlId="tags" className="left-right">
              <Form.Label>Select related topics</Form.Label>
              <div className="dropdown">
                <Multiselect
                  options={CATEGORIES}
                  onSelect={(e) => setTags(e)}
                  onRemove={(e) => setTags(e)}
                  selectedValues={tags}
                  showCheckbox="true"
                  placeholder="Click to select"
                  className="tags"
                  hidePlaceholder="true"
                  displayValue="name"
                  optionLabel="name"
                />
              </div>
            </Form.Group>

            <Button variant="primary" type="submit" className="host-button">
              Post Event
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
}
