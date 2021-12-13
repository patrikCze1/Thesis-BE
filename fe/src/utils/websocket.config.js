import io from "socket.io-client";
console.log("connect to socket");
let instance = null;
export const initIo = () => {
  instance = io(process.env.REACT_APP_BASE_API_URL, {
    query: {
      userId: window.localStorage.getItem("app-user")
        ? JSON.parse(window.localStorage.getItem("app-user")).id
        : null,
    },
    // withCredentials: true,
    // extraHeaders: {
    //   "my-custom-header": "abcd"
    // }
  });
  return instance;
};

export const getIo = () => instance;
