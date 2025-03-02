import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useParams } from "react-router-dom";
import Overlay from "../overlayScreen/overlay";
import "../signup/Signup.css";
import "../login/login.css";
import LoadingScreen from "../loadingScreen/loadingScreen";
import { HiEye, HiEyeOff } from "react-icons/hi"; // Import eye icons from react-icons

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

function ResetPassword() {
  const {token} = useParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // State for password visibility
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    
    setError(""); // Clear error if passwords match

    // if (password === confirmPassword) {
      setIsLoading(true);
      console.log((typeof token))
      try {
        const response = await axios.post(
          `${backEndUrl}/api/reset-password/${token}`,
          { password },
          { withCredentials: true }
        );

        if (response.status === 200) {
          setTimeout(() => {
            setIsLoading(false);
            setAlertMessage("Your password has been successfully reset!");
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
    // } 
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Reset Password</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="password">Password</label>
          <div className="password-container">
            <input
              type={passwordVisible ? "text" : "password"} // Toggle between text and password type
              id="password"
              name="password"
              required
              style={
                password !== confirmPassword
                  ? { borderColor: "red" }
                  : { borderColor: "" }
              }
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="password-toggle"
              onClick={() => setPasswordVisible(!passwordVisible)} // Toggle password visibility
            >
              {passwordVisible ? <HiEyeOff /> : <HiEye />}{" "}
              {/* Eye icons from react-icons */}
            </span>
          </div>

          <label htmlFor="password">Confirm password</label>
          <div className="password-container">
            <input
              type={confirmPasswordVisible ? "text" : "password"} // Toggle between text and password type
              id="confirm-password"
              name="confirm-password"
              required
              style={
                password !== confirmPassword
                  ? { borderColor: "red" }
                  : { borderColor: "" }
              }
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="password-toggle"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} // Toggle password visibility
            >
              {confirmPasswordVisible ? <HiEyeOff /> : <HiEye />}{" "}
              {/* Eye icons from react-icons */}
            </span>
          </div>
          {error && password !== confirmPassword && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit">Save password</button>
        </form>
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

export default ResetPassword;
