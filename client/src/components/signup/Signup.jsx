import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Verification from "./verification";
import CardForm from "@/components/ui/card-form"; 
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationFlag, setVerificationFlag] = useState(false);

  const navigate = useNavigate();

  // --- Validation Functions ---
  const validators = {
    name: (val) =>
      /^[A-Za-z]+$/.test(val) ? "" : "Username must contain only letters.",
    email: (val) =>
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,10}$/.test(val)
        ? ""
        : "Enter a valid email address.",
    phoneNumber: (val) =>
      /^\d{11}$/.test(val) && val.startsWith("01")
        ? ""
        : "Phone number must be 11 digits and start with 01.",
    password: (val) => {
      let errs = [];
      if (val.length < 8) errs.push("At least 8 characters long");
      if (!/[A-Z]/.test(val)) errs.push("Include at least one uppercase");
      if (!/[a-z]/.test(val)) errs.push("Include at least one lowercase");
      if (!/\d/.test(val)) errs.push("Include at least one number");
      if (!/[@$!%*?&.#]/.test(val))
        errs.push("Include at least one special character (@$!%*?&.#)");
      return errs.join("\n");
    },
    gender: (val) => (val ? "" : "You need to select gender!"),
  };

  const validateForm = () => {
    const newErrors = {};
    for (let field in validators) {
      const error = validators[field](form[field] || "");
      if (error) newErrors[field] = error;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Input Change Handler ---
  const handleChange = (e) => {
  const { id, value } = e.target;

  // enforce allowed characters
  const sanitizedValue =
    id === "phoneNumber"
      ? value.replace(/\D/g, "") // only numbers
      : id === "name"
      ? value.replace(/[^A-Za-z]/g, "") // only letters
      : value;

  setForm((prev) => ({ ...prev, [id]: sanitizedValue }));

  // run validator for this specific field immediately
  if (validators[id]) {
    const error = validators[id](sanitizedValue);
    setErrors((prev) => ({ ...prev, [id]: error }));
  }
};

  // --- Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await axios.post(`${backEndUrl}/api/register/send-code`, form);

      if (result.status === 201) {
        toast.success("Registered successfully! Check your email for verification.", {
          position: "top-center",
          autoClose: 2500,
        });

        localStorage.setItem("verificationToken", result.data.token);

        setTimeout(() => {
          setIsLoading(false);
          setVerificationFlag(true);
        }, 2000);
      }
    } catch (err) {
      setIsLoading(false);
      toast.error(err.response?.data?.message || "An error occurred.", {
        position: "top-center",
        autoClose: 2500,
      });
    }
  };

  // --- Show Verification Screen ---
  if (verificationFlag)
    return <Verification setVerificationFlag={setVerificationFlag} />;

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-background">
      <CardForm title="Sign Up" onSubmit={handleSubmit}>
        {/* Username */}
        <div>
          <Label htmlFor="name">Username</Label>
          <Input
            type="text"
            id="name"
            value={form.name}
            onChange={handleChange}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            type="tel"
            id="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            maxLength="11"
            required
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              value={form.password}
              onChange={handleChange}
            />
            <span
              className="absolute right-2 top-2 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
          {errors.password && (
            <pre className="text-red-400 text-xs whitespace-pre-line">
              {errors.password}
            </pre>
          )}
        </div>

        {/* Gender Selection */}
        <div>
          <Label>Select Gender</Label>
          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant={form.gender === "Male" ? "default" : "outline"}
              onClick={() => setForm((p) => ({ ...p, gender: "Male" }))}
            >
              Male
            </Button>
            <Button
              type="button"
              variant={form.gender === "Female" ? "default" : "outline"}
              onClick={() => setForm((p) => ({ ...p, gender: "Female" }))}
            >
              Female
            </Button>
          </div>
          {errors.gender && (
            <p className="text-red-500 text-sm">{errors.gender}</p>
          )}
        </div>

        {/* Submit Button */}
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
    </div>
  );
}

export default Signup;
