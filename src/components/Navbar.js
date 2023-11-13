import { click } from "@testing-library/user-event/dist/click";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import "./Navbar.css";
import { useUserContext } from "../UserContext";

function Navbar() {
  const [click, setClick] = useState(false);
  const [registerbutton, setRegisterButton] = useState(true);
  const [currPage, setCurrentPage] = useState(0);

  const { userId, setUserId } = useUserContext();

  const handleClick = () => setClick(!click);
  const closeMobileMenu = (i) => {
    setClick(false);
    setCurrentPage(i);
  };

  const showButton = () => {
    if (window.innerWidth <= 960) {
      setRegisterButton(false);
    } else {
      setRegisterButton(true);
    }
  };
  useEffect(() => {
    showButton();
  }, []);
  window.addEventListener("resize", showButton);
  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={(e)=>closeMobileMenu(-1)}>
            <img className="logo-img" src = {require("../images/beaver_logo.png")}></img>
            BeaverBuzz
          </Link>
          <div className="menu-icon" onClick={handleClick}>
            <i className={click ? "fas fa-times" : "fas fa-bars"}></i>
          </div>
          <div className="nav-menu-more">
          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <li className="nav-item">
              <Link to="/" className={currPage === 0? "nav-links-selected" :"nav-links"} onClick={(e)=>closeMobileMenu(0)}>
                HOME
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/post-event"
                className={currPage === 1? "nav-links-selected" :"nav-links"}
                onClick={(e)=>closeMobileMenu(1)}
              >
                POST EVENT
              </Link>
            </li>
            {!userId ? (
              <></>
            ) : (
              <li className="nav-item">
                <Link
                  to="/profile"
                  className={currPage === 2? "nav-links-selected" :"nav-links"}
                  onClick={(e)=>closeMobileMenu(2)}
                >
                  PROFILE
                </Link>
              </li>
            )}
            <li className="nav-item">
              {!userId ? (
                <Link
                  to="/login"
                  className={currPage === 3? "nav-links-selected" :"nav-links"}
                  onClick={(e)=>closeMobileMenu(3)}
                >
                  LOG IN
                </Link>
              ) : (
                <Link
                  className="nav-links"
                  onClick={() => {
                    closeMobileMenu(4);
                    setUserId(null);
                    localStorage.setItem("user", null);
                  }}
                  to={"/"}
                >
                  LOG OUT
                </Link>
              )}
            </li>
         
            
         </ul></div>
         {registerbutton && !userId && (
            <div className="btn-wrapper"><Button buttonStyle="btn--outline" linkTo="/register">
              SIGN UP
            </Button></div>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
