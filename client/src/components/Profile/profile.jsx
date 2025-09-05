import React, { useState, useEffect } from "react";
import axios from "axios";
// import { FaEnvelope, FaPhone } from "react-icons/fa6";
import "./UserProfile.css";
import Dashboard from "../dashboard/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import LoadingPage from "../loadingPage/loadingPage";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch authenticated user
        const res = await axios.get(`${backEndUrl}/user/profile`, {
          withCredentials: true,
        });
        setUserDetails(res.data);
      } catch (err) {
        console.error("Error fetching user or buses:", err);
        setError("Failed to fetch user details or buses.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000); // 1 second loading
      }
    };

    fetchUserProfile();
  }, []);

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
            {userDetails?.username ? getInitials(userDetails.username) : "?"}
          </div>

          {/* User Info */}
          <div className="text-center">
            <p className="font-semibold">
              {userDetails?.username || "No Name"}
            </p>
            <p className="text-muted-foreground">
              {userDetails?.email || "No Email"}
            </p>
          </div>

          {/* Contact Info */}
          <div className="text-center">
            <p>{userDetails?.phone_number || "No Phone"}</p>
          </div>

          {/* Dashboard Section */}
          <div className="w-full mt-4">
            {/* You can render a Dashboard component here */}
            {/* <Dashboard error={error} busDetails={busDetails} userId={userId} /> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
