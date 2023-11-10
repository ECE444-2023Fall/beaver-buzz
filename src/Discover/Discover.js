import React, {useEffect, useState} from 'react'
import {Form,Button} from 'react-bootstrap'
import "../Login/Form.css"
import {Grid, Item} from "semantic-ui-react"
import {Link} from "react-router-dom"
import {useForm} from "react-hook-form";
import Card from '../components/Card'
import CardGrid from '../components/CardGrid';
import { Dropdown } from 'react-bootstrap';

const DiscoverPage=()=>{
    const[searchitems, setsearchitems] = useState([])
    const { register, handleSubmit, formState: { errors } } = useForm();
    const locations = ["Academic", "Arts", "Career", "Cultural", "Food", "Health", "Music", "Social", "Sports", "Technology", "Other"];

    const onSubmit = (data) => {
        setSelectedItem(null)
        console.log(data);
        var temp_data = {"filters": []}
        var filters = locations
        for (const key in data) { 
            console.log(key)
            if(key == "searchbar"){
                temp_data["searchbar"]= data["searchbar"]
            }
            if(key == "Organizer" && data[key] == true){
                temp_data["Organizer"]= data["Organizer"]
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
  
const popularitysort = () => {
    searchitems.sort((a,b) => {
        return a.registered<b.registered ? 1 : -1
    })
    setsearchitems(searchitems)
}

const timesort = () => {
    searchitems.sort((a,b) => {
        return a.eventStart>b.eventStart ? 1 : -1
    })
    setsearchitems(searchitems)
}


    const [selectedItem, setSelectedItem] = useState(null);
  
    const handleSelect = (eventKey) => {
        if( eventKey == "Popularity"){
            popularitysort()
        }
        else{
            timesort()
        }
      // `eventKey` will be the value of the selected item
      setSelectedItem(eventKey);
    };




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


                        <Dropdown onSelect={handleSelect}>
                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                {selectedItem ? selectedItem : 'Select an Item'}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item eventKey="Popularity">Popularity</Dropdown.Item>
                                <Dropdown.Item eventKey="EventTime">EventTime</Dropdown.Item>
                            </Dropdown.Menu>
                            </Dropdown>
                        <Form.Check
                                type={"checkbox"}
                                id={`org-checkbox`}
                                label={'Organizer'}
                                {...register('Organizer', { required: false})}
                            />
                        





                        <div key={`default-checkbox`} className="mb-3 filters">
                            <label>Search Filters </label> <br/><br/>

                            {locations.map((item, index) => (
                                <Form.Check
                                type={"checkbox"}
                                id={`default-checkbox`+index}
                                label={item}
                                {...register(item, { required: false})}
                            />
                            )
                            )}
                        </div>
                    </Form>

            </div>

        </div>
        <div class="searchresults">
            
            <CardGrid>
                { searchitems?.map(item=>
                    <div class = "card" style = {{display:"flex"}}>
                    <Card key={item} style = {{display:"flex"}}>
                        <img src={`data:${item.eventImgType};base64,${item.eventImg}`}/>
                        <h1>{item.eventName}</h1>
                        <h2>Location: {item.eventBuilding}</h2>
                        <h2>Time: {item.eventStart}</h2>
                        <h2>Organizer: {item.organizerName}</h2>
                        <h2>Num: {item.registered}</h2>
                        
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