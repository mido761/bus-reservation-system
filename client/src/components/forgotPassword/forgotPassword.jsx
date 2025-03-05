import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Overlay from "../overlayScreen/overlay";
import "../login/login.css";
import LoadingScreen from "../loadingScreen/loadingScreen";
import { HiEye, HiEyeOff } from "react-icons/hi"; // Import eye icons from react-icons

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${backEndUrl}/api/forgot-password`,
        { email },
        { withCredentials: true }
      );
      // const response = {"status": 200}
      if (response.status === 200) {
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage("Reset password link sent!");
          setAlertFlag(true);
        }, 1000);
      }
    } catch (error) {
      if (error.status === 404) {
        setAlertMessage("Email not found");
      } else {
        setAlertMessage("There was an error during verification");
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
        <h2>Forgot Password</h2>
        <p style={{ fontSize: "10px", margin: "auto", marginBottom: "25px" }}>
          Please enter your email to reset the password
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Your Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit">Reset password</button>
        </form>
        <br />
        <Link to="/login"><pre>Already registerd? Login</pre></Link>
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

export default ForgotPassword;
