import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Overlay from "../overlayScreen/overlay";
import Loading from "../loadingScreen/loadingScreen";
import "./verification.css";
import ResetPassword from "../reset-password/reset-password";
import { HiEye, HiEyeOff } from "react-icons/hi"; // Import eye icons from react-icons

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

function Verification({ setVerificationFlag, email }) {
  // const { state } = useLocation();
  // const navigate = useNavigate();
  // const email = location.state?.email || ""; // Get email from navigation state
  // const [code, setCode] = useState("");
  // const { state } = useLocation();
  const navigate = useNavigate();
  // const email = state?.email || ""; // Get email from navigation state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // State for password visibility
  const [error, setError] = useState("");

  const validatePassword = (password) => {
    let errors = [];

    if (password.length < 8) errors.push("At least 8 characters long");
    if (!/[A-Z]/.test(password))
      errors.push("Include at least one uppercase letter");
    if (!/[a-z]/.test(password))
      errors.push("Include at least one lowercase letter");
    if (!/\d/.test(password)) errors.push("Include at least one number");
    if (!/[@$!%*?&.#]/.test(password))
      errors.push("Include at least one special character \n(@$!%*?&.#)");

    return errors;
  };

  const passwordValidation = (password) => {
    const passwordErrors = validatePassword(password);

    if (passwordErrors.length > 0) {
      setError(passwordErrors.join("\n")); // Show errors with line breaks
    } else {
      setError(""); // Clear the error if password is valid
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("verificationToken"); // Retrieve token from localStorage
    const enteredOtp = otp.join("");
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${backEndUrl}/api/reset-password`,
        {
          email: email,
          otp: otp,
          password: password
        }
      );

      if (response.status === 200) {
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage("Password successfully changed!");
          setAlertFlag(true);
        }, 1000);

        setTimeout(() => {
          setAlertFlag(false);
          navigate("/login"); // Redirect to reset-password page
        }, 2000);
      }
    } catch (err) {
      setTimeout(() => {
        setIsLoading(false);
        setAlertMessage("Invalid verification code");
        setAlertFlag(true);
      }, 1000);
      setTimeout(() => {
        setAlertFlag(false);
      }, 2000);
      console.error(err || "Invalid verification code.");
    }
  };

  const handleChange = (index, e) => {
    const value = e.target.value.replace(/\D/, ""); // Allow only digits
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if not the last one
    if (index < otp.length - 1 && value) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (!newOtp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }
      newOtp[index] = "";
      setOtp(newOtp);
    }

    if (e.key === "Enter") {
      e.preventDefault(); // Prevents form submission
      console.log("Enter key pressed, but form not submitted!");
    }

    console.log(otp);
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("verificationToken");
      const response = await axios.post(
        `${backEndUrl}/api/register/resend-code`,
        { token }
      );

      if (response.status === 200) {
        localStorage.setItem("verificationToken", response.data.newToken); // Store new token
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage("New verification code sent! Check your email.");
          setAlertFlag(true);
        }, 1000);
        setTimeout(() => {
          setAlertFlag(false);
        }, 2000);
      }
    } catch (err) {
      setTimeout(() => {
        setIsLoading(false);
        setAlertMessage("Error while resending code.");
        setAlertFlag(true);
      }, 1000);
      setTimeout(() => {
        setAlertFlag(false);
      }, 2000);
      console.error(err || "Error resending code.");
    }
  };

  useEffect(() => {
    setError("");
    passwordValidation(password);
  }, [password]);

  return (
    <div className="verification-page">
      <div className="verification-container">
        {/* <h2>Verify Your Email</h2>
        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Verification code"
            required
            onChange={(e) => setCode(e.target.value)}
          />
          <button id="verify" type="submit">
            Verify
          </button>
          <button
            id="resend"
            onClick={handleResendCode}
            style={{ marginTop: "10px" }}
          >
            Resend Verification Code
          </button>
        </form> */}
        <form className="otp-Form" onSubmit={handleVerify}>
          <span className="mainHeading">Enter OTP</span>
          <p className="otpSubheading">
            We have sent a verification code to your email
          </p>
          <div className="inputContainer">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                className="otp-input"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputRefs.current[index] = el)}
              />
            ))}
          </div>
          <div className="password-input">
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
                onClick={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                } // Toggle password visibility
              >
                {confirmPasswordVisible ? <HiEyeOff /> : <HiEye />}{" "}
                {/* Eye icons from react-icons */}
              </span>
            </div>
            <div className="error">
              {error && password.length > 0 && (
                <pre style={{ color: "red" }}>{error}</pre>
              )}
            </div>
          </div>

          <button className="verifyButton" type="submit">
            Reset Password
          </button>
          <button
            id="exitBtn"
            type="button"
            onClick={() => setVerificationFlag(false)}
          >
            ×
          </button>
          <p className="resendNote">
            Didn't receive the code?{" "}
            <button
              className="resendBtn"
              type="button"
              onClick={handleResendCode}
            >
              Resend Code
            </button>
          </p>
        </form>
      </div>
      {isLoading && <Loading />}

      {alertFlag && (
        <Overlay
          alertFlag={alertFlag}
          alertMessage={alertMessage}
          setAlertFlag={setAlertFlag}
        />
      )}
    </div>
  );
}

export default Verification;
