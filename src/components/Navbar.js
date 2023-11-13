import { click } from "@testing-library/user-event/dist/click";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import "./Navbar.css";
import { useUserContext } from "../UserContext";

function Navbar() {
  const [click, setClick] = useState(false);
  const [registerbutton, setRegisterButton] = useState(true);

  const { userId, setUserId } = useUserContext();

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);
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
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            <img className="logo-img" src = {require("../images/beaver_logo.png")}></img>
            BeaverBuzz
          </Link>
          <div className="menu-icon" onClick={handleClick}>
            <i className={click ? "fas fa-times" : "fas fa-bars"}></i>
          </div>
          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <li className="nav-item">
              <Link to="/" className="nav-links" onClick={closeMobileMenu}>
                HOME
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/post-event"
                className="nav-links"
                onClick={closeMobileMenu}
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
                  className="nav-links"
                  onClick={closeMobileMenu}
                >
                  PROFILE
                </Link>
              </li>
            )}
            <li className="nav-item">
              {!userId ? (
                <Link
                  to="/login"
                  className="nav-links"
                  onClick={closeMobileMenu}
                >
                  LOG IN
                </Link>
              ) : (
                <Link
                  className="nav-links"
                  onClick={() => {
                    closeMobileMenu();
                    setUserId(null);
                    localStorage.setItem("user", null);
                  }}
                  to={"/"}
                >
                  LOG OUT
                </Link>
              )}
            </li>
          </ul>
          {registerbutton && !userId && (
            <Button buttonStyle="btn--primary" linkTo="/register">
              SIGN UP
            </Button>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
