endpoint, successMessage;

submit
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
