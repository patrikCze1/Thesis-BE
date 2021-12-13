import axios from "axios";

const baseURL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_BASE_API_URL_PROD
    : process.env.REACT_APP_BASE_API_URL;

const instace = axios.create({
  baseURL,
  withCredentials: "omit",
  // headers: {
  // "access-control-allow-origin": "*",
  // "Content-Type": "application/json",
  // },
});

export default instace;
