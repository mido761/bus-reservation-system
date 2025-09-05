import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Overlay from "../overlayScreen/overlay";
import Verification from "../signup/verification";
import CardForm from "@/components/ui/card-form"; // Reusable Card + Form wrapper
import { Loader2 } from "lucide-react";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  //   const inputRefs = useRef([]);
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

  const handleSubmit = () => {};

  useEffect(() => {
    setError("");
    passwordValidation(password);
  }, [password]);

  if (!verificationFlag)
    return <Verification setVerificationFlag={setVerificationFlag} />;

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-background">
      <CardForm title="Reset Password" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="password">Password</Label>
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Reset password"
          )}
        </Button>
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
