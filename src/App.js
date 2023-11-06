import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Navbar from './components/Navbar';
import LoginPage from "./login";
import RegisterPage from "./register";
import EventPage from './Event';
import DiscoverPage from "./discover";
import {BrowserRouter as Router, Routes, Route, BrowserRouter} from 'react-router-dom';
import { UserProvider } from './UserContext';
import UserPage from "./userProfile";

function App() {

  return (

    <div className="App">
        <UserProvider>
            <Router>
                <Navbar/>
                <Routes>
                    <Route exact path='/discover' element={<DiscoverPage/>}/>
                    <Route exact path='/login' element={<LoginPage/>}/>
                    <Route exact path='/profile' element={<UserPage/>}/>
                    <Route exact path='/register' element={<RegisterPage/>}/>
                    <Route exact path='/events' element={<EventPage/>}/>
                </Routes>
            </Router>
        </UserProvider>

    </div>

  );
}

export default App;