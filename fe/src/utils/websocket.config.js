import { io } from "socket.io-client";
import { parseUserFromStorage } from "../app/service/user/user.service.js";

let instance = null;
export const initIo = () => {
  try {
    console.log("init socket");
    const user = parseUserFromStorage();
    if (!user) {
      throw new Error("User not loged in");
    }

    instance = io(
      process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_BASE_API_URL_PROD
        : process.env.REACT_APP_BASE_API_URL,
      {
        query: {
          userId: user?.id || null,
          ck: user.ck || null,
        },
        // withCredentials: true,
        // extraHeaders: {
        //   "my-custom-header": "abcd"
        // }
        reconnection: true,
        // reconnectionDelay: 1000,
        // reconnectionDelayMax: 5000,
        // reconnectionAttempts: Infinity,
        forceNew: true,
        // secure: true,
      }
    );

    return instance;
  } catch (error) {
    console.error("init io error", error);
    return null;
  }
};

export const getIo = () => {
  console.log("getSocket");
  // if (instance) instance.connect();
  return instance;
};
