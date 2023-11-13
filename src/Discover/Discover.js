import React, { useEffect, useState, useContext } from "react";
import { Form, Button } from "react-bootstrap";
import "../LoginSignup/Form.css";
import { useForm } from "react-hook-form";
import Card from "../components/Card";
import CardGrid from "../components/CardGrid";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom";
import UserContext from "../UserContext";
import "./Discover.css";
import { CATEGORIES } from "../constants/Constants";
import default_photo from "../images/default-event-photo.png";

const DiscoverPage = () => {
  const [searchitems, setsearchitems] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const locations = CATEGORIES.map((category) => category.name);
  const navigate = useNavigate();
  const navigate2 = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(6);
  const userId = useContext(UserContext);
  const [selectedItem, setSelectedItem] = useState(null);
  const [query, setQuery] = useState("");
  const initialObject = locations.reduce((acc, location) => {
    acc[location] = false;
    return acc;
  }, {});
  initialObject['searchbar'] = "";
  const [sendToBack, setSendToBack] = useState(initialObject);

  //Initially Fetch all results
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Your fetch request goes here
        fetch("http://localhost:8000/api/allevents", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            setsearchitems(data);
          });
        // Process the data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Call the fetch function
  }, []);

  const onSubmit = (data) => {
    setSelectedItem(null);
    console.log(data);
    var temp_data = { filters: [] };
    var filters = locations;
    for (const key in data) {
      //console.log(key)
      if (key === "searchbar") {
        temp_data["searchbar"] = data["searchbar"];
      }
      if (key === "Organizer" && data[key] === true) {
        temp_data["Organizer"] = data["Organizer"];
      }
      if (filters.includes(key) && data[key] === true) {
        temp_data["filters"].push(key);
      }
    }
    if (userId) {
      temp_data["userid"] = userId;
    } else {
      temp_data["userid"] = -1;
    }
    fetch(
      "http://localhost:8000/api/search?" + new URLSearchParams(temp_data),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        //console.log(data.length);
        if (data.length == 0) {
          setNores(true);
        } else {
          setNores(false);
        }
        setsearchitems(data);
      });
  };

  const popularitysort = () => {
    searchitems.sort((a, b) => {
      return a.registered < b.registered ? 1 : -1;
    });
    setsearchitems(searchitems);
  };

  const timesort = () => {
    searchitems.sort((a, b) => {
      return new Date(a.eventStart) > new Date(b.eventStart) ? 1 : -1;
    });
    setsearchitems(searchitems);
  };

  const handleSelect = (value) => {
    if (value == "Popularity") {
      popularitysort();
    } else if (value == "Default") {
      setsearchitems(searchitems);
    } else {
      timesort();
    }
    setSelectedItem(value);
  };

  const handleClick = (eventid) => {
    // Redirect to the specified target URL
    navigate("/events/" + eventid);
  };
  const noEventClick = () => {
    // Redirect to the specified target URL
    navigate("/post-event");
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = searchitems.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const nPages = Math.ceil(searchitems.length / recordsPerPage);

  const [nores, setNores] = useState(false);

  return (
    <div className="discover">
      <img
        className="discover-img"
        src="https://boundless.utoronto.ca/wp-content/uploads/give/Give@2x.jpg"
        alt="Adventure"
      />
      <h1 className="discover-title">Your Next Adventure Starts Here ...</h1>

      <br />
      <br />
      <div className="search-class">
        <input
          type="text"
          placeholder="Start typing your search.."
          className="search"
          onChange={(e) =>{
            setQuery(e.target.value);
            onSubmit({searchbar: e.target.value})}}
        ></input>
        <Button type="submit" className="searchButton">
          Search
        </Button>
      </div>
      <Form onSubmit={handleSubmit(onSubmit)} className="overall-search">
        <div className="search-class">
          {/* <Form.Group>
            <Form.Control
              type="text"
              placeholder="Start typing your search here"
              className="search"
              id="searchbar"
              {...register("searchbar", { required: false })}
            />
          </Form.Group>
          <Button type="submit" className="searchButton">
            Search
          </Button> */}
        </div>

        <div className="search-options">
          <select
            className="sortDropdown"
            name="Sort"
            onChange={(e) => handleSelect(e.target.value)}
            value={selectedItem}
          >
            <option value="Default" selected="selected">
              Sort by
            </option>
            <option value="Popularity">Popularity</option>
            <option value="EventTime">Event Time</option>
          </select>
          <div className="organizer">
            <Form.Check
              type={"checkbox"}
              id={`org-checkbox`}
              label={"  Organizer"}
              {...register("Organizer", { required: false })}
            />
          </div>
        </div>
        <div className="discover-body">
          <div key={`default-checkbox`} className="filters">
            <h1 className="filter-title">Search Filters</h1>

            {locations.map((item, index) => (
              <div>
                  <input type="checkbox" id="default-checkbox0" name="location0" value="Location 0" onClick={
                    (e) => {
                        setSendToBack({...sendToBack, [item]: e.target.checked});
                        onSubmit({...sendToBack, [item]: e.target.checked});
                    }
                  }></input>
                  <label for="default-checkbox0">{item}</label>
                </div>

            //   <Form.Check
            //     type={"checkbox"}
            //     id={`default-checkbox` + index}
            //     label={"    " + item}
            //     ref={(e) => console.log(e)}
            //     {...register(item, { required: false })}
            //   />
            ))}
          </div>

          <div className="searchresults">
            {nores ? (
              <h1 className="nrferror" onClick={() => noEventClick()}>
                {" "}
                No Results Found. Click here to Post Your Own Event
              </h1>
            ) : (
              <CardGrid>
                {currentRecords?.map((item) => (
                  <div onClick={() => handleClick(item.id)}>
                    <Card
                      key={item}
                      style={{ display: "flex", alignItems: "flex-start" }}
                    >
                      <img
                        src={
                          item.eventImg
                            ? item.eventImg
                            : "https://mlpcesocsoqj.i.optimole.com/w:auto/h:auto/q:mauto/ig:avif/f:best/https://eventimaging.ca/wp-content/uploads/2021/03/Toronto-Event-Photographer-scaled.jpg"
                        }
                        alt="Event"
                        className="eventimg"
                      ></img>
                      <div className="cardtext" style={{ marginLeft: "10px" }}>
                        <h1 className="card-title">{item.eventName}</h1>
                        <div className="eventdetails">
                          <h1 className="card-detail-oneliner">
                            {item.oneLiner}
                          </h1>
                          <h1 className="card-detail-time">
                            {item.eventStart}
                          </h1>
                          <h1 className="card-detail-location">
                            Location: {item.eventBuilding} {item.eventRoom}
                          </h1>
                          <h1 className="card-detail">
                            Brought to you by {item.organizerName}
                          </h1>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </CardGrid>
            )}
            {nores ? (
              <p></p>
            ) : (
              <Pagination
                nPages={nPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            )}
          </div>
        </div>
      </Form>
    </div>
  );
};

export default DiscoverPage;
