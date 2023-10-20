import React, {useState} from 'react'
import {Form,Button} from 'react-bootstrap'
import {Grid} from "semantic-ui-react"
import {Link} from "react-router-dom"
const LoginPage=()=>{
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')



    const handleLogin = () => {
        console.log("Form submitted")
        console.log(email)
        console.log(password)
        const requestOptions={
           method:"POST",
           headers:{
               'content-type':'application/json'
           },
           body:JSON.stringify({email:email, password:password})
       }
       fetch('/login', requestOptions)
        .then(response => response.json())
        .then(data => {
            if(data.error) {
                alert(data.error)
            }
            else if(data.greeting) {
                alert(data.greeting)
            }
            console.log(data)
        });
    }


    return(
        <div className ="container">
            <div className="form-center">
                <Grid>
                    <h1>Login</h1>
                        <form>
                            <label htmlFor="email">Email</label>
                            <Form.Group>
                                <Form.Control type="email"
                                    placeholder="Email"
                                    id="email"
                                    onChange={(e)=>{setEmail(e.target.value)}}
                                />
                            </Form.Group>
                            <br></br>
                            <label htmlFor="password">Password</label>
                            <Form.Group>
                                <Form.Control type="password"
                                    placeholder="Password"
                                    id="password"
                                    onChange={(e)=>{setPassword(e.target.value)}}
                                />
                            </Form.Group>
                            <br></br>
                            <Form.Group>
                                <Button className="btn btn-primary" onClick={handleLogin}>Login</Button>
                            </Form.Group>
                        </form>
                        <p>Don't have an account?</p><Link to='/register'>Register here</Link>
                </Grid>
            </div>

        </div>

    )
}

export default LoginPage