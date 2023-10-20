import React, {useState} from 'react'
import {Form,Button} from 'react-bootstrap'
import "./form.css"
import {useForm} from "react-hook-form";
import {useNavigate} from "react-router-dom";
const RegisterPage=()=>{
    const[emailTaken, setTaken] = useState(false)
    const[greeting, setGreeting] = useState('')

    const navigate = useNavigate();

     const { register, handleSubmit, formState: { errors } } = useForm();
    const onSubmit = (data) => {
        console.log(data);
        const requestOptions={
        method:"POST",
        headers:{
           'content-type':'application/json'
        },
        body:JSON.stringify(data)
        }
        fetch('/register', requestOptions)
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
                <h1>Register</h1><br/>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <label htmlFor="email">Email</label>
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
                        <label htmlFor="password">Password</label>
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
                         <label htmlFor="firstname">First name</label>
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

                            <label htmlFor="lastname">Last name</label>
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

                            <label htmlFor="phonenumber">Phone number (Optional)</label>
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

                            <label htmlFor="interests">What are your interests? (Optional)</label>
                            <Form.Group>
                                <Form.Control as="textarea"
                                        rows={3}
                                        placeholder="Tell us about your interests!"
                                        id="interests"
                                               className="input"
                                              resize = "none"
                                              width = "100px"
                                        {...register("interests", { required: false})}
                                />
                            </Form.Group>
                        {!emailTaken ? <p>{greeting}</p> : <p className="error">There is already an account registered with this email</p>}
                        <Button type='submit' className="submitButton">Register</Button>

                    </Form>

            </div>

        </div>

    )
}

export default RegisterPage