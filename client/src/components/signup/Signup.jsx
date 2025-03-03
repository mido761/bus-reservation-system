import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Verification from "./verification";
import LoadingScreen from "../loadingScreen/loadingScreen";
import Overlay from "../overlayScreen/overlay";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [verificationFlag, setVerificationFlag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); 

  const navigate = useNavigate();

  // Validation Functions
  const validatePhoneNumber = (number) => {
    // Ensure phone number starts with "01" and is exactly 11 digits long
    return /^\d{11}$/.test(number) && number.startsWith("01");
  };

  const validateEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/.test(email);

  // const validatePassword = (password) =>
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/.test(password);

  // const passwordErrorMessage =
  //   "Password must meet the following requirements:\n" +
  //   "- At least 8 characters long\n" +
  //   "- Include at least one uppercase\n" +
  //   "- Include at least one lowercase letter\n" +
  //   "- Include at least one number\n" +
  //   "- Include at least one special character (@$!%*?&.#)";

  const validatePassword = (password) => {
    let errors = [];

    if (password.length < 8) errors.push("At least 8 characters long");
    if (!/[A-Z]/.test(password))
      errors.push("Include at least one uppercase letter");
    if (!/[a-z]/.test(password))
      errors.push("Include at least one lowercase letter");
    if (!/\d/.test(password)) errors.push("Include at least one number");
    if (!/[@$!%*?&.#]/.test(password))
      errors.push("Include at least one special character (@$!%*?&.#)");

    return errors;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate Inputs
    let validationErrors = {};
    if (!validatePhoneNumber(phoneNumber))
      validationErrors.phoneNumber = "Please enter a valid phone number.";
    if (!validateEmail(email))
      validationErrors.email =
        "Enter a valid email address (e.g., example@example.com).";
    if (!validatePassword(password))
      validationErrors.password = validatePassword(password).join("\n");

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await axios.post(`${backEndUrl}/api/register`, {
        name,
        phoneNumber,
        email,
        password,
        gender, // Send gender to backend
      });

      if (result.status === 201) {
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage(
            <p>
              <strong>Registered successfully</strong> <br />
              <br /> Check your email for verification.
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
      setTimeout(() => {
        setIsLoading(false);
        setAlertMessage(err.response?.data?.message || "An error occurred.");
        setAlertFlag(true);
      }, 1000);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
    }
  };

  useEffect(() => {
    let validationErrors = {};
    if (!validatePhoneNumber(phoneNumber))
      validationErrors.phoneNumber = "Please enter a valid phone number.";
    if (!validateEmail(email))
      validationErrors.email =
        "Enter a valid email address (e.g., example@example.com).";
    validationErrors.password = validatePassword(password).join("\n");
    setErrors(validationErrors);
  }, [email, password, phoneNumber]);



  return (
    <div className="register-page">
      {!verificationFlag ? (
        <div className="register-container">
          <h2>Register</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              onInput={(e) =>
                (e.target.value = e.target.value.replace(/\D/g, ""))
              }
              maxLength="11"
              required
            />
            {errors.phoneNumber && (
              <p className="error"> {errors.phoneNumber}</p>
            )}

            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="error"> {errors.email}</p>}

            <label htmlFor="password">Password</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>
            {errors.password && (
              <pre className="error" style={{ whiteSpace: "pre-line" }}>
                {" "}
                {errors.password}
              </pre>
            )}

            {/* Gender Selection */}
            <div className="gender-container">
              <label className="gender-label">Select Gender:</label>
              <div className="gender-options">
                <div
                  className={`gender-option male ${gender === "male" ? "selected" : ""}`}
                  onClick={() => setGender("male")}
                >
                  Male
                </div>
                <div
                  className={`gender-option female ${gender === "female" ? "selected" : ""}`}
                  onClick={() => setGender("female")}
                >
                  Female
                </div>
              </div>
            </div>
            {errors.gender && <p className="error">⚠️ {errors.gender}</p>}

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
      )}
    </div>
  );
}
export default Signup;
    