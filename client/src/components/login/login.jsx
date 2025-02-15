import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Overlay from "../overlayScreen/overlay";
import '../signup/Signup.css';
import '../login/login.css';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [alertFlag, setAlertFlag] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission

        try {
            console.log("Email", email);
            console.log("Password", password);
            // Make the POST request for login
            const response = await axios.post(
                "http://localhost:3001/login",
                { email, password },
                { withCredentials: true } 
            );

            console.log("Response", response);
            if (response.status === 200) {
                // Store the token in sessionStorage upon successful login
                const userId = response.data.userId;
                const sessionID = response.data.sessionID;
                const role = response.data.role; // Ensure you are sending the role from backend

                sessionStorage.setItem('authToken', userId);
                sessionStorage.setItem('role', role);

                // Alert the user that the login was successful
                setAlertMessage("Login successful");
                setAlertFlag(true);

                // Use setTimeout to wait a few seconds before navigating
                setTimeout(() => {
                    setAlertFlag(false); // Hide the alert
                    navigate('/home');   // Navigate to the homepage
                }, 2000); // Wait for 2 seconds before navigating
            }
        } catch (error) {
            // Handle error cases
            if (error.response.status === 404) {
                setAlertMessage("User not found");
                setAlertFlag(true);
            } else if (error.response.status === 401) {
                setAlertMessage("Password is incorrect");
                setAlertFlag(true);
            } else {
                setAlertMessage("There was an error during login");
                setAlertFlag(true);
                console.log(error);
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Login</h2>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit" >Login</button>
                </form>      
                <Link to="/register" className="back-button">
                    Does not have an account?
                </Link>          
            </div>

            <Overlay alertFlag={alertFlag} alertMessage={alertMessage} setAlertFlag={setAlertFlag}/>
        </div>
    );
}

export default Login;
