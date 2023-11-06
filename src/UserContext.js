import {createContext, useContext} from "react";
import { useState } from "react";

const UserContext = createContext(null);

export function useUserContext() {
    return useContext(UserContext)
}

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(null)
    const value = {
        userId,
        setUserId

    }
  
    return (
      <UserContext.Provider value={value}>
        {children}
      </UserContext.Provider>
    );
  };

export default UserContext;
