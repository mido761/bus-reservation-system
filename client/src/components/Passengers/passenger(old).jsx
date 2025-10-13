import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
// import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadingScreen from "../loadingScreen/loadingScreen";
import LoadingPage from "../loadingPage/loadingPage";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

export default function PassengersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { busId } = location.state || {};

  // State
  const [seats, setSeats] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState("");
  const [busDetails, setBusDetails] = useState(null);

  // Modals
  const [seatId, setSeatId] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [selectedNewBus, setSelectedNewBus] = useState(null);
  const [destination, setDestination] = useState("");

  /* --------------------------- Utils --------------------------- */
  const convertTo12Hour = (time) => {
    if (!time) return "";
    let [h, m] = time.split(":");
    h = parseInt(h);
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${period}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /* --------------------------- API Calls --------------------------- */
  const fetchBusDetails = async () => {
    try {
      const { data } = await axios.get(`${backEndUrl}/form/${busId}`);
      setBusDetails(data);
    } catch {
      setAlertMessage("⚠️ Failed to load bus details");
    }
  };

  const fetchPassengers = async () => {
    try {
      const auth = await axios.get(`${backEndUrl}/auth`, { withCredentials: true });
      const userID = auth.data.userId;
      setCurrentUser(userID);

      const res = await axios.post(`${backEndUrl}/seats/user/${busId}`, { userId: userID });
      setSeats(res.data.data.finalSeatsArr || []);

      const userProfile = await axios.get(`${backEndUrl}/user/profile/${userID}`);
      setUserInfo(userProfile.data);
    } catch {
      setSeats([]);
    } finally {
      setPageLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`${backEndUrl}/formselection/${busId}`, {
        data: { seatId, userId: currentUser },
      });
      setSeats((s) => s.filter((seat) => seat.seatId !== seatId));
      setAlertMessage("✅ Seat canceled successfully!");
    } catch {
      setAlertMessage("⚠️ You can only cancel seats 3h before departure!");
    } finally {
      setShowCancel(false);
      setIsLoading(false);
    }
  };

  /* --------------------------- Lifecycle --------------------------- */
  useEffect(() => {
    if (busId) {
      fetchBusDetails();
      fetchPassengers();
    }
  }, [busId]);

  if (pageLoading) return <LoadingPage />;

  /* --------------------------- Components --------------------------- */
  const BusDetailsCard = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {busDetails?.location?.pickupLocation} → {busDetails?.location?.arrivalLocation}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <Badge>{formatDate(busDetails?.schedule)}</Badge>
        <Badge variant="secondary">{convertTo12Hour(busDetails?.departureTime)}</Badge>
      </CardContent>
    </Card>
  );

  const PassengersTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Route</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {seats.map((seat, idx) =>
          seat.currentUser ? (
            <TableRow key={seat.seatId}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{userInfo.name}</TableCell>
              <TableCell>{seat.route}</TableCell>
              <TableCell className="space-x-2">
                <Button variant="destructive" size="sm" onClick={() => { setSeatId(seat.seatId); setShowCancel(true); }}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => { setSeatId(seat.seatId); setShowSwitch(true); }}>
                  Switch
                </Button>
              </TableCell>
            </TableRow>
          ) : (
            <TableRow key={idx}>
              <TableCell colSpan={4}>{idx + 1}</TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Reserved Passengers</h2>

      {busDetails && <BusDetailsCard />}
      {seats.length > 0 ? <PassengersTable /> : <p className="text-gray-500">No reserved passengers.</p>}

      {/* Cancel Seat Modal */}
      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to cancel your seat?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCancel(false)}>Close</Button>
            <Button variant="destructive" onClick={handleCancel}>Yes, Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alerts
      {alertMessage && (
        <Alert className="mt-4">
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )} */}

      {isLoading && <LoadingScreen />}
    </div>
  );
}
