import React, {useState} from 'react'
import {Form,Button} from 'react-bootstrap'
import "./Form.css"
import {useForm} from "react-hook-form";
import {useNavigate} from "react-router-dom";
import Multiselect from 'multiselect-react-dropdown';
import { CATEGORIES } from '../constants/Constants';
const RegisterPage=()=>{
    const[emailTaken, setTaken] = useState(false)
    const[greeting, setGreeting] = useState('')
    const[interests, setInterests] = useState(null);

    const navigate = useNavigate();

     const { register, handleSubmit, formState: { errors } } = useForm();
    const onSubmit = (data) => {
        data.interests = interests;

        const requestOptions={
        method:"POST",
        headers:{
           'content-type':'application/json'
        },
        body:JSON.stringify(data)
        }
        fetch('/api/register', requestOptions)
        .then(response => response.json())
        .then(data => {
        if(data.greeting) {
            setTaken(false);
            setGreeting(data.greeting);
            navigate("/login");
        }
        else {
            setTaken(true);
            setGreeting('');
        }
        console.log(data)
        });
    }


    


    return(
        <div className ="container">
            <div className="form-center">
                
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <h1 className="form-title">Register Here</h1>
                        <h1 className="form-name">Email</h1>
                        
                        <Form.Group>
                            <Form.Control type="email"
                                placeholder="Email"
                                id="input"
                                          className="input"
                                 {...register("email", { required: true, maxLength: 100 })}o
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
                        <br/>
                        <h1 className="form-name">First Name</h1>
                            <Form.Group>
                                <Form.Control type="text"
                                    placeholder="First name"
                                    id="firstname"
                                               className="input"
                                    {...register("firstname", { required: true})}
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
                                    {...register("lastname", { required: true})}
                                />
                            </Form.Group>
                           {errors.lastname && <p className="error">{"Please enter your last name"}</p>}
                            <br></br>

                            <h1 className="form-name">Phone Number</h1>
                            <Form.Group>
                                <Form.Control type="tel"
                                    placeholder="Phone number"
                                   pattern = "[0-9]{3}-[0-9]{3}-[0-9]{4}" 
                                   className="input"
                                    id="phonenumber"
                                     {...register("phonenumber", { required: false})}
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
                            onRemove={(e) => {;
                                setInterests(e);
                            }} // Function will trigger on remove event
                            displayValue="name" // Property name to display in the dropdown options
                            />
                            {/* <Form.Group>
                                <Form.Control as="textarea"
                                        rows={3}
                                        placeholder="Tell us about your interests!"
                                        id="interests"
                                               className="input"
                                              resize = "none"
                                              width = "100px"
                                        {...register("interests", { required: false})}
                                />
                            </Form.Group>*/}
                        {!emailTaken ? <p>{greeting}</p> : <p className="error">There is already an account registered with this email</p>} 
                        <Button type='submit' className="submitButton" style={{ marginTop: '20px' }}><h1 className="form-button">Register</h1></Button>

                    </Form>

            </div>

        </div>

    )
}

export default RegisterPage