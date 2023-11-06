import {createContext} from "react";
import { useState } from "react";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
  
    return (
      <UserContext.Provider value={[userId, setUserId]}>
        {children}
      </UserContext.Provider>
    );
  };

export default UserContext;
