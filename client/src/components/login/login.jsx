import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Overlay from "../overlayScreen/overlay";
import "../signup/Signup.css";
import "../login/login.css";
import LoadingScreen from "../loadingScreen/loadingScreen";
import { HiEye, HiEyeOff } from "react-icons/hi"; // Import eye icons from react-icons

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${backEndUrl}/api/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const userId = response.data.userId;
        sessionStorage.setItem("authToken", userId);

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
      if (error.status === 404) {
        setAlertMessage("User not found");
      } else if (error.status === 401) {
        setAlertMessage("Password is incorrect");
      } else {
        setAlertMessage("There was an error during login");
      }

      setTimeout(() => {
        setIsLoading(false);
        setAlertFlag(true);
      }, 1000);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
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
          <div className="password-container">
            <input
              type={passwordVisible ? "text" : "password"} // Toggle between text and password type
              id="password"
              name="password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="password-toggle"
              onClick={() => setPasswordVisible(!passwordVisible)} // Toggle password visibility
            >
              {passwordVisible ? <HiEyeOff /> : <HiEye />} {/* Eye icons from react-icons */}
            </span>
          </div>

          <button type="submit">Login</button>
        </form>
        <Link to="/register" className="back-button">
          Don't not have an account? Sign up
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
