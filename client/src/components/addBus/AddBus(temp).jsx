import "./AddBus.css";
import FormComponent from "../formComponent";

const fields = [
  { name: "busType", defaultValue: "form" },
  { name: "totalSeats", defaultValue: 15 },
  { name: "busNumber", defaultValue: "" },
  { name: "schedule", defaultValue: "", type: "date" },
  { name: "price", defaultValue: 120 },
  {
    name: "pickupLocation",
    defaultValue: "pickup location",
    type: "select",
    options: ["cairo", "Ejust"],
  },
  {
    name: "arrivalLocation",
    defaultValue: "arrival location",
    type: "select",
    options: ["cairo", "Ejust"],
  },
  { name: "departureTime", defaultValue: "", type: "time" },
  { name: "arrivalTime", defaultValue: "", type: "time" },
  { name: "cancelTimeAllowance", type: "number" },
  { name: "bookingTimeAllowance", type: "number" },
  { name: "allowedNumberOfBags", defaultValue: "" },
];

const AddBus = () => {
  return (
    <div className="add-bus">
      <FormComponent
        formName={"Bus"}
        fields={fields}
        endpoint={"form/add-form"}
        successMessage={"Bus Added successfully"}
      />
    </div>
  );
};

export default AddBus;
