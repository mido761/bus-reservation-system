import { useState, useEffect } from "react";
import axios from "axios";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const InlineAuth = () => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    isAuthorized: false,
    userRole: null,
  });

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await axios.get(`${backEndUrl}/auth`, {
          withCredentials: true,
        });

        console.log(response.data);

        if (response.data.authenticated) {
          setAuth({
            isAuthenticated: true,
            isAuthorized: response.data.userRole === "admin",
            userRole: response.data.userRole,
          });
        } else {
          setAuth({ isAuthenticated: false, isAuthorized: false, userRole: null });
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setAuth({ isAuthenticated: false, isAuthorized: false, userRole: null });
      }
    };

    checkAuthentication();
  }, []);

  return auth; // ✅ Return authentication data
};

export default InlineAuth;
