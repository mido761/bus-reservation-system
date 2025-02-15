import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingPage from "./components/loadingPage/loadingPage";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Auth = ({ requireAdmin = false, children , route="login"}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await axios.get(`${backEndUrl}/auth`, {
          withCredentials: true,
        });

        if (response.data.authenticated) {
          setIsAuthenticated(true);

          if (requireAdmin) {
            if (response.data.userRole === "admin") {
              setIsAuthorized(true);
            } else {
              setIsAuthorized(false);
              navigate(`/${route}`); // Redirect non-admin users
            }
          }
        } else {
          setIsAuthenticated(false);
          navigate(`/${route}`);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
        navigate(`/${route}`);
      }
    };

    checkAuthentication();
  }, [navigate, requireAdmin]);

  if (isAuthenticated === null || (requireAdmin && isAuthorized === null)) {
    return <LoadingPage/>; // Show loading while checking auth
  }

  if (!isAuthenticated || (requireAdmin && !isAuthorized)) {
    return null; // Prevent rendering if unauthorized
  }

  return children; // Render protected content
};

export default Auth;
