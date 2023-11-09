import './App.css';
import Navbar from './components/Navbar';
import LoginPage from "./Login/Login";
import RegisterPage from "./Login/Register";
import EventPage from './Event/Event';
import DiscoverPage from "./Discover/Discover";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { UserProvider } from './UserContext';
import ProfilePage from './Profile/Profile';
import UserPage from './Profile/UserProfile';

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
                </Routes>
            </Router>
        </UserProvider>

    </div>
  );
}

export default App;