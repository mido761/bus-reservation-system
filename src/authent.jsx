import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function authen(){

const [isAuthenticated, setIsAuthenticated] = useState(false);
const [isLoading, setIsLoading] = useState(true); // Track loading state
const navigate = useNavigate();
// Check authentication on component load
useEffect(() => {
    const checkAuth = async () => {
    try {
        const response = await axios.get("http://localhost:3001/auth", { withCredentials: true });
        if (response.data.authenticated) {
        setIsAuthenticated(true);
        return response.data.userId
        } else {
        setIsAuthenticated(false);
        navigate("/login");
        }
    } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
        navigate("/login");
    } finally {
        setIsLoading(false);
    }
    };
    checkAuth();
}, [navigate]);

// Show loading state or redirect unauthenticated users
if (isLoading) {
    return <div>Loading...</div>;
}

if (!isAuthenticated) {
    return null; // Prevent further rendering if unauthenticated
}

}

export default authen;