import React, {useState} from 'react'
import {Form,Button} from 'react-bootstrap'
import {Grid} from "semantic-ui-react"
const RegisterPage=()=>{
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [phonenumber, setPhonenumber] = useState('')
    const [interests, setInterests] = useState('')



    const handleRegister = () => {
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
       fetch('/register', requestOptions)
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
                    <h1>Register</h1>
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
                            <label htmlFor="firstname">First name</label>
                            <Form.Group>
                                <Form.Control type="text"
                                    placeholder="First name"
                                    id="firstname"
                                    onChange={(e)=>{setFirstname(e.target.value)}}
                                />
                            </Form.Group>
                            <br></br>

                            <label htmlFor="lastname">Last name</label>
                            <Form.Group>
                                <Form.Control type="text"
                                    placeholder="Last name"
                                    id="lastname"
                                    onChange={(e)=>{setLastname(e.target.value)}}
                                />
                            </Form.Group>
                            <br></br>

                            <label htmlFor="phonenumber">Phone number (Optional)</label>
                            <Form.Group>
                                <Form.Control type="tel"
                                    pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                                    placeholder="Phone number"
                                    id="phonenumber"
                                    onChange={(e)=>{setPhonenumber(e.target.value)}}
                                />
                            </Form.Group>
                            <br></br>

                            <label htmlFor="interests">What are your interests?</label>
                            <Form.Group>
                                <Form.Control as="textarea"
                                        rows={3}
                                        placeholder="Tell us about your interests!"
                                        id="interests"
                                              resize = "none"
                                              width = "100px"
                                        onChange={(e)=>{setInterests(e.target.value)}}
                                />

                            </Form.Group>
                            <br></br>


                            <Form.Group>
                                <Button className="btn btn-primary" onClick={handleRegister}>Register</Button>
                            </Form.Group>
                        </form>
                </Grid>
            </div>

        </div>

    )
}

export default RegisterPage