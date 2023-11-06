import React, {useState} from 'react'
import {Form,Button} from 'react-bootstrap'
import "./form.css"
import {Grid} from "semantic-ui-react"
import {Link} from "react-router-dom"
import {useForm} from "react-hook-form";
import UserContext from './UserContext';
import { useContext } from 'react';

const LoginPage=()=>{
    const[credentialsValid, setCredentials] = useState(true)
    const[greeting, setGreeting] = useState('')
    const[userId, setUserId] = useContext(UserContext);

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
        fetch('/api/login', requestOptions)
        .then(response => response.json())
        .then(data => {
            if(data.greeting) {
                setCredentials(true);
                setGreeting(data.greeting);
            }
            else {
                setCredentials(false);
                setGreeting('');
            }
            if (data.id) {
                setUserId(data.id);
            }
            console.log(data)
        });
    }





    return(
        <div className ="container">
            <div className="form-center">

                <h1>Login</h1><br/>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <label htmlFor="email">Email</label>
                        <Form.Group>
                            <Form.Control type="email"
                                placeholder="Email"
                                id="input"
                                          className="input"
                                 {...register("email", { required: true})}
                            />
                        </Form.Group>
                         {errors.email && <p className="error">{"Please enter your email"}</p>}
                        <br></br>
                        <label htmlFor="password">Password</label>
                        <Form.Group>
                            <Form.Control type="password"
                                placeholder="Password"
                                          className="input"
                                id="input"
                                 {...register("password", { required: true})}
                            />
                        </Form.Group>
                         {errors.password && <p className="error">{"Please enter your password"}</p>}
                        <br></br>
                        {credentialsValid ? <p>{greeting}</p> : <p className="error">Invalid email or password</p>}
                        <Button type='submit' className="submitButton">Login</Button>

                    </Form>
                    <p>Don't have an account?</p><Link to='/register'>Register here</Link>

            </div>

        </div>

    )
}

export default LoginPage