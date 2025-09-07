import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import LoadingScreen from "../../loadingScreen/loadingScreen";
import Overlay from "../../overlayScreen/overlay";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Route = () => {
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [alert, setAlert] = useState({ flag: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const [newRoute, setNewRoute] = useState({
    source: "",
    destination: "",
    distance: "",
    estimatedDuration: "",
    stops: [],
    isActive: true,
  });

  const [linkData, setLinkData] = useState({
    stopId: "",
    position: 0,
  });

  // Fetch all stops
  const fetchStops = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backEndUrl}/stop/get-stops`);
      setStops(data);
    } catch (err) {
      setAlert({ flag: true, message: err?.response?.data?.message || "Error fetching stops" });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all routes with stops
  const fetchRoutes = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backEndUrl}/route/get-routes-with-stops`);

      const groupedRoutes = data.routes.reduce((acc, curr) => {
        let route = acc.find((r) => r.route_id === curr.route_id);
        if (!route) {
          route = {
            route_id: curr.route_id,
            source: curr.source,
            destination: curr.destination,
            stops: [],
          };
          acc.push(route);
        }
        route.stops.push({
          stop_id: curr.stop_id,
          stop_name: curr.stop_name,
          location: curr.location,
          position: curr.position,
        });
        return acc;
      }, []);

      setRoutes(groupedRoutes);
    } catch (err) {
      setAlert({ flag: true, message: err?.response?.data?.message || "Error fetching routes" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
    fetchRoutes();
  }, []);

  // Add new route
  const addRoute = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.post(`${backEndUrl}/route/add-route`, newRoute);
      setAlert({ flag: true, message: "Route added successfully!" });
      setNewRoute({ source: "", destination: "", distance: "", estimatedDuration: "", stops: [], isActive: true });
      fetchRoutes();
    } catch (err) {
      setAlert({ flag: true, message: err?.response?.data?.message || "Error adding route!" });
    } finally {
      setIsLoading(false);
    }
  };

  // Link stop to route
  const handleLinkRouteStop = async (routeId) => {
    if (!linkData.stopId) return;
    try {
      setIsLoading(true);
      await axios.post(`${backEndUrl}/route/link-route-stop`, { routeId, ...linkData });
      setAlert({ flag: true, message: "Stop linked successfully!" });
      setLinkData({ stopId: "", position: 0 });
      fetchRoutes();
    } catch (err) {
      setAlert({ flag: true, message: err?.response?.data?.message || "Error linking stop!" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Add Route Form */}
      <Card className="shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">➕ Add New Route</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={addRoute}>
            <div className="flex flex-col">
              <Label>Source</Label>
              <Input
                placeholder="Source"
                value={newRoute.source}
                onChange={(e) => setNewRoute({ ...newRoute, source: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col">
              <Label>Destination</Label>
              <Input
                placeholder="Destination"
                value={newRoute.destination}
                onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col">
              <Label>Distance (km)</Label>
              <Input
                type="number"
                placeholder="Distance"
                value={newRoute.distance}
                onChange={(e) => setNewRoute({ ...newRoute, distance: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col">
              <Label>Estimated Duration (mins)</Label>
              <Input
                type="number"
                placeholder="Estimated Duration"
                value={newRoute.estimatedDuration}
                onChange={(e) => setNewRoute({ ...newRoute, estimatedDuration: e.target.value })}
                required
              />
            </div>
            <div className="col-span-full flex justify-end">
              <Button type="submit">Add Route</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Routes List */}
      <Card className="shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">🚌 Routes List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {routes.map((route) => (
            <Card key={route.route_id} className="p-4 border border-gray-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <p className="font-semibold">{route.source} → {route.destination}</p>
                  <ul className="ml-4 list-disc text-gray-700">
                    {route.stops
                      .sort((a, b) => a.position - b.position)
                      .map((stop) => (
                        <li key={stop.stop_id}>
                          {stop.position}. {stop.stop_name} ({stop.location})
                        </li>
                      ))}
                  </ul>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Position"
                    value={linkData.position}
                    onChange={(e) => setLinkData({ ...linkData, position: Number(e.target.value) })}
                  />
                  <Select
                    value={linkData.stopId}
                    onValueChange={(value) => setLinkData({ ...linkData, stopId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose stop" />
                    </SelectTrigger>
                    <SelectContent>
                      {stops
                        .filter((stop) => !route.stops.some((rs) => rs.stop_id === stop.stop_id))
                        .map((stop) => (
                          <SelectItem key={stop.stop_id} value={stop.stop_id}>
                            {stop.stop_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => handleLinkRouteStop(route.route_id)}>Link</Button>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      {isLoading && <LoadingScreen />}
      <Overlay
        alertFlag={alert.flag}
        alertMessage={alert.message}
        setAlertFlag={(flag) => setAlert({ ...alert, flag })}
      />
    </div>
  );
};

export default Route;
