import {createContext, useContext} from "react";
import { useState, useEffect } from "react";

const UserContext = createContext(null);

export function useUserContext() {
    return useContext(UserContext)
}

function getInitialState() {
  const user = localStorage.getItem('user');
  return user
}

export const UserProvider = ({ children }) => {


    const [userId, setUserId] = useState(getInitialState)
    const value = {
        userId,
        setUserId

    }

    // useEffect(() => {
    //   setUserId(localStorage.getItem('user'))
    //   console.log(userId)
    //   // if(userId == "null") {
    //   //   localStorage.removeItem('user');
    //   // }
    //   // else {
    //   //   localStorage.setItem('user', userId)
    //   // }
      
    // }, [userId])
  
    return (
      <UserContext.Provider value={value}>
        {children}
      </UserContext.Provider>
    );
  };

export default UserContext;
