import React from "react";
import { Tabs, Tab } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getFullName } from "../../service/user/user.service";
import UserProfileTabNotification from "./UserProfileTabNotification";

import UserProfileTabSettings from "./UserProfileTabSettings";

export default function UserProfile() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.currentUserReducer);

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="page-header">
          <h4>
            <Trans>menu.userProfile</Trans>
          </h4>
        </div>
        <div className="card">
          <div className="card-body">
            <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
              <Tab eventKey={1} title={t("Profile")} className="test-tab">
                <div className="media">
                  <div className="media-body">
                    <h4 className="mt-0 mb-3">{getFullName(user)}</h4>
                    <p>
                      <strong>{t("user.email")}:</strong> {user.email}
                      <br />
                      <strong>{t("user.phone")}:</strong> {user.phone}
                      <br />
                      <strong>{t("user.position")}:</strong> {user.position}
                      <br />
                    </p>
                  </div>
                </div>
              </Tab>
              <Tab eventKey={2} title={t("Settings")}>
                <UserProfileTabSettings />
              </Tab>
              <Tab eventKey={3} title={t("user.notifications")}>
                <UserProfileTabNotification />
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
