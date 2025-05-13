import React, { useState, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Overlay from "../overlayScreen/overlay";
import Loading from "../loadingScreen/loadingScreen";
import "./verification.css";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

function Verification({ setVerificationFlag }) {
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

  const handleVerify = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("verificationToken"); // Retrieve token from localStorage
    const enteredOtp = otp.join("");
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${backEndUrl}/api/register/verify-email`,
        {
          token,
          enteredOtp,
        }
      );

      if (response.status === 200) {
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage("Email verified successfully!");
          setAlertFlag(true);
        }, 1000);

        setTimeout(() => {
          setAlertFlag(false);
          navigate("/reset-password"); // Redirect to reset-password page
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
      console.error(
        err || "Invalid verification code."
      );
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
        <form className="otp-Form" onSubmit={handleVerify} >
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
          <button className="verifyButton" type="submit">
            Verify
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
            <button className="resendBtn" type="button" onClick={handleResendCode}>
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
