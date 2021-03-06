import React, { useState, useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import Particles from "react-particles-js";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { registerLocale } from "react-datepicker";
import cs from "date-fns/locale/cs"; // the locale you want

import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-quill/dist/quill.snow.css";
import "./App.scss";

import logo from "./../assets/images/logo_blue.svg";
import AppRoutes from "./router/AppRoutes";
import { Sidebar, Navigation } from "./components/navigation";
import Footer from "./components/common/Footer";
import InfoBar from "./components/common/InfoBar";
import {
  loadFromSessionAction,
  logoutAction,
} from "./reducers/user/currentUserReducer";
import ErrorBoundary from "./../app/components/error/ErrorBoundary";
import axios from "./../utils/axios.config";
import { initIo } from "../utils/websocket.config";
import { SOCKET, ROUTE } from "./../utils/enum";
import { socketNewNotification } from "./reducers/notification/notification.reducer";
import {
  loadMyTimeTracksAction,
  socketStopTimeTrackAction,
} from "./reducers/timeTrack/timeTrack.reducer";
import i18n from "../i18n";

export default function App() {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { user } = useSelector((state) => state.currentUserReducer);
  const sidebarRef = useRef(null);

  registerLocale("cs", cs); // register it with the name you want

  useEffect(() => {
    if (loaded) {
      if (
        location.pathname === ROUTE.LOGIN ||
        location.pathname === ROUTE.FORGOTTEN_PASSWORD ||
        location.pathname === ROUTE.RESET_PASSWORD
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

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      const sidebar = document.querySelector(".sidebar-offcanvas");
      if (sidebar?.classList?.contains("active"))
        sidebar.classList.remove("active");
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, false);
    return () => {
      document.removeEventListener("click", handleClickOutside, false);
    };
  }, []);

  //https://socket.io/docs/v4/
  const initWebsocket = () => {
    const socket = initIo();
    console.log("initWebsocket", socket);
    if (socket) {
      socket.on(SOCKET.NOTIFICATION_NEW, (data) => {
        console.log("SOCKET.NOTIFICATION_NEW", data);
        dispatch(socketNewNotification(data.notification));
      });
      socket.on(SOCKET.TIME_TRACK_STOP, (data) => {
        dispatch(socketStopTimeTrackAction(data.id));
      });
      socket.on("connect", () => {
        console.log("initWebsocket socket connected");
      });
      socket.on("error", function (err) {
        console.log("connect failed" + err);
      });
    }
    return socket;
  };

  useEffect(() => {
    dispatch(loadFromSessionAction());

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        const originalRequest = error.config;
        console.log("err status", status);
        console.log("originalRequest", originalRequest);
        if (
          status === 401 &&
          !originalRequest.url.includes("/api/auth/refresh") &&
          !originalRequest._retry
        ) {
          // axios.interceptors.response.eject(interceptor);
          console.log("refresh");
          return axios
            .post(`/api/auth/refresh`)
            .then((res) => {
              console.log("res", res);
              originalRequest._retry = true;
              return axios(originalRequest);
            })
            .catch((e) => {
              console.error("e", e);
              dispatch(logoutAction(history));
              return Promise.reject(e);
            });
        }

        return Promise.reject(error);
      }
    );

    console.log("APP LOADED");

    //return interceptor
  }, []);

  useEffect(() => {
    console.log("APP user", user);
    if (user && Object.keys(user).length > 0) {
      const socket = initWebsocket();
      setShowMenu(true);
      if (location.pathname !== ROUTE.TIME_TRACKS)
        dispatch(loadMyTimeTracksAction(0, 0, false, true));

      if (socket) return () => socket.disconnect();
    } else setShowMenu(false);
    setLoaded(true);
  }, [user]);

  if (!loaded) {
    return (
      <div className="fullscreen-logo-wrapper">
        <img src={logo} alt={i18n.t("app.title")} />
      </div>
    );
  }

  if (showMenu) {
    return (
      <ErrorBoundary>
        <div className="container-scroller">
          <Navigation />
          <div className="container-fluid page-body-wrapper">
            <Sidebar ref={sidebarRef} />
            <div className="main-panel">
              <div className="content-wrapper">
                <AppRoutes />
                <InfoBar />
              </div>
              <Footer />
            </div>
          </div>

          <ToastContainer position="bottom-right" />
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

        <ToastContainer position="bottom-right" />
      </ErrorBoundary>
    </div>
  );
}
