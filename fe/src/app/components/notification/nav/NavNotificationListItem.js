import React from "react";
import { Dropdown } from "react-bootstrap";
import { getShortName } from "../../../service/user/user.service";

export default function NavNotificationListItem({ notification, onClick }) {
  return (
    <Dropdown.Item
      className="dropdown-item preview-item d-flex align-items-center"
      onClick={onClick}
    >
      <div className="preview-thumbnail">
        <span className="text-avatar">
          {getShortName(notification.creator)}
        </span>
      </div>
      <div className="preview-item-content">
        <p className="mb-0">
          <span className="text-small text-muted">{notification.message}</span>
        </p>
      </div>
    </Dropdown.Item>
  );
}
