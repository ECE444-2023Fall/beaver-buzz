import React, {useEffect, useState} from 'react'
import {Form,Button} from 'react-bootstrap'
import "../Login/Form.css"
import {Grid, Item} from "semantic-ui-react"
import {Link} from "react-router-dom"
import {useForm} from "react-hook-form";
import Card from '../components/Card'
import CardGrid from '../components/CardGrid';
import Pagination from '../components/Pagination';
import Dropdown from 'react-bootstrap/Dropdown';
import { useNavigate } from 'react-router-dom';

const DiscoverPage=()=>{
    const[searchitems, setsearchitems] = useState([])
    const { register, handleSubmit, formState: { errors } } = useForm();
    const locations = ["Academic", "Arts", "Career", "Cultural", "Food", "Health", "Music", "Social", "Sports", "Technology", "Other"];
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(4);

    //Initially Fetch all results
    useEffect(() => {
        const fetchData = async () => {
            try {
            // Your fetch request goes here
            fetch('http://localhost:8000/api/allevents', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
                        .then(data => {
                setsearchitems(data)
            });
            // Process the data
            } catch (error) {
            console.error('Error fetching data:', error);
            }
        };
    
        fetchData(); // Call the fetch function
        }, []); 
    

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
            return new Date(a.eventStart)>new Date(b.eventStart) ? 1 : -1
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


    const handleClick = (eventid) => {
        // Redirect to the specified target URL
        navigate("/events/"+eventid);
    };

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = searchitems.slice(indexOfFirstRecord, indexOfLastRecord);
    const nPages = Math.ceil(searchitems.length / recordsPerPage)

    return(
        <div>
        <div className ="container">
            <div className="form-left">

                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <label htmlFor="searchbar">Discover</label>
                        <Form.Group>
                            <Form.Control type="text"
                                placeholder="Search Here"
                                id="searchbar"
                                          className="input"
                                 {...register("searchbar", { required: false})}
                            />
                        </Form.Group>
                        <Button type='submit' className="submitButton searchButton">Search</Button>

                        <Dropdown class = "dropdown" onSelect={handleSelect}>
                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                {selectedItem ? selectedItem : 'Select an Item'}
                            </Dropdown.Toggle>

                            <Dropdown.Menu class = "dropdown">
                                <Dropdown.Item class = "dropdown-content" eventKey="Popularity">Popularity</Dropdown.Item>
                                <Dropdown.Item eventKey="EventTime">EventTime</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <div class = "organizer">
                        <Form.Check
                                type={"checkbox"}
                                id={`org-checkbox`}
                                label={'Organizer'}
                                {...register('Organizer', { required: false})}
                            />
                        </div>
                        



                        <div key={`default-checkbox`} className="mb-3 filters">
                            <label>Search Filters </label> <br/><br/>

                            {locations.map((item, index) => (
                                <Form.Check
                                type={"checkbox"}
                                id={`default-checkbox`+index}
                                label={"    "+item}
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
                { currentRecords?.map(item=>
                    <div class = "card" style = {{display:"flex"}} onClick={() => handleClick(item.id)}>
                    <Card key={item} style = {{display:"flex"}}>
                        <img src={item.eventImg} alt="Event"></img>
                        <h1>{item.eventName}</h1>
                        <h2>Location: {item.eventBuilding}</h2>
                        <h2>Time: {item.eventStart}</h2>
                        <h2>Organizer: {item.organizerName}</h2>                        
                    </Card>
                    </div>
                )
                }
            </CardGrid>
            
        </div>
    <Pagination
                nPages={nPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
    />
    </div>

    )
}

export default DiscoverPage