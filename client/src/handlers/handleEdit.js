export const handleEdit = (state, path, navigate) => {
  navigate(`/${path}`, {
    state: { state },
  });
};
