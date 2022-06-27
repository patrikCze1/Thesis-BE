import axios from "axios";

const instace = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL,
  withCredentials: "omit",
  // headers: {
  // "access-control-allow-origin": "*",
  // "Content-Type": "application/json",
  // },
});

export default instace;
