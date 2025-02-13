import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Verification from "./verification";
import LoadingScreen from "../loadingScreen/loadingScreen";
import Overlay from "../overlayScreen/overlay";
import { set } from "mongoose";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [verificationFlag, setVerificationFlag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await axios.post(`${backEndUrl}/api/register`, {
        name,
        phoneNumber,
        email,
        password,
      });

      if (result.status === 201) {
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage(
            <p>
              {" "}
              <strong>Registered successfully</strong> <br />
              <br /> Check your email for verification{" "}
            </p>
          );
          setAlertFlag(true);
        }, 1000);

        setTimeout(() => {
          setAlertFlag(false);
          localStorage.setItem("verificationToken", result.data.token);
          setVerificationFlag(true);
        }, 2500);
      }
    } catch (err) {
      if (err.status === 400) {
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage("This email already exists");
          setAlertFlag(true);
        }, 1000);

        setTimeout(() => {
          setAlertFlag(false);
        }, 2200);
        console.error("Email already exists", err.status);
      }else {
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage("An error accured");
          setAlertFlag(true);
        }, 1000);

        setTimeout(() => {
          setAlertFlag(false);
        }, 2200);
      }
    }
  };

  // if (isLoading) {
  //   return <Loading />;
  // }

  return (
    <div className="register-page">
      {!verificationFlag ? (
        <div className="register-container">
          <h2>Register for Bus Reservation</h2>
          <form
            onSubmit={handleSubmit}
            onKeyDown={(e) => handleKeyDown(e)}
          >
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
          {isLoading && <LoadingScreen />}

          {alertFlag && (
            <Overlay
              alertFlag={alertFlag}
              alertMessage={alertMessage}
              setAlertFlag={setAlertFlag}
            />
          )}
        </div>
      ) : (
        <Verification setVerificationFlag={setVerificationFlag} />
        // <Loading />
      )}
    </div>
  );
}

export default Signup;
