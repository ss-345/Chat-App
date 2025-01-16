import React, { useEffect, useState } from "react";
import { useUser } from "../context/user.context";
import { Navigate, useNavigate } from "react-router-dom";
export const UserAuth = ({ children }) => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  useEffect(() => {
    // console.log(user);
    if (user) {
      setLoading(false);
    }
    if (!token) {
      navigate("/login");
    }
    if (!user) {
      // console.log("ki");
      navigate("/login");
    }
  }, []);
  if (loading) {
    return <div>Loading......</div>;
  }
  return <>{children}</>;
};

export default UserAuth;
