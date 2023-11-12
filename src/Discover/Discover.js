import React, {useEffect, useState, useContext} from 'react'
import {Form,Button} from 'react-bootstrap'
import "../LoginSignup/Form.css"
import {useForm} from "react-hook-form";
import Card from '../components/Card'
import CardGrid from '../components/CardGrid';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import UserContext from '../UserContext';
import "./Discover.css"
import {CATEGORIES} from '../constants/Constants'

const DiscoverPage=()=>{
    const[searchitems, setsearchitems] = useState([])
    const { register, handleSubmit, formState: { errors } } = useForm();
    const locations = CATEGORIES.map(category => category.name);
    console.log(locations)
    const navigate = useNavigate();
    const navigate2 = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(6);
    const userId = useContext(UserContext);


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
        //console.log(data);
        var temp_data = {"filters": []}
        var filters = locations;
        for (const key in data) { 
            //console.log(key)
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
        if(userId){
            temp_data['userid'] = userId;
        }
        else{
            temp_data['userid'] = -1;
        }
        fetch('http://localhost:8000/api/search?'+new URLSearchParams(temp_data), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
                        .then(data => {
                //console.log(data.length);
                if (data.length ==0){
                    setNores(true);
                }
                else{
                    setNores(false);
                }
                setsearchitems(data);
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

    const handleSelect = (value) => {
        if( value == "Popularity"){
            popularitysort()
        }
        else if(value == "Default"){
            setsearchitems(searchitems)
        }
        else{
            timesort()
        }
        setSelectedItem(value);
    };

    const titleClick = ()=>{
        navigate2("/")
    }

    const handleClick = (eventid) => {
        // Redirect to the specified target URL
        navigate("/events/"+eventid);
    };
    const noEventClick = () => {
        // Redirect to the specified target URL
        navigate("/post-event");
    };

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = searchitems.slice(indexOfFirstRecord, indexOfLastRecord);
    const nPages = Math.ceil(searchitems.length / recordsPerPage)

    const [nores, setNores] = useState(false);

    return(
        <div>
        <div className ="container">
            <div className="form-left">

                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <label htmlFor="searchbar" class="title" onClick={() => titleClick()}>Discover Events on Campus!</label>
                        <br/><br/>
                        <Form.Group>
                            <Form.Control type="text"
                                placeholder="Search Here"
                                className = "search"
                                id="searchbar"
                                 {...register("searchbar", { required: false})}
                            />
                        </Form.Group>
                        <Button type='submit' className="searchButton">Search</Button>
                        <select class = "sortDropdown" name="Sort" onChange={(e) => handleSelect(e.target.value)} value={selectedItem}>
                            <option value = "Default" selected="selected">Sort by</option>
                            <option value="Popularity">Popularity</option>
                            <option value="EventTime">Event Time</option>
                        </select>
                        <div class = "organizer">
                        <Form.Check
                                type={"checkbox"}
                                id={`org-checkbox`}
                                label={'  Organizer'}
                                {...register('Organizer', { required: false})}
                            />
                        </div>
                        



                        <div key={`default-checkbox`} className="filters">
                            <label>Search Filters </label> <br/><br/><br/>

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
            {nores ? <h1 class="nrferror" onClick={() => noEventClick()}> No Results Found. Click here to Post Your Own Event</h1>:
            <CardGrid>
                {currentRecords?.map(item=>
                    <div onClick={() => handleClick(item.id)}>
                    <Card key={item} style = {{display:"flex"}}>
                        <img src={item.eventImg} alt="Event" class="eventimg"></img>
                        <div class ="cardtext">
                        <h1>{item.eventName}</h1>
                        <div class = "eventdetails">
                        <h2>Location: {item.eventBuilding}</h2>
                        <h2>Time: {item.display_time}</h2>
                        <h2>Organizer: {item.organizerName}</h2>  
                        </div>
                        </div>                      
                    </Card>
                    </div>
                )}
            </CardGrid>
            }
            
        </div>
    {nores ? <p></p>: 
    <Pagination
                nPages={nPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
    />
    }
    </div>

    )
}

export default DiscoverPage