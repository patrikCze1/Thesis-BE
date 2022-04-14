export const getServerFileUrl = (path) => {
  if (process.env.NODE_ENV === "production")
    return `${process.env.REACT_APP_BASE_API_URL_PROD}${path.slice(6)}`;
  return `${process.env.REACT_APP_BASE_API_URL}${path.slice(6)}`;
};
