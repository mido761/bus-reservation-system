import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Overlay from "../overlayScreen/overlay";
import "../login/login.css";
import Verification from "./verification";
import CardForm from "@/components/ui/card-form"; // Reusable Card + Form wrapper
import { Loader2 } from "lucide-react";
import ResetPassword from "./resetPassword";
// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [alertFlag, setAlertFlag] = useState(true);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationFlag, setVerificationFlag] = useState(false);

  const navigate = useNavigate();

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   try {
  //     const response = await axios.post(
  //       `${backEndUrl}/api/forgot-password`,
  //       { email },
  //       { withCredentials: true }
  //     );
  //     // const response = {"status": 200}
  //     if (response.status === 200) {
  //       setTimeout(() => {
  //         setIsLoading(false);
  //         setAlertMessage("Reset password link sent!");
  //         setAlertFlag(true);
  //       }, 1000);
  //     }
  //   } catch (error) {
  //     if (error.status === 404) {
  //       setAlertMessage("Email not found");
  //     } else {
  //       setAlertMessage("There was an error during verification");
  //     }

  //     setTimeout(() => {
  //       setIsLoading(false);
  //       setAlertFlag(true);
  //     }, 1000);

  //     setTimeout(() => {
  //       setAlertFlag(false);
  //     }, 2200);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log(email)
      const response = await axios.post(
        `${backEndUrl}/api/request-reset`,
        { email },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage(
            <p>
              <br /> Check your email for verification Code.
            </p>
          );
          setAlertFlag(true);
        }, 1000);

        setTimeout(() => {
          setAlertFlag(false);
          // localStorage.setItem("verificationToken", result.data.token);
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

  if (verificationFlag)
    return <ResetPassword verFalag={verificationFlag} email={email} />;

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-background">
      <CardForm title="Forgot Password" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="email">Your Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Reset password"
          )}
        </Button>
        <div className="flex justify-between text-sm text-muted-foreground">
          <p className="text-center text-sm"> Already have an account?</p>

          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </div>
      </CardForm>

      {/* Dialog for alert messages */}
      <Overlay
        alertFlag={alertFlag}
        alertMessage={alertMessage}
        setAlertFlag={setAlertFlag}
      />
    </div>
  );
}

export default ForgotPassword;
