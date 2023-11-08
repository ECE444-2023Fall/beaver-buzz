import { click } from '@testing-library/user-event/dist/click'
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './Button';
import './Navbar.css';
import {useUserContext} from "../UserContext";

function Navbar() {
    const [click, setClick] = useState(false);
    const [button, setButton] = useState(true);

  const  {
        userId,
        setUserId
    } = useUserContext()


  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);
  const showButton = () => {
    if (window.innerWidth <= 960){ setButton(false);}
    else { setButton(true);}
  };
  useEffect(()=> {showButton();}, []);
  window.addEventListener('resize', showButton);
  return (
    <>
        <nav className='navbar'>
            <div className='navbar-container'>
                <Link to="/" className='navbar-logo' onClick={closeMobileMenu}>
                    BeaverBuzz
                </Link>
                <div className='menu-icon'onClick={handleClick}>
                    <i className={click ? 'fas fa-times' : 'fas fa-bars'}></i>
                </div>
                <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                    <li className='nav-item'>
                        <Link to='/' className='nav-links' onClick={closeMobileMenu}>
                            Home
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link to='/events' className='nav-links' onClick={closeMobileMenu}>
                            Events
                        </Link>
                    </li>
                    <li>
                        <Link to='/discover' className='nav-links' onClick={closeMobileMenu}>
                            Discover
                        </Link>
                    </li>
                    <li className='nav-item'>
                        {!userId ? <Link to='/login' className='nav-links' onClick={closeMobileMenu}>
                            Login
                        </Link> : <Link className='nav-links' onClick={() =>{closeMobileMenu(); setUserId(null); localStorage.setItem('user', null)}} to={'/'}>
                            Logout
                        </Link>}

                    </li>
                    
                </ul>
                {button && !userId && <Button buttonStyle='btn--outline' linkTo='/register'>SIGN UP</Button>}
            </div>
        </nav>
    </>
  )
}

export default Navbar
