import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import Particles from "react-particles-js";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { registerLocale } from "react-datepicker";
import Cookies from "js-cookie";
import cs from "date-fns/locale/cs"; // the locale you want

import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-quill/dist/quill.snow.css";

import AppRoutes from "./AppRoutes";
import { Sidebar, Navigation } from "./components/navigation";
import Footer from "./components/common/Footer";
import InfoBar from "./components/common/InfoBar";
import { loadFromSessionAction } from "./reducers/user/currentUserReducer";
import "./App.scss";
import { routeEnum } from "./enums/navigation/navigation";
import ErrorBoundary from "./../app/components/error/ErrorBoundary";
import axios from "./../utils/axios.config";
import { initIo } from "../utils/websocket.config";
import { SOCKET } from "../utils/enum";
import { socketNewNotification } from "./reducers/notification/notificationReducer";
import { loadMyTimeTracksAction } from "./reducers/timeTrack/timeTrack.reducer";

export default function App() {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { user } = useSelector((state) => state.currentUserReducer);

  registerLocale("cs", cs); // register it with the name you want

  useEffect(() => {
    if (loaded) {
      if (
        location.pathname === routeEnum.LOGIN ||
        location.pathname === routeEnum.FORGOTTEN_PASSWORD ||
        location.pathname === routeEnum.RESET_PASSWORD
      ) {
        setShowMenu(false);
        document
          .querySelector(".page-body-wrapper")
          .classList.add("full-page-wrapper");
      } else {
        setShowMenu(true);
        document
          .querySelector(".page-body-wrapper")
          .classList.remove("full-page-wrapper");
      }
    }
  }, [location]);

  //https://socket.io/docs/v4/
  const initWebsocket = () => {
    const socket = initIo();
    console.log("initWebsocket");
    if (socket) {
      socket.on(SOCKET.NOTIFICATION_NEW, (data) => {
        console.log("SOCKET.NOTIFICATION_NEW", data);
        dispatch(socketNewNotification(data.notification));
      });
      return () => socket.disconnect();
    }
  };

  useEffect(() => {
    dispatch(loadFromSessionAction());
    if (location.pathname !== routeEnum.TIME_TRACKS)
      dispatch(loadMyTimeTracksAction(null, null, false, true));
    setLoaded(true);
    initWebsocket();
    console.log("APP LOADED");

    // const interceptor = axios.interceptors.response.use(
    //   (response) => response,
    //   (error) => {
    //     const status = error.response ? error.response.status : null;
    //     const originalRequest = error.config;
    //     console.log("err status", status);
    //     console.log("originalRequest", originalRequest);
    //     if (
    //       status === 401 &&
    //       !originalRequest.url.includes("/api/auth/refresh") &&
    //       !originalRequest._retry
    //     ) {
    //       axios.interceptors.response.eject(interceptor);
    //       console.log("refresh");
    //       return axios
    //         .post(`/api/auth/refresh`)
    //         .then((res) => {
    //           console.log("res", res);
    //           originalRequest._retry = true;
    //           return axios(originalRequest);
    //         })
    //         .catch((e) => {
    //           console.log("e", e.response);
    //           window.localStorage.removeItem("app-user");
    //           Cookies.remove("Auth-Token");
    //           Cookies.remove("Refresh-Token");
    //           history.push(routeEnum.LOGIN);
    //           return Promise.reject(error);
    //         });
    //     }

    //     return Promise.reject(error);
    //   }
    // );
  }, []);

  useEffect(() => {
    console.log("APP user", user);
    if (user && Object.keys(user).length > 0) setShowMenu(true);
    else setShowMenu(false);
  }, [user]);

  if (!loaded) {
    return <></>;
  }

  if (showMenu) {
    return (
      <ErrorBoundary>
        <div className="container-scroller">
          <Navigation />
          <div className="container-fluid page-body-wrapper">
            <Sidebar />
            <div className="main-panel">
              <div className="content-wrapper">
                <AppRoutes />
                <InfoBar />
              </div>
              <Footer />
            </div>
          </div>

          <ToastContainer />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <div className="container-scroller">
      <ErrorBoundary>
        <Particles
          className="particles-background"
          params={{
            particles: {
              number: {
                value: 70,
              },
              size: {
                value: 3,
              },
              color: {
                value: "#373737",
              },
              line_linked: {
                color: "#282828",
              },
            },
          }}
        />

        <div className="container-fluid page-body-wrapper full-page-wrapper">
          <div className="main-panel">
            <div className="content-wrapper">
              <AppRoutes />
            </div>
            <Footer />
          </div>
        </div>

        <ToastContainer />
      </ErrorBoundary>
    </div>
  );
}
