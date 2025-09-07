import React, { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify" // or use shadcn's toast if you prefer

import LoadingScreen from "../../loadingScreen/loadingScreen"
import Overlay from "../../overlayScreen/overlay"

const backEndUrl = import.meta.env.VITE_BACK_END_URL

const Stops = () => {
  const [stops, setStops] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // new stop state
  const [newStop, setNewStop] = useState({
    stopName: "",
    location: "",
  })

  // fetch stops
  const fetchStops = async () => {
    try {
      setIsLoading(true)
      const { data } = await axios.get(`${backEndUrl}/stop/get-stops`)
      setStops(data)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching stops!")
    } finally {
      setIsLoading(false)
    }
  }

  // add stop
  const addStop = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      await axios.post(`${backEndUrl}/stop/add-stop`, newStop)
      toast.success("Stop added successfully!")
      setNewStop({ stopName: "", location: "" })
      fetchStops()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error adding stop!")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStops()
  }, [])

  return (
    <div className="space-y-6">
      {/* Add Stop Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Add Stop</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addStop} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stop Name</label>
              <Input
                type="text"
                placeholder="Enter stop name"
                value={newStop.stopName}
                onChange={(e) =>
                  setNewStop({ ...newStop, stopName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input
                type="text"
                placeholder="Enter location"
                value={newStop.location}
                onChange={(e) =>
                  setNewStop({ ...newStop, location: e.target.value })
                }
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Add Stop
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Stops List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Stops List</CardTitle>
        </CardHeader>
        <CardContent>
          {stops.length === 0 ? (
            <p className="text-sm text-gray-500">No stops available.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {stops.map((stop) => (
                <li key={stop.stop_id} className="py-2">
                  <span className="font-medium">{stop.stop_name}</span>
                  <span className="text-gray-600"> — {stop.location}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {isLoading && <LoadingScreen />}
      <Overlay />
    </div>
  )
}

export default Stops
