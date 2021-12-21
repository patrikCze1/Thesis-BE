import React from "react";
import { useHistory, NavLink } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { Trans } from "react-i18next";

import { useDispatch } from "react-redux";

import logoMini from "./../../../assets/images/logo-mini.svg";
import SearchBar from "../search/SearchBar";
import { logoutAction } from "./../../reducers/user/currentUserReducer";
import NavigationNotifications from "./../notification/nav/NavigationNotifications";
import NavigationActiveTtrack from "../timeTrack/NavigationActiveTtrack";
import { routeEnum } from "../../enums/navigation/navigation";

export default function Navigation() {
  const history = useHistory();
  const dispatch = useDispatch();

  const toggleOffcanvas = () => {
    document.querySelector(".sidebar-offcanvas").classList.toggle("active");
  };

  const handleLogout = (e) => {
    e.preventDefault();

    dispatch(logoutAction(history));
  };

  const handleRedirect = (e, path) => {
    e.preventDefault();
    history.push(path);
  };

  return (
    <nav className="navbar col-lg-12 col-12 p-lg-0 fixed-top d-flex flex-row">
      <div className="navbar-menu-wrapper d-flex align-items-stretch justify-content-between">
        <NavLink
          className="navbar-brand brand-logo-mini align-self-center d-lg-none"
          to={routeEnum.HOME}
        >
          <img src={logoMini} alt="logo" />
        </NavLink>

        <button
          className="navbar-toggler navbar-toggler align-self-center mr-2"
          type="button"
          onClick={() => document.body.classList.toggle("sidebar-icon-only")}
        >
          <i className="mdi mdi-menu"></i>
        </button>
        <ul className="navbar-nav">
          <li className="nav-item navbar-dropdown-large">
            <NavigationNotifications />
          </li>
          <li className="nav-item navbar-dropdown-large nav-tracker">
            <NavigationActiveTtrack />
          </li>
          <li className="nav-item nav-search border-0 ml-1 ml-md-3 ml-lg-5 d-none d-md-flex">
            <SearchBar />
          </li>
        </ul>
        <ul className="navbar-nav navbar-nav-right">
          {/* <li className="nav-item d-none d-xl-flex border-0">
            <Dropdown>
              <Dropdown.Toggle className="nav-link count-indicator bg-transparent">
                <i className="mdi mdi-earth mr-2"></i> <Trans>English</Trans>
                &nbsp;
              </Dropdown.Toggle>
              <Dropdown.Menu className="preview-list navbar-dropdown">
                <Dropdown.Item
                  className="dropdown-item  preview-itemd-flex align-items-center"
                  href="!#"
                  onClick={(evt) => evt.preventDefault()}
                >
                  <Trans>French</Trans>
                </Dropdown.Item>
                <Dropdown.Item
                  className="dropdown-item preview-item d-flex align-items-center"
                  href="!#"
                  onClick={(evt) => evt.preventDefault()}
                >
                  <Trans>Spain</Trans>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </li> */}
          <li className="nav-item  nav-profile border-0">
            <Dropdown>
              <Dropdown.Toggle className="nav-link count-indicator bg-transparent">
                <span className="profile-name">
                  <i className="mdi mdi-account-circle"></i>
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="preview-list navbar-dropdown">
                <Dropdown.Item
                  className="dropdown-item preview-item d-flex align-items-center"
                  href="/profil"
                  onClick={(e) => handleRedirect(e, "/profil")}
                >
                  <i className="mdi mdi-account text-primary"></i>
                  <Trans>Profile</Trans>
                </Dropdown.Item>
                <Dropdown.Item
                  className="dropdown-item preview-item d-flex align-items-center"
                  href="/odhlasit"
                  onClick={handleLogout}
                >
                  <i className="mdi mdi-logout text-primary"></i>
                  <Trans>Logout</Trans>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </li>
        </ul>
        <button
          className="navbar-toggler navbar-toggler-right d-lg-none align-self-center"
          type="button"
          onClick={toggleOffcanvas}
        >
          <span className="mdi mdi-menu"></span>
        </button>
      </div>
    </nav>
  );
}
