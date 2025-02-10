import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Verification from "./verification";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alertFlag, setAllertFlag] = useState(false);
  const [alertMessage, setAllertMessage] = useState("");
  const [verificationFlag, setVerificationFlag] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await axios.post(`${backEndUrl}/api/register`, {
        name,
        phoneNumber,
        email,
        password,
      });

      if (result.status === 201) {
        setAllertMessage("Registered successfully");
        setAllertFlag(true);

        setTimeout(() => {
          setAllertFlag(false);
          localStorage.setItem("verificationToken", result.data.token);
          setVerificationFlag(true);
        }, 2000);
      } else {
        setAllertMessage("This email already exists");
        setAllertFlag(true);
      }
    } catch (err) {
      console.error("Registration Error:", err);
      setAllertMessage("An error occurred during registration.");
      setAllertFlag(true);
    }
  };

  return (
    <div className="register-page">
      {!verificationFlag ? (
        <div className="register-container">
          <h2>Register for Bus Reservation</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              required
              onChange={(e) => setName(e.target.value)}
            />

            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="number"
              id="phoneNumber"
              name="phoneNumber"
              required
              onChange={(e) => setPhoneNumber(e.target.value)}
            />

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

            <button type="submit">Register</button>
          </form>

          <Link to="/login">Login</Link>

          {alertFlag && (
            <div className="alert-overlay">
              <div className="overlay-content">
                <p>{alertMessage}</p>
                <button onClick={() => setAllertFlag(false)}>Close</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Verification />
      )}
    </div>
  );
}

export default Signup;
