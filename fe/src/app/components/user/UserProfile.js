import React, { useState } from "react";
import { Col, Row, Nav, Tabs, Tab } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { getFullName } from "../../service/user/user.service";

import { changePasswordAction } from "./../../reducers/user/currentUserReducer";

import Loader from "./../common/Loader";

export default function UserProfile() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [passwordFormData, setPasswordFormData] = useState({});
  const [error, setError] = useState(null);
  const { actionProcesing, user } = useSelector(
    (state) => state.currentUserReducer
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError(null);

    passwordFormData[name] = value;
    setPasswordFormData(passwordFormData);

    // setPasswordFormData({
    //   ...passwordFormData,
    //   [name]: value,
    // })
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();

    if (!passwordFormData.password || !passwordFormData.passwordAgain) {
      setError(t("Passwords do not match"));
    } else if (passwordFormData.password !== passwordFormData.passwordAgain) {
      setError(t("Passwords do not match"));
    } else {
      dispatch(changePasswordAction(passwordFormData));
      setPasswordFormData({});
    }
  };

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
            <Tabs defaultActiveKey={t("Profile")} id="uncontrolled-tab-example">
              <Tab
                eventKey={t("Profile")}
                title={t("Profile")}
                className="test-tab"
              >
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
              <Tab eventKey={t("Settings")} title={t("Settings")}>
                <div className="media">
                  <div className="media-body">
                    <h4 className="mt-0">
                      <Trans>Change password</Trans>
                    </h4>
                    <form onSubmit={handleSubmitPassword}>
                      {error && (
                        <div
                          role="alert"
                          className="fade alert alert-danger show"
                        >
                          {error}
                        </div>
                      )}
                      <div className="form-group">
                        <label for="password">
                          <Trans>Password</Trans>
                        </label>
                        <input
                          placeholder={t("Password")}
                          type="password"
                          name="password"
                          id="password"
                          className="form-control form-control-lg"
                          onChange={handleInputChange}
                          value={passwordFormData.password}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label for="passwordAgain">
                          <Trans>Password again</Trans>
                        </label>
                        <input
                          placeholder={t("Password again")}
                          type="password"
                          name="passwordAgain"
                          id="passwordAgain"
                          className="form-control form-control-lg"
                          onChange={handleInputChange}
                          value={passwordFormData.passwordAgain}
                          required
                        />
                      </div>

                      <button type="submit" className="btn btn-primary mr-2">
                        <Trans>Change</Trans>
                      </button>

                      {actionProcesing && <Loader />}
                    </form>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
