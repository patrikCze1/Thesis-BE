import io from "socket.io-client";
import { parseUserFromJwt } from "../app/service/user/user.service";

let instance = null;
export const initIo = () => {
  try {
    console.log("connect to socket");
    const token = parseUserFromJwt();
    if (!token) {
      throw new Error("User not loged in");
    }

    console.log("token", token);
    instance = io(process.env.REACT_APP_BASE_API_URL, {
      query: {
        userId: token.user?.id || null,
      },
      // withCredentials: true,
      // extraHeaders: {
      //   "my-custom-header": "abcd"
      // }
    });
    return instance;
  } catch (error) {
    console.error("init io error", error);
    return null;
  }
};

export const getIo = () => instance;
