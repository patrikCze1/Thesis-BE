import io from "socket.io-client";
console.log("connect to socket");
let instance = null;
export const initIo = () => {
  try {
    const itemStr = window.localStorage.getItem("app-user");
    if (!itemStr) return;

    const item = JSON.parse(itemStr);
    const now = new Date();
    if (!item.expiry || now.getTime() > item.expiry) {
      return;
    }

    instance = io(process.env.REACT_APP_BASE_API_URL, {
      query: {
        userId: item.value ? item.value.id : null,
      },
      // withCredentials: true,
      // extraHeaders: {
      //   "my-custom-header": "abcd"
      // }
    });
    return instance;
  } catch (error) {
    return null;
  }
};

export const getIo = () => instance;
