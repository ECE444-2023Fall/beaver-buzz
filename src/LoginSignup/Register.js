import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import "./Form.css"
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Multiselect from 'multiselect-react-dropdown';
import { CATEGORIES } from '../constants/Constants';
const RegisterPage = () => {
    const [errorAccount, setErrorAccount] = useState(false)
    const [greeting, setGreeting] = useState('')
    const [interests, setInterests] = useState(null);

    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm();
    const onSubmit = (data) => {
        data.interests = interests;
        if (!data.phonenumber.includes('-') && data.phonenumber != "") {
            data.phonenumber = data.phonenumber.substring(0, 3) + "-" + data.phonenumber.substring(3, 6) + "-" + data.phonenumber.substring(6, 10)
        }
        const requestOptions = {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(data)
        }
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/register`, requestOptions)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    // If the server response wasn't 'ok', throw an error with the status
                    return response.json().then((error) => {
                        console.log("HTTP Error!")
                        console.log(error)
                        setErrorAccount(true);
                        setGreeting(error.error);
                        throw new Error(error);
                    })
                }
            })
            .then(data => {
                if (data.greeting) {
                    setErrorAccount(false);
                    setGreeting(data.greeting);
                    navigate("/login");
                } else {
                    setErrorAccount(true);
                    setGreeting('');
                }
            })
            .catch((error) => {
                // This will catch any error that was thrown in the previous 'then' block
                console.error('There was a problem with the fetch operation:', error);
            });
    }





    return (
        <div className="container">
            <div className="form-center">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <h1 className="form-title">Register Here</h1>
                    <h1 className="form-name">Email</h1>

                    <Form.Group>
                        <Form.Control type="email"
                            placeholder="Email"
                            id="input"
                            className="input"
                            {...register("email", { required: true, maxLength: 100 })}
                        />
                    </Form.Group>
                    {errors.email && <p className="error">{"Please enter a valid email address"}</p>}
                    <br></br>
                    <h1 className="form-name">Password</h1>

                    <Form.Group>
                        <Form.Control type="password"
                            placeholder="Password"
                            className="input"
                            id="input"
                            {...register("password", { required: true, minLength: 8, maxLength: 100 })}
                        />
                    </Form.Group>
                    {errors.password && <p className="error">{"Please enter your password (8-100 chars)"}</p>}
                    <br />
                    <h1 className="form-name">First Name</h1>
                    <Form.Group>
                        <Form.Control type="text"
                            placeholder="First name"
                            id="firstname"
                            className="input"
                            {...register("firstname", { required: true })}
                        />
                    </Form.Group>
                    {errors.firstname && <p className="error">{"Please enter your first name"}</p>}
                    <br></br>

                    <h1 className="form-name">Last Name</h1>
                    <Form.Group>
                        <Form.Control type="text"
                            placeholder="Last name"
                            className="input"
                            id="lastname"
                            {...register("lastname", { required: true })}
                        />
                    </Form.Group>
                    {errors.lastname && <p className="error">{"Please enter your last name"}</p>}
                    <br></br>

                    <h1 className="form-name">Phone Number</h1>
                    <Form.Group>
                        <Form.Control type="tel"
                            placeholder="Phone number"
                            pattern="(\d{3}-\d{3}-\d{4}|\d{10})"
                            className="input"
                            id="phonenumber"
                            {...register("phonenumber", { required: false })}
                        />
                    </Form.Group>
                    <br></br>
                    <h1 className="form-name">What are your interests? (Optional) </h1>

                    <Multiselect
                        options={CATEGORIES} // Options to display in the dropdown
                        showCheckbox='true'
                        placeholder='Your interests'
                        className='interests'
                        hidePlaceholder='true'
                        onSelect={(e) => {
                            setInterests(e);

                        }} // Function will trigger on select event
                        onRemove={(e) => {
                            ;
                            setInterests(e);
                        }} // Function will trigger on remove event
                        displayValue="name" // Property name to display in the dropdown options
                    />
                    {errorAccount && <p className="error">{greeting}</p>}
                    <Button type='submit' className="submitButton" style={{ marginTop: '20px' }}><h1 className="form-button">Register</h1></Button>

                </Form>

            </div>

        </div>

    )
}

export default RegisterPage