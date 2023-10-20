import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Navbar from './components/Navbar';
import LoginPage from "./login";
import RegisterPage from "./register";
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

function App() {


  return (
    <div className="App">
        <Router>
          <Navbar />
          <Routes>
             <Route exact path='/login' element={<LoginPage/>}/>
              <Route exact path='/register' element={<RegisterPage/>}/>
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
  );
}

export default App;