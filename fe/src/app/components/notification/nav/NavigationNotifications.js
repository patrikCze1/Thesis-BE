import React, { useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { Trans } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { ROUTE } from "./../../../../utils/enum";
import {
  loadUnreadNotificationsAction,
  setSeenAction,
} from "../../../reducers/notification/notification.reducer";
import NavNotificationListItem from "./NavNotificationListItem";
import { createTaskRoute } from "../../../service/router.service";

export default function NavigationNotifications() {
  const dispatch = useDispatch();
  const history = useHistory();

  const { unreadCount, unreadNotifications } = useSelector(
    (state) => state.notificationReducer
  );

  useEffect(() => {
    dispatch(loadUnreadNotificationsAction());
  }, []);

  const handleNotificationClick = (e, notification) => {
    e.preventDefault();
    if (!notification.seen)
      dispatch(setSeenAction(notification.id, notification));
    if (notification.TaskNotification) {
      // window.location = `${ROUTE.PROJECTS}/${projectId}?ukol=${id}`;
      history.push(createTaskRoute(notification.TaskNotification.task));
    }
  };

  const navigateToNotifications = (e) => {
    e.preventDefault();
    history.push(ROUTE.NOTIFICATIONS);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle className="nav-link count-indicator border-0">
        <i className="mdi mdi-bell-outline"></i>
        {unreadCount > 0 && (
          <span className="count count-varient1">{unreadCount}</span>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu className="preview-list navbar-dropdown navbar-dropdown-large">
        <h6 className="p-3 mb-0 ">
          <Trans>Notifications</Trans>
        </h6>
        {unreadNotifications &&
          unreadNotifications.map((notification, i) => (
            <NavNotificationListItem
              key={i}
              notification={notification}
              onClick={(e) => handleNotificationClick(e, notification)}
            />
          ))}
        <Dropdown.Item
          className="dropdown-item preview-item d-flex align-items-center"
          href="!#"
          onClick={navigateToNotifications}
        >
          <p className="p-3 mb-0 ">
            <Trans>View all notifications</Trans>
          </p>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
