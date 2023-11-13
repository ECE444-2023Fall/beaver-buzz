import React, {useEffect, useState, useContext} from 'react';
import {Form,Button} from 'react-bootstrap';
import "../LoginSignup/Form.css";
import {useForm} from "react-hook-form";
import Card from '../components/Card';
import CardGrid from '../components/CardGrid';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import UserContext from '../UserContext';
import "./Discover.css";
import {CATEGORIES} from '../constants/Constants';
import default_photo from "../images/default-event-photo.png";
import {convertDate} from  "../Event/Event.js"

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


    // const onSubmit = (data) => {
    //     console.log(data);
    //     var temp_data = {"filters": []}
    //     var filters = ["Bahen", "Myhal", "Sanford Fleming", "Robarts", "Rotman", "Galbraith", "Trinity Bellwoods", "Queens Park"]
    //     for (const key in data) { 
    //         console.log(key)
    //         if(key == "searchbar"){
    //             temp_data["searchbar"]= data["searchbar"]
    //         }
    //         if(filters.includes(key) && data[key] == true){
    //             temp_data["filters"].push(key)
    //         }
    //     }
    //     fetch(`${process.env.REACT_APP_BACKEND_URL}/api/search?` + new URLSearchParams(temp_data), {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //     })
    //         .then(response => response.json())
    //         .then(data => {
    //             setsearchitems(data)
    //         });
    //         // Process the data
    //         } catch (error) {
    //         console.error('Error fetching data:', error);
    //         }
    //     };
    
    //     fetchData(); // Call the fetch function
    //     }, []); 
    

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
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/search?` + new URLSearchParams(temp_data), {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
                .then(data => {
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
            <div className="form-left">
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <img src="https://boundless.utoronto.ca/wp-content/uploads/give/Give@2x.jpg" alt="Adventure" className="adventure-image" />
                        <h1 className="title">Your Next Adventure Starts Here ...</h1>
                        
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
                            <h1 className="search-title">Search Filters</h1>
                            
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

        
        <div class="searchresults">
            {nores ? <h1 class="nrferror" onClick={() => noEventClick()}> No Results Found. Click here to Post Your Own Event</h1>:
            <CardGrid>
                {currentRecords?.map(item=>
                    <div onClick={() => handleClick(item.id)}>
                    <Card key={item} style = {{display:"flex",alignItems:"flex-start"}}>
                        <img src={item.eventImg?item.eventImg:"https://mlpcesocsoqj.i.optimole.com/w:auto/h:auto/q:mauto/ig:avif/f:best/https://eventimaging.ca/wp-content/uploads/2021/03/Toronto-Event-Photographer-scaled.jpg"} alt="Event" class="eventimg"></img>
                        <div class ="cardtext" style={{ marginLeft: "10px" }}>
                        <h1 className="card-title">{item.eventName}</h1>
                        <div class = "eventdetails">

                        <h1 className="card-detail-oneliner">{item.oneLiner}</h1>
                        <h1 className="card-detail-time">{convertDate(item.eventStart)}</h1>
                        <h1 className="card-detail-location">Location: {item.eventBuilding} {item.eventRoom}</h1>
                        <h1 className="card-detail">Brought to you by {item.organizerName}</h1>
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