import React, { useState, useEffect, forwardRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Collapse } from "react-bootstrap";
import { Trans } from "react-i18next";
import { useSelector } from "react-redux";

import logo from "./../../../assets/images/logo_blue.svg";
import logoSmall from "./../../../assets/images/logo_blue_small.svg";
import { getFullName, getShortName } from "./../../service/user/user.service";
import { routeEnum } from "../../enums/navigation/navigation";
import { hasRole } from "../../service/role.service";
import { ROLES } from "../../../utils/enum";

const Sidebar = forwardRef(({}, ref) => {
  let location = useLocation();
  const [menuOpen, setMenuOpen] = useState({});
  const { user: currentUser } = useSelector(
    (state) => state.currentUserReducer
  );

  const toggleMenu = (menuItem) => {
    if (menuOpen[menuItem]) {
      setMenuOpen({ [menuItem]: false });
    } else if (Object.keys(menuOpen).length === 0) {
      setMenuOpen({ [menuItem]: true });
    } else {
      Object.keys(menuOpen).forEach((i) => {
        setMenuOpen({ [i]: false });
      });
      setMenuOpen({ [menuItem]: true });
    }
  };

  const isPathActive = (path) => {
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const body = document.querySelector("body");
    document.querySelectorAll(".sidebar .nav-item").forEach((el) => {
      el.addEventListener("mouseover", function () {
        if (body.classList.contains("sidebar-icon-only")) {
          el.classList.add("hover-open");
        }
      });
      el.addEventListener("mouseout", function () {
        if (body.classList.contains("sidebar-icon-only")) {
          el.classList.remove("hover-open");
        }
      });
    });
  }, []);

  useEffect(() => {
    Object.keys(menuOpen).forEach((i) => {
      setMenuOpen({ [i]: false });
    });

    const dropdownPaths = [{ path: "/administrace", state: "admin" }];

    dropdownPaths.forEach((obj) => {
      if (isPathActive(obj.path)) {
        setMenuOpen({ [obj.state]: true });
      }
    });
    document.querySelector(".sidebar-offcanvas").classList.remove("active");
  }, [location]);

  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar" ref={ref}>
      <div className="text-center sidebar-brand-wrapper d-flex align-items-center">
        <NavLink className="sidebar-brand brand-logo" to={routeEnum.HOME}>
          <img src={logo} alt="logo" />
        </NavLink>
        <NavLink
          className="sidebar-brand brand-logo-mini pl-4 pt-3"
          to={routeEnum.HOME}
        >
          <img src={logoSmall} alt="logo" />
        </NavLink>
      </div>
      <ul className="nav">
        <li className="nav-item nav-profile">
          <span className="nav-link">
            <div className="nav-profile-image">
              <span className="text-avatar">
                <span>{getShortName(currentUser)}</span>
              </span>
              <span className="login-status online"></span>
            </div>
            <div className="nav-profile-text d-flex align-items-center">
              <div className="pr-3">
                <div className="font-weight-medium mb-2">
                  {getFullName(currentUser)}
                </div>
                <div>{currentUser?.position}</div>
              </div>
            </div>
          </span>
        </li>
        <li
          className={
            isPathActive(routeEnum.HOME) ? "nav-item active" : "nav-item"
          }
        >
          <NavLink className="nav-link" to={routeEnum.HOME}>
            <i className="mdi mdi-home menu-icon"></i>
            <span className="menu-title">
              <Trans>Dashboard</Trans>
            </span>
          </NavLink>
        </li>
        <li
          className={
            isPathActive(routeEnum.PROJECTS) ? "nav-item active" : "nav-item"
          }
        >
          <NavLink className="nav-link" to={routeEnum.PROJECTS}>
            <i className="mdi mdi-format-list-bulleted menu-icon"></i>
            <span className="menu-title">
              <Trans>Projects</Trans>
            </span>
          </NavLink>
        </li>

        {hasRole(ROLES.ADMIN, currentUser.roles) && (
          <li
            className={
              isPathActive("/administrace") ? "nav-item active" : "nav-item"
            }
          >
            <div
              className={
                menuOpen == "admin" ? "nav-link menu-expanded" : "nav-link"
              }
              onClick={() => toggleMenu("admin")}
              data-toggle="collapse"
            >
              <i className="mdi mdi-security menu-icon"></i>
              <span className="menu-title">
                <Trans>Administration</Trans>
              </span>
              <i className="menu-arrow mdi mdi-security"></i>
            </div>
            <Collapse in={menuOpen.admin}>
              <ul className="nav flex-column sub-menu">
                <li className="nav-item subitem">
                  <NavLink
                    className={
                      isPathActive("/administrace/klienti")
                        ? "nav-link active"
                        : "nav-link"
                    }
                    to="/administrace/klienti"
                  >
                    <Trans>Clients</Trans>
                  </NavLink>
                </li>
                <li className="nav-item subitem">
                  <NavLink
                    className={
                      isPathActive(routeEnum.ADMIN_USER)
                        ? "nav-link active"
                        : "nav-link"
                    }
                    to={routeEnum.ADMIN_USER}
                  >
                    <Trans>Users</Trans>
                  </NavLink>
                </li>
                <li className="nav-item subitem">
                  <NavLink
                    className={
                      isPathActive("/administrace/skupiny")
                        ? "nav-link active"
                        : "nav-link"
                    }
                    to="/administrace/skupiny"
                  >
                    <Trans>Groups</Trans>
                  </NavLink>
                </li>
              </ul>
            </Collapse>
          </li>
        )}
        <li
          className={
            isPathActive(routeEnum.TIME_TRACKS) ? "nav-item active" : "nav-item"
          }
        >
          <div
            className={
              menuOpen == "admin" ? "nav-link menu-expanded" : "nav-link"
            }
            onClick={() => toggleMenu("tracking")}
            data-toggle="collapse"
          >
            <i className="mdi mdi-timer menu-icon"></i>
            <span className="menu-title">
              <Trans>menu.timeTracks</Trans>
            </span>
            <i className="menu-arrow mdi mdi-timer"></i>
          </div>
          <Collapse in={menuOpen.tracking}>
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <NavLink
                  className={
                    isPathActive(routeEnum.TIME_TRACKS)
                      ? "nav-link active"
                      : "nav-link"
                  }
                  to={routeEnum.TIME_TRACKS}
                >
                  <span className="menu-title subitem">
                    <Trans>menu.tracking</Trans>
                  </span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className={
                    isPathActive(routeEnum.TIME_TRACKS_REPORT)
                      ? "nav-link active"
                      : "nav-link"
                  }
                  to={routeEnum.TIME_TRACKS_REPORT}
                >
                  <span className="menu-title subitem">
                    <Trans>menu.report</Trans>
                  </span>
                </NavLink>
              </li>
            </ul>
          </Collapse>
        </li>

        <li
          className={
            isPathActive(routeEnum.TODO) ? "nav-item active" : "nav-item"
          }
        >
          <NavLink className="nav-link" to={routeEnum.TODO}>
            <i className="mdi mdi-playlist-check menu-icon"></i>
            <span className="menu-title">
              <Trans>menu.myTodos</Trans>
            </span>
          </NavLink>
        </li>

        <li
          className={
            isPathActive(routeEnum.NOTIFICATIONS)
              ? "nav-item active"
              : "nav-item"
          }
        >
          <NavLink className="nav-link" to={routeEnum.NOTIFICATIONS}>
            <i className="mdi mdi-bell-ring menu-icon"></i>
            <span className="menu-title">
              <Trans>Notifications</Trans>
            </span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
});
export default Sidebar;
