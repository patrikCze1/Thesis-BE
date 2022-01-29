import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Form } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import Loader from "./../common/Loader";
import logo from "./../../../assets/images/logo_blue.svg";
import { routeEnum } from "../../enums/navigation/navigation";
import axios from "./../../../utils/axios.config";

export default function ForgottenPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      await axios.post("/api/me/forgotten-password", {
        email,
      });
      toast.success(t("auth.emailSent"));
    } catch (error) {
      setError(error.response.data.message);
    }

    setLoading(false);
  };

  return (
    <div className="d-flex align-items-center auth px-0">
      <div className="row w-100 mx-0">
        <div className="col-lg-4 mx-auto">
          <div className="auth-form-light text-left py-5 px-4 px-sm-5">
            <div className="brand-logo text-center">
              <img src={logo} alt="logo" />
            </div>
            <h4>
              <Trans>auth.forgottenPassword</Trans>
            </h4>
            <Form className="pt-3" method="post" onSubmit={handleSubmit}>
              {error && <span className="error-message">{error}</span>}
              <Form.Group className="d-flex search-field">
                <Form.Control
                  type="email"
                  name="email"
                  placeholder={t("yourEmail")}
                  size="lg"
                  className="h-auto"
                  required
                  onInput={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              <div className="mt-3">
                <button
                  className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                  type="submit"
                >
                  <Trans>send</Trans>
                </button>
              </div>
              <div className="my-2 d-flex justify-content-between align-items-center">
                <NavLink to={routeEnum.LOGIN} className="auth-link text-black">
                  <Trans>goBack</Trans>
                </NavLink>
              </div>

              {loading && <Loader />}
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
