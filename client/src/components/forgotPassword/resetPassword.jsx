import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Overlay from "../overlayScreen/overlay";
import Verification from "../signup/verification";
import CardForm from "@/components/ui/card-form"; // Reusable Card + Form wrapper
import { Loader2 } from "lucide-react";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

function ResetPassword({ email }) {
  // const { state } = useLocation();
  // const navigate = useNavigate();
  // const email = location.state?.email || ""; // Get email from navigation state
  // const [code, setCode] = useState("");
  // const { state } = useLocation();
  const navigate = useNavigate();
  // const email = state?.email || ""; // Get email from navigation state
  const [verificationFlag, setVerificationFlag] = useState(false);
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
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${backEndUrl}/api/reset-password`,
        { email, otp, password },
        { withCredentials: true }
      );

      if (response.status === 201) {
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage(
            <p>
              <br /> Password reset was successfull
            </p>
          );
          setAlertFlag(true);
        }, 1000);

        setTimeout(() => {
          setAlertFlag(false);
          // localStorage.setItem("verificationToken", result.data.token);
          navigate("/login")
          setVerificationFlag(false);
        }, 2500);
      }
    } catch (err) {
      console.error(err)
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
    setError("");
    passwordValidation(password);
  }, [password]);

  // if (!verificationFlag)
  //   return <Verification setVerificationFlag={setVerificationFlag} />;

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-background">
      <CardForm title="Reset Password" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Enter OTP</p>
          <div className="flex flex-row gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                type="text"
                name="otp"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputRefs.current[index] = el)}
                className="w-9 h-9 text-center text-lg"
              />
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="password">New Password</Label>
          <Input
            type={passwordVisible ? "text" : "password"}
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
            {/* {passwordVisible ? <HiEyeOff /> : <HiEye />}{" "} */}
            {/* Eye icons from react-icons */}
          </span>
        </div>

        <div>
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            type={passwordVisible ? "text" : "password"}
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
            {/* {confirmPasswordVisible ? <HiEyeOff /> : <HiEye />}{" "} */}
            {/* Eye icons from react-icons */}
          </span>
        </div>

        <div>
          {error && password.length > 0 && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>

        <div className="flex gap-6">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save password"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Resend code"
            )}
          </Button>
        </div>
      </CardForm>
      <Overlay
        alertFlag={alertFlag}
        alertMessage={alertMessage}
        setAlertFlag={setAlertFlag}
      />
    </div>
  );
}

export default ResetPassword;
