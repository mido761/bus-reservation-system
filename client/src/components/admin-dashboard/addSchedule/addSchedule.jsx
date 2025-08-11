// import "./AddBus.css";
import { useState, useEffect } from "react";
import axios from "axios";
import FormComponent from "../../formComponent";
import LoadingScreen from "../../loadingScreen/loadingScreen";
import Overlay from "../../overlayScreen/overlay";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const AddSchedule = () => {
  const [availableBuses, setAvailableBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailableBuses = async () => {
    try {
      const availableBuses = await axios.get(
        `${backEndUrl}/bus/get-available-buses`
      );
      console.log(availableBuses);

      setAvailableBuses(availableBuses);
    } catch (err) {
      console.error(
        "Error fetching available buses!",
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const routes = await axios.get(`${backEndUrl}/route/get-routes`);
      console.log(routes);
      
      setRoutes(routes);
    } catch (err) {
      console.error(
        "Error fetching available buses!",
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableBuses();
    fetchRoutes();
  }, []);

  const fields = [
    {
      name: "Bus",
      defaultValue: undefined,
      type: "select",
      options: availableBuses,
    },
    { name: "Route", defaultValue: undefined, type: "select", options: routes },
    { name: "Departure Date", defaultValue: "", type: "date" },
    { name: "DepartureTime", defaultValue: "", type: "time" },
    { name: "ArrivalTime", defaultValue: "", type: "time" },
  ];

  return (
    <div className="add-bus">
      <FormComponent
        formName={"Schedule"}
        fields={fields}
        endpoint={"schedule/add-schedule"}
        successMessage={"Schedule Added successfully"}
      />

      {isLoading && <LoadingScreen />}
      <Overlay
        alertFlag={alertFlag}
        alertMessage={alertMessage}
        setAlertFlag={setAlertFlag}
      />
    </div>
  );
};

export default AddSchedule;
