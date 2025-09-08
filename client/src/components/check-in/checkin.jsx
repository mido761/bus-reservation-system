import React, { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import SeatLegend from "./SeatLegend"

const backEndUrl = import.meta.env.VITE_BACK_END_URL

export default function Checkin() {
  const [bus, setBus] = useState(null)
  const [seats, setSeats] = useState([])
  const [bookedSeats, setBookedSeats] = useState([])
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [selectedSeatId, setSelectedSeatId] = useState("")
  const [showPopup, setShowPopup] = useState(false)

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const busId = queryParams.get("bus_id")

  const fetchBusDetails = async () => {
    try {
      const res = await axios.get(`${backEndUrl}/bus/get-bus/${busId}`)
      setBus(res.data.bus)
    } catch (err) {
      toast.error("❌ Error fetching bus details", { autoClose: 2000, position: "top-center" })
    }
  }

  const fetchBusSeats = async () => {
    try {
      const res = await axios.get(`${backEndUrl}/seat/get-bus-seats/${busId}`)
      const busSeats = res.data.seats
      const booked = busSeats
        .filter((seat) => seat.status !== "Available")
        .map((seat) => seat.seat_number)

      setBookedSeats(booked)
      setSeats(busSeats)
    } catch (err) {
      toast.error("❌ Error fetching seats", { autoClose: 2000, position: "top-center" })
    }
  }

  useEffect(() => {
    fetchBusDetails()
    fetchBusSeats()
  }, [])

  const seatLayout = [
    ["DRIVER", 1, 2],
    [3, 4, 5, null],
    [6, 7, null, 8],
    [9, 10, null, 11],
    [12, 13, 14, 15],
  ]

  const handleSeatClick = (seat) => {
    if (seat && seat !== "DRIVER") {
      setSelectedSeat(seat)
      setSelectedSeatId(seats[seat - 1]?.seat_id || "")
    }
  }

  const handleConfirmClick = () => {
    if (!selectedSeat) {
      toast.warning("⚠️ Please select a seat first", { autoClose: 2000, position: "top-center" })
      return
    }
    setShowPopup(true)
  }

  const handlePopupConfirm = async () => {
    setShowPopup(false)
    try {
      await axios.put(
        `${backEndUrl}/seat/check-in`,
        { seatId: selectedSeatId, busId },
        { withCredentials: true }
      )

      setSeats((prev) =>
        prev.map((seatObj, idx) =>
          idx === selectedSeat - 1 ? { ...seatObj, status: "booked" } : seatObj
        )
      )
      setBookedSeats([...bookedSeats, selectedSeat])
      setSelectedSeat(null)
      setSelectedSeatId("")
      toast.success(`✅ Seat ${selectedSeat} reserved successfully`, { autoClose: 2000, position: "top-center" })
    } catch (err) {
      toast.error(`❌ ${err.response?.data?.message || "Check-in failed"}`, { autoClose: 2000, position: "top-center" })
    }
  }

  const handleCancelSeat = async () => {
    setShowPopup(false)
    try {
      await axios.put(
        `${backEndUrl}/seat/cancel-check-in`,
        { seatId: selectedSeatId, busId },
        { withCredentials: true }
      )

      setSeats((prev) =>
        prev.map((seatObj, idx) =>
          idx === selectedSeat - 1 ? { ...seatObj, status: "available" } : seatObj
        )
      )
      setBookedSeats(bookedSeats.filter((s) => s !== selectedSeat))
      setSelectedSeat(null)
      setSelectedSeatId("")
      toast.info(`❌ Seat ${selectedSeat} reservation cancelled`, { autoClose: 2000, position: "top-center" })
    } catch (err) {
      toast.error(`❌ ${err.response?.data?.message || "Cancel failed"}`, { autoClose: 2000, position: "top-center" })
    }
  }

  if (!bus) return <p className="text-center mt-10 text-gray-500">Bus not found!</p>

  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">🚌 Bus Seat Selection</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <SeatLegend />
{/* Seat Layout */}
<div className="space-y-3">
  {seatLayout.map((row, rowIdx) => (
    <div
      key={rowIdx}
      className="grid grid-cols-4 gap-3 justify-items-center"
    >
      {row.map((seat, seatIdx) => {
        const isBooked = bookedSeats.includes(seat)
        const isSelected = selectedSeat === seat
        const seatStyles =
          seat === "DRIVER"
            ? "bg-yellow-400 text-black font-semibold col-span-2 w-full"
            : seat === null
            ? "invisible"
            : isSelected
            ? "bg-green-500 text-white"
            : isBooked
            ? "bg-red-500 text-white cursor-not-allowed"
            : "bg-gray-200 hover:bg-blue-400 hover:text-white"

        return (
          <div
            key={seatIdx}
            onClick={() => handleSeatClick(seat)}
            className={`${
              seat === "DRIVER" ? "h-14" : "w-14 h-14"
            } flex items-center justify-center rounded-lg shadow cursor-pointer transition ${seatStyles}`}
          >
            {seat === "DRIVER" ? "🚍 Driver" : seat}
          </div>
        )
      })}
    </div>
  ))}
</div>


          {/* Actions */}
          <div className="flex space-x-4">
            <Button variant="default" onClick={handleConfirmClick}>
              Confirm Selection
            </Button>
            <Button variant="outline" onClick={() => setSelectedSeat(null)}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Popup */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {seats[selectedSeat - 1]?.status === "booked" ? "Cancel Seat" : "Confirm Seat"}
            </DialogTitle>
            <DialogDescription>
              You have selected <b>Seat {selectedSeat}</b>. Do you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            {seats[selectedSeat - 1]?.status !== "booked" ? (
              <Button onClick={handlePopupConfirm}>Yes, Confirm</Button>
            ) : (
              <Button variant="destructive" onClick={handleCancelSeat}>
                Cancel Seat
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowPopup(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
