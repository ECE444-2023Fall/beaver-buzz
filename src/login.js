import React, {useState} from 'react'
import {Form,Button} from 'react-bootstrap'
import "./form.css"
import {Grid} from "semantic-ui-react"
import {Link} from "react-router-dom"
import {useForm} from "react-hook-form";
const LoginPage=()=>{
    const[credentialsValid, setCredentials] = useState(true)
    const[greeting, setGreeting] = useState('')

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
        console.log(data)
        });
    }





    return(
        <div className ="container">
            <div className="form-center">

                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <h1 className="form-title">Get Started Now</h1>
                        <h1 className="form-name">Email</h1>
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
                        <h1 className="form-name">Password</h1>
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
                        <Button type='submit' className="submitButton"><h1 className="form-button">Login</h1></Button>
                        <h1 className="form-name">Don't have an account?</h1><Link to='/register'><h1 className="form-name">Sign up here</h1></Link>
                    </Form>
                    

            </div>

        </div>

    )
}

export default LoginPage