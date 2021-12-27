import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import {
  getMonthDayTime,
  getStringDiffAgo,
} from "../../service/date/date.service";
import { getFullName, getShortName } from "../../service/user/user.service";

export default function NotificationListItem({
  notification,
  setSeen,
  onClick,
}) {
  return (
    <div
      className={`list d-flex align-items-center border-bottom p-3 notification-row ${
        notification.seen ? "" : "unread"
      }`}
    >
      <button
        type="button"
        className="btn btn-info btn-rounded btn-small btn-icon mr-2"
        onClick={setSeen}
      >
        {notification.seen ? (
          <i className="mdi mdi-eye-off"></i>
        ) : (
          <i className="mdi mdi-eye"></i>
        )}
      </button>
      <OverlayTrigger
        overlay={
          <Tooltip id="tooltip-disabled">
            {getFullName(notification.creator)}
          </Tooltip>
        }
      >
        <span className="text-avatar">
          {getShortName(notification.creator)}
        </span>
      </OverlayTrigger>

      <div className="wrapper w-100 ml-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <p className="mb-0">
              <a href="#" onClick={onClick}>
                {notification.message}
              </a>
            </p>
          </div>
          <small className="text-muted ml-auto">
            {getMonthDayTime(notification.createdAt)} (
            {getStringDiffAgo(notification.createdAt)})
          </small>
        </div>
      </div>
    </div>
  );
}
