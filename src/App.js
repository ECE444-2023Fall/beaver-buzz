import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import LoginPage from "./login";
import RegisterPage from "./register";
import EventPage from './Event';
import DiscoverPage from "./discover";
import {BrowserRouter as Router, Routes, Route, BrowserRouter} from 'react-router-dom';
import { UserProvider } from './UserContext';
import ProfilePage from "./Profile";
import UserPage from './userProfile';

function App() {

  return (

    <div className="App">
        <UserProvider>
            <Router>
                <Navbar/>
                <Routes>
                    <Route exact path='/discover' element={<DiscoverPage/>}/>
                    <Route exact path='/login' element={<LoginPage/>}/>
                    <Route exact path='/profile' element={<ProfilePage/>}/>
                    <Route exact path='/register' element={<RegisterPage/>}/>
                    <Route exact path='/events' element={<EventPage/>}/>
                    <Route exact path='/user/:id' element={<UserPage/>}/>
                </Routes>
            </Router>
        </UserProvider>

    </div>
    <UserProvider>
      <div className="App">
        <Router>
          <Navbar />
          <Routes>
             <Route exact path='/' element={<DiscoverPage/>}/>
            <Route exact path='/login' element={<LoginPage />} />
            <Route exact path='/register' element={<RegisterPage />} />
            <Route path='/events/:id' element={<EventPage />} />
            {/* The above is a temp page to display event info */}
            <Route path='/' exact />
          </Routes>
        </Router>


        {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <p>The current time is {currentTime}.</p>
      </header> */}
      </div>
    </UserProvider>
  );
}

export default App;