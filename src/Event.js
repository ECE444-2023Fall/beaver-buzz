import React, { useContext } from 'react';
import { Button } from './components/Button';
import UserContext from './UserContext';

const EVENTID = 1234; //TODO: replace with actual event ID

export default function EventPage(){

    const[userId] = useContext(UserContext);

    const register = () => {
        fetch(`/api/events/${EVENTID}/register/${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        }).then((res) => {
            if (res.status === 200) {
                console.log("Successfully registered");
            } else {
                console.log("Failed to register");
            }
            console.log(res);
        }).catch((error) => {
            console.log(error);
        });
    }

    return (
        <div>
            <p>Filler for events page here</p>
            <Button buttonStyle='btn--primary' onClick={register}>Register</Button>
        </div>
    );
}