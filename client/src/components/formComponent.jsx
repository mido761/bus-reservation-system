import { useState } from "react";
import axios from "axios";
import LoadingScreen from "./loadingScreen/loadingScreen";
import Overlay from "./overlayScreen/overlay";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const AddComponent = ({ formName, fields, endpoint, successMessage }) => {
  ////// variables //////
  // implementaion specific
  const [formData, setFormData] = useState(
    Object.fromEntries(
      fields.map((field) => [field.name, field.defaultValue || ""])
    )
  );
  console.log(formData);

  // generic
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  ////// methods //////
  const today = new Date().toISOString().split("T")[0];
  // Needed

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${backEndUrl}/${endpoint}`, formData);

      setAlertMessage(successMessage); // Differs
      setAlertFlag(true);
    } catch (err) {
      setAlertMessage(err?.response?.data?.message || "Something went wrong");
      setAlertFlag(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => setAlertFlag(false), 2200);
    }
  };

  const renderField = (field) => {
    const { name, type, placeholder, options, defaultOption } = field;
    const allowedTypes = [
      "text",
      "number",
      "radio",
      "email",
      "tel",
      "time",
      "date",
      "select",
    ];
    if (!allowedTypes.includes(type)) {
      return;
    }

    if (type === "select") {
      return (
        <select
          name={name}
          value={formData[name]}
          onChange={(e) => handleChange(name, e.target.value)}
        >
          <option value="">{defaultOption ?? "Choose one option"}</option>
          {Array.isArray(options) &&
            options.map((opt) => (
              <option key={opt._id ?? opt} value={opt.value}>
                {opt}
              </option>
            ))}
        </select>
      );
    }

    return (
      <input
        type={type}
        value={formData[name]}
        placeholder={placeholder}
        onChange={(e) => handleChange(name, e.target.value)}
      />
    );
  };
  ////// body //////
  return (
    <>
    <h1>Add new {formName}</h1>
      <form action="" onSubmit={handleSubmit}>
        {fields.map((field) => {
          return field.type ? (
            <div key={field.name}>
              <label htmlFor="">
                {" "}
                {field.name}
              </label>
              {renderField(field)}
            </div>
          ) : null;
        })}

        <button type="submit"> Add {formName} </button>
      </form>

      {isLoading && <LoadingScreen />}
      <Overlay
        alertFlag={alertFlag}
        alertMessage={alertMessage}
        setAlertFlag={setAlertFlag}
      />
    </>
  );
};

export default AddComponent;

///  Sample Use ///

{
  /* <FormComponent
              formName={"Bus"}
              fields={[
                { name: "username", placeholder: "What should we call you?", defaultValue: "", type: "text"},
                { name: "email",  placeholder: "Enter Your Email", type: "email"}, // no default
                { name: "age", placeholder: "how old are you?", type: "number" },
                { name: "gender", defaultValue: "", placeholder: "Enter Your Gender", type: "text" },
                { name: "location", defaultValue: "", placeholder: "Where to go?", type: "select", options: ['Cairo', 'E-Just'], defaultOption: "Choose Your Location" },
              ]}
            /> */
}

///     ///
