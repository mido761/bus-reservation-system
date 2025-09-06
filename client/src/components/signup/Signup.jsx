import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Verification from "./verification";
import LoadingScreen from "../loadingScreen/loadingScreen";
import Overlay from "../overlayScreen/overlay";
import CardForm from "@/components/ui/card-form"; // Reusable Card + Form wrapper
import { Loader2 } from "lucide-react";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  // --- Validation functions ---
  const validatePhoneNumber = (number) =>
    /^\d{11}$/.test(number) && number.startsWith("01");
  const validateEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/.test(email);
  const validatePassword = (password) => {
    let errors = [];
    if (password.length < 8) errors.push("At least 8 characters long");
    if (!/[A-Z]/.test(password)) errors.push("Include at least one uppercase");
    if (!/[a-z]/.test(password)) errors.push("Include at least one lowercase");
    if (!/\d/.test(password)) errors.push("Include at least one number");
    if (!/[@$!%*?&.#]/.test(password))
      errors.push("Include at least one special character (@$!%*?&.#)");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    let validationErrors = {};
    if (!validatePhoneNumber(phoneNumber))
      validationErrors.phoneNumber = "Please enter a valid phone number.";
    if (!validateEmail(email))
      validationErrors.email = "Enter a valid email address.";
    if (!validatePassword(password).length === 0)
      validationErrors.password = validatePassword(password).join("\n");

    if (!gender) {
      validationErrors.gender = "You need to select gender!";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await axios.post(`${backEndUrl}/api/register/send-code`, {
        name,
        phoneNumber,
        email,
        password,
        gender,
      });

      if (result.status === 201) {
        setTimeout(() => {
          setIsLoading(false);
          toast.success("Registered successfully! Check your email for verification.", {
            position: "top-center",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }, 1000);

        setTimeout(() => {
          localStorage.setItem("verificationToken", result.data.token);
          setVerificationFlag(true);
        }, 2500);
      }
    } catch (err) {
      setIsLoading(false);
      toast.error(err.response?.data?.message || "An error occurred.", {
        position: "top-center",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  useEffect(() => {
    let validationErrors = {};
    if (!validatePhoneNumber(phoneNumber))
      validationErrors.phoneNumber = "Please enter a valid phone number.";
    if (!validateEmail(email))
      validationErrors.email = "Enter a valid email address.";
    validationErrors.password = validatePassword(password).join("\n");
    setErrors(validationErrors);
  }, [email, password, phoneNumber]);

  // if (isLoading) return <LoadingScreen />;

  if (verificationFlag)
    return <Verification setVerificationFlag={setVerificationFlag} />;

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-background">
      <ToastContainer position="top-center" autoClose={2500} hideProgressBar={false} newestOnTop={true} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <CardForm title="Sign Up" onSubmit={handleSubmit}>
        {/* ...existing code... */}
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            type="text"
            id="username"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {/* ...existing code... */}
        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
            maxLength="11"
            required
          />
          {errors.phoneNumber && phoneNumber.length > 0 && (
            <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
          )}
        </div>
        {/* ...existing code... */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && email.length > 0 && (
            <p className="text-red-500 text-xs">{errors.email}</p>
          )}
        </div>
        {/* ...existing code... */}
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="absolute right-2 top-2 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {/* {showPassword ? "👁️" : "👁️‍🗨️"} */}
            </span>
          </div>
          {errors.password && password.length > 0 && (
            <pre className="text-red-400 text-xs whitespace-pre-line">
              {errors.password}
            </pre>
          )}
        </div>
        {/* ...existing code... */}
        {/* Gender Selection */}
        <div>
          <Label>Select Gender</Label>
          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant={gender === "Male" ? "default" : "outline"}
              onClick={() => setGender("Male")}
            >
              Male
            </Button>
            <Button
              type="button"
              variant={gender === "Female" ? "default" : "outline"}
              onClick={() => setGender("Female")}
            >
              Female
            </Button>
          </div>
          {errors.gender && (
            <p className="text-red-500 text-sm">{errors.gender}</p>
          )}
        </div>
        {/* ...existing code... */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign Up"}
        </Button>
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </CardForm>
      {/* ...existing code... */}
  {/* Overlay for alerts removed, errors now shown in toastify */}
    </div>
  );
}

export default Signup;
