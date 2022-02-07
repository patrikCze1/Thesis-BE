import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { Trans } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import i18n from "../../../i18n";
import { updateAction } from "../../reducers/user/currentUserReducer";
import Loader from "../common/Loader";
import Switch from "../common/Switch";

export default function UserProfileTabNotification() {
  const dispatch = useDispatch();
  const { user, actionProcessing } = useSelector(
    (state) => state.currentUserReducer
  );
  const [allowEmailNotifications, setAllowEmailNotifications] = useState(
    user.allowEmailNotification
  );
  console.log("user", user);
  const handleChange = () => {
    setAllowEmailNotifications(!allowEmailNotifications);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (allowEmailNotifications !== user.allowEmailNotification) {
      dispatch(
        updateAction({ allowEmailNotification: allowEmailNotifications })
      );
    }
  };

  return (
    <div className="media">
      <div className="media-body">
        <Form onSubmit={handleSubmit}>
          <div className="mb-3">
            <Switch
              label={i18n.t("notification.allowEmailNotifications")}
              value={allowEmailNotifications}
              name="allowEmailNotifications"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary mr-2"
            disabled={actionProcessing}
          >
            <Trans>label.save</Trans>
          </button>

          {actionProcessing && <Loader />}
        </Form>
      </div>
    </div>
  );
}
