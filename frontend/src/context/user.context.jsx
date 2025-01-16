import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserDataFromServer = async () => {
      if (token && !user) {
        try {
          await axios
            .get("/users/auth")
            .then((res) => {
              // console.log(res.data);
              setUser(res.data.user);
            })
            .catch((err) => {
              console.log(err);
            });

          // setUser(data);
        } catch (err) {
          console.log(err);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    fetchUserDataFromServer();
  }, [token]);
  if (loading) {
    return <div>Loading......</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
export const useUser = () => {
  return useContext(UserContext);
};
