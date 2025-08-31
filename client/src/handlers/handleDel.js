import axios from "axios";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

export const handleDel = async (
  id,
  name,
  endpoint,
  list,
  setNewList,
  setIsLoading,
  setAlertMessage,
  setAlertFlag
) => {
  const firstConfirmation = window.confirm(
    `Are you sure you want to delete this ${name}?`
  );
  if (!firstConfirmation) return;

  const secondConfirmation = window.confirm(
    "This action cannot be undone. Do you want to proceed?"
  );
  if (!secondConfirmation) return;

  setIsLoading(true);
  const bodyId = `${name}Id`;
  const itemId = `${name}_id`;

  try {
    await axios.delete(`${backEndUrl}${endpoint}`, {
      data: { [bodyId]: id },
    });

    setNewList(list.filter((item) => item[itemId] !== id));

    setIsLoading(false);
    setAlertMessage(`✅ ${name} deleted successfully!`);
    setAlertFlag(true);

    setTimeout(() => {
      setAlertFlag(false);
    }, 2200);
  } catch (err) {
    console.log(err);
    setIsLoading(false);
    setAlertMessage(
      err?.response?.data?.message || `⚠️ Error deleting the ${name}`
    );
    setAlertFlag(true);

    setTimeout(() => {
      setAlertFlag(false);
    }, 2200);
  }
};
