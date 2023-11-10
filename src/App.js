import './App.css';
import Navbar from './components/Navbar';
import LoginPage from "./LoginSignup/Login";
import RegisterPage from "./LoginSignup/Register";
import EventPage from './Event/Event';
import DiscoverPage from "./Discover/Discover";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { UserProvider } from './UserContext';
import ProfilePage from './Profile/Profile';
import UserPage from './Profile/UserProfile';
import HostPage from './Host/Host';

function App() {

  return (

    <div className="App">
        <UserProvider>
            <Router>
                <Navbar/>
                <Routes>
                    <Route exact path='/' element={<DiscoverPage/>}/>
                    <Route exact path='/login' element={<LoginPage/>}/>
                    <Route exact path='/profile' element={<ProfilePage/>}/>
                    <Route exact path='/register' element={<RegisterPage/>}/>
                    <Route exact path='/events/:id' element={<EventPage/>}/>
                    <Route exact path='/user/:id' element={<UserPage/>}/>
                    <Route exact path='post-event' element={<HostPage/>}/>
                </Routes>
            </Router>
        </UserProvider>

    </div>
  );
}

export default App;