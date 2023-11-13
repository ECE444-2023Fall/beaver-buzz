import React, {useState} from 'react'

const SearchBar=()=>{
    const { register, handleSubmit} = useForm();
    const[result, setResult] = useState('')

    const onSubmit = (data) => {
        console.log(data);
        const requestOptions={
        method:"POST",
        headers:{
           'content-type':'application/json'
        },
        body:JSON.stringify(data)
        }
        fetch('/search', requestOptions) 
        .then(response => response.json())
        .then(data => {
            setResult(data.result)

        console.log(data)
        });
    }


    return(
        <div className ="container">
            <div className="form-center">
                <h1>Login</h1><br/>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Form.Group>
                            <h1>What events I want to attend:</h1>
                            <Form.Control type="text"
                                placeholder="Put event name here"
                                id="input"
                                          className="input"
                                 {...register("search", { required: true})}
                            />
                        </Form.Group>
                        <br></br>
                        <p>{result}</p>
                        <Button type='submit' className="submitButton">Search</Button>

                    </Form>
            </div>
        </div>

    )
}

export default LoginPage