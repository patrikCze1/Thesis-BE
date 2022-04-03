import { io } from "socket.io-client";
import { parseUserFromStorage } from "../app/service/user/user.service";

let instance = null;
export const initIo = () => {
  try {
    console.log("init socket");
    const user = parseUserFromStorage();
    if (!user) {
      throw new Error("User not loged in");
    }

    // console.log("user", user);
    // console.log(
    //   "process.env.REACT_APP_BASE_API_URL",
    //   process.env.REACT_APP_BASE_API_URL
    // );
    instance = io(process.env.REACT_APP_BASE_API_URL, {
      query: {
        userId: user?.id || null,
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
    });

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
