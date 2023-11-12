import { useEffect, useState } from "react";
import React from "react";
import { Box, Rating, Typography } from "@mui/material";

const RateEvent = (props) => {

  const eventID = props.eventID;

  const [value, setValue] = React.useState(0);
  const [numReviewers, setNumReviewers] = React.useState(0);

  var title = props.title;

  const mode = props.mode;

  useEffect(() => {

    function fetchMyRating() {


      const requestOptions = {
        method: "GET",
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify()
      }
      const url = '/api/users/' + props.userID + "/getreviewfor" + "/" + eventID;
      fetch(url, requestOptions)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          if (data.rating) {
            setValue(data.rating);
          }

        });
    }

    function fetchEventRating() {


      const requestOptions = {
        method: "GET",
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify()
      }
      const url = '/api/events/' + eventID + '/getRating'
      fetch(url, requestOptions)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          if (data.rating) {
            setValue(data.rating);
            setNumReviewers(data.numreviewers)
            title = data.numreviewers + " reviews"
            console.log(title);
          }

        });
    }
    if (mode === "myrating") {
      fetchMyRating();
    }
    else {
      fetchEventRating();
    }

  }, []);



  return (
    <Box
      sx={{
        '& > legend': { mt: 2 },
      }}
    >
      <Typography component="legend">{mode === "myrating" ? title : numReviewers + " ratings"}</Typography>
      <Rating disabled={props.disabled}
        name="simple-controlled"
        precision={0.5}
        value={value}
        onChange={(event, newValue) => {

          setValue(newValue);
          if (newValue != null) {

            const requestOptions = {
              method: "POST",
              headers: {
                'content-type': 'application/json'
              },
              body: JSON.stringify({ rating: newValue })
            }
            const url = '/api/users/' + props.userID + "/setreviewfor" + "/" + eventID;
            console.log(url);

            fetch(url, requestOptions)
              .then(response => response.json())
              .then(data => {
                console.log(data);
                // if(data.review) {
                //   setValue(data.review)
                // }
              })
          }
        }
        }
      />
    </Box>)
}

export default RateEvent