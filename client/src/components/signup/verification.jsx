import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const backEndUrl = import.meta.env.VITE_BACK_END_URL

function Verification() {
    // const { state } = useLocation();
    // const navigate = useNavigate();
    // const email = location.state?.email || ""; // Get email from navigation state
    // const [code, setCode] = useState("");
    // const { state } = useLocation();
    const navigate = useNavigate();
    // const email = state?.email || ""; // Get email from navigation state
    const [code, setCode] = useState("");
    const [resendMessage, setResendMessage] = useState("");

    const handleVerify = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("verificationToken"); // Retrieve token from localStorage
        console.log(backEndUrl)
        try {
            const response = await axios.post(`${backEndUrl}/api/register/verify-email`, {
                token,
                code,
            });

            if (response.status === 200) {
                alert("Email verified successfully!");
                navigate("/login"); // Redirect to login page
            }
        } catch (err) {
            alert(err.response?.data?.message || "Invalid verification code.");
        }

    };

    const handleResendCode = async () => {
        try {
            const token = localStorage.getItem("verificationToken");
            const response = await axios.post(`${backEndUrl}/api/register/resend-code`, { token });
    
            if (response.status === 200) {
                setResendMessage("New verification code sent! Check your email.");
                localStorage.setItem("verificationToken", response.data.newToken); // Store new token
            }
        } catch (err) {
            console.error(err.response?.data?.message || "Error resending code.");
        }
    };
    
    return (
        <div>
            <h2>Verify Your Email</h2>
            <p>Enter the verification code sent</p>
            <form onSubmit={handleVerify}>
                <input type="text" placeholder="Enter code" required onChange={(e) => setCode(e.target.value)} />
                <button type="submit">Verify</button>
            </form>
            <button onClick={handleResendCode} style={{ marginTop: "10px" }}>
                Resend Verification Code
            </button>

        </div>
    );
}

export default Verification;
