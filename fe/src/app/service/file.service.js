export const getServerFileUrl = (path) => {
  return `${process.env.REACT_APP_BASE_API_URL}${path.slice(6)}`;
};
