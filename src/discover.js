import React, {useState} from 'react'
import {Form,Button} from 'react-bootstrap'
import "./form.css"
import {Grid, Item} from "semantic-ui-react"
import {Link} from "react-router-dom"
import {useForm} from "react-hook-form";
import Card from './components/Card';
import CardGrid from './components/CardGrid';
const DiscoverPage=()=>{
    const[searchitems, setsearchitems] = useState([])
    const { register, handleSubmit, formState: { errors } } = useForm();
    const onSubmit = (data) => {
        console.log(data);
        var temp_data = {"filters": []}
        var filters = ["Bahen", "Myhal", "Sanford Fleming", "Robarts", "Rotman"]
        for (const key in data) { 
            console.log(key)
            if(key == "searchbar"){
                temp_data["searchbar"]= data["searchbar"]
            }
            if(filters.includes(key) && data[key] == true){
                temp_data["filters"].push(key)
            }
        }
        fetch('http://localhost:8000/api/search?'+new URLSearchParams(temp_data), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
                        .then(data => {
                setsearchitems(data)
            });
    }





    return(
        <div>
        <div className ="container">
            <div className="form-left">

                    <Form onSubmit={handleSubmit(onSubmit)}>

                        <label htmlFor="searchbar">Discover</label>
                        <Form.Group>
                            <Form.Control type="text"
                                placeholder="Enter Query Here"
                                id="searchbar"
                                          className="input"
                                 {...register("searchbar", { required: false})}
                            />
                        </Form.Group>
                        <Button type='submit' className="submitButton searchButton">Search</Button>
                        

                        <div key={`default-checkbox`} className="mb-3 filters">
                            <label>Search Filters </label> <br/><br/>
                            <Form.Check
                                type={"checkbox"}
                                id={`default-checkbox`}
                                label={`Bahen`}
                                {...register("Bahen", { required: false})}
                            />

                            <Form.Check
                                type={"checkbox"}
                                id={`default-checkbox`}
                                label={`Myhal`}
                                {...register("Myhal", { required: false})}
                            />
                            <Form.Check
                                type={"checkbox"}
                                id={`default-checkbox`}
                                label={`Sanford Fleming`}
                                {...register("Sanford Fleming", { required: false})}
                            />
                            <Form.Check
                                type={"checkbox"}
                                id={`default-checkbox`}
                                label={`Robarts`}
                                {...register("Robarts", { required: false})}
                            />
                            <Form.Check
                                type={"checkbox"}
                                label={`Rotman`}
                                id={`disabled-default-checkbox`}
                                {...register("Rotman", { required: false})}
                            />
                        </div>
                    </Form>
            </div>

        </div>
        <div class="searchresults">
            
            <CardGrid>
                { searchitems?.map(item=>
                    <div class = "card" style = {{display:"flex"}}>
                    <Card key={item} style = {{display:"flex"}}>
                        <h1>{item.eventName}</h1>
                        <h2>Location: {item.eventBuilding}</h2>
                    </Card>
                    </div>
                )
                }
            </CardGrid>
            
            
        </div>
    </div>

    )
}

export default DiscoverPage