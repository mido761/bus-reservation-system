import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Overlay from "../overlayScreen/overlay";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import CardForm from "@/components/ui/card-form"; // Reusable Card + Form wrapper

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${backEndUrl}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const userId = response.data.userId;
        sessionStorage.setItem("authToken", userId);

        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage("✅ Login successful");
          setAlertFlag(true);
        }, 500);

        setTimeout(() => {
          setAlertFlag(false);
          navigate("/home");
        }, 2000);
      }
    } catch (error) {
      let message = "There was an error during login";
      if (error.response?.status === 404) message = "User not found";
      else if (error.response?.status === 401)
        message = "Password is incorrect";

      setTimeout(() => {
        setIsLoading(false);
        setAlertMessage(`❌ ${message}`);
        setAlertFlag(true);
      }, 500);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <CardForm title="Login" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="relative">
          <Input
            type={passwordVisible ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer select-none"
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            {/* {passwordVisible ? "👁️" : "👁️‍🗨️"} */}
          </span>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
        </Button>

        <div className="flex justify-between text-sm text-muted-foreground">
          <Link to="/forgot-password">Forgot Password?</Link>
          <Link to="/register">Sign up</Link>
        </div>
      </CardForm>

      {/* Dialog for alert messages */}
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
