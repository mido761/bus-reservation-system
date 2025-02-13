import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Overlay from "../overlayScreen/overlay";
import "../signup/Signup.css";
import "../login/login.css";
import LoadingScreen from "../loadingScreen/loadingScreen";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    setIsLoading(true);
    try {
      // Make the POST request for login
      const response = await axios.post(
        `${backEndUrl}/api/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        // Store the token in sessionStorage upon successful login
        const userId = response.data.userId;
        const sessionID = response.data.sessionID;

        sessionStorage.setItem("authToken", userId);

        // Alert the user that the login was successful and Navigate to the home or seat selection page
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage("Login successful");
          setAlertFlag(true);
        }, 1000);

        setTimeout(() => {
          setAlertFlag(false);
          navigate("/");
        }, 2200);
      }
    } catch (error) {
      // Show an alert if login failed
      if (error.status === 404) {
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage("User not found");
          setAlertFlag(true);
        }, 1000);

        setTimeout(() => {
          setAlertFlag(false);
        }, 2200);
      } else if (error.status === 401) {
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage("Password is incorrect");
          setAlertFlag(true);
        }, 1000);

        setTimeout(() => {
          setAlertFlag(false);
        }, 2200);
      } else {
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage("There was an error during login");
          setAlertFlag(true);
        }, 1000);

        setTimeout(() => {
          setAlertFlag(false);
        }, 2200);
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

          <button type="submit">Login</button>
        </form>
        <Link to="/register" className="back-button">
          Does not have an account?
        </Link>
      </div>

      {isLoading && <LoadingScreen />}

      <Overlay
        alertFlag={alertFlag}
        alertMessage={alertMessage}
        setAlertFlag={setAlertFlag}
      />
    </div>
  );
}

export default Login;
