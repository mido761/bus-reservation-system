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
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleValidation = (e) => {
    const validatePhoneNumber = (number) => {
      // Ensure phone number starts with "01" and is exactly 11 digits long
      return /^\d{11}$/.test(number) && number.startsWith("01");
    };

    const validateEmail = (email) =>
      /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
    const validatePassword = (password) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        password
      );

    // const passwordErrorMessage =
    //   "Password must meet the following requirements:\n" +
    //   "- At least 8 characters long\n" +
    //   "- Include at least one uppercase\n" +
    //   "- Include at least one lowercase letter\n" +
    //   "- Include at least one number\n" +
    //   "- Include at least one special character";

    let validationErrors = {};
    // console.log(e.target.value.length);
    if (!validatePhoneNumber(phoneNumber) && e.target.name === "phoneNumber") {
      validationErrors.phoneNumber = "Enter a valid Phone number";
    } else {
      validationErrors.phoneNumber = "";
    }
    if (!validateEmail(email) && e.target.name === "email")
      validationErrors.email = "Enter a valid Email";
    if (!validatePassword(password) && e.target.name === "password");
    validationErrors.password =
      (!/^\d{7,}$/.test(
        password
      ) ? "At least 8 characters long:\n" : "") 
      // +
      // (e.target.value.length < 8 ? "Include at least one uppercase\n:\n" : "");

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    handleValidation(e);
    // Validate Inputs

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
      } else {
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
          <form onSubmit={handleSubmit} onKeyDown={(e) => handleKeyDown(e)}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => handleValidation(e)}
            />

            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setPhoneNumber(value);
              }}
              onKeyDown={(e) => handleValidation(e)}
              onInput={(e) =>
                (e.target.value = e.target.value.replace(/\D/g, ""))
              }
              maxLength="11"
              required
            />
            {errors.phoneNumber && (
              <p className="error">{errors.phoneNumber}</p>
            )}

            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => handleValidation(e)}
            />
            {errors.email && <p className="error">{errors.email}</p>}

            <label htmlFor="password">Password</label>
            <div className="password-container">
              <input
                type={"password"}
                id="password"
                name="password"
                required
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => handleValidation(e)}
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {/* {showPassword ? "👁️" : "👁️‍🗨️"} */}
              </span>
            </div>
            {errors.password && (
              <p className="error" style={{ whiteSpace: "pre-line" }}>
                {errors.password}
              </p>
            )}

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
