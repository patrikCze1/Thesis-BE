import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Form } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import axios from "./../../../utils/axios.config";
import Loader from "./../common/Loader";
import logo from "./../../../assets/images/logo.svg";
import { routeEnum } from "../../enums/navigation/navigation";

export default function ResetPassword() {
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const { t } = useTranslation();

  const handleInput = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password1 !== formData.password2) {
      setError(t("auth.passwordsNotEqual"));
      return;
    }
    setLoading(true);
    setError(false);

    const search = window.location.search;
    const params = new URLSearchParams(search);
    const token = params.get("token");

    try {
      await axios.post("/api/me/reset-password", {
        password: formData.password1,
        token,
      });
      toast.success(t("auth.passwordChanged"));
      history.push(routeEnum.LOGIN);
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
              <Trans>auth.resetPassword</Trans>
            </h4>
            <Form className="pt-3" method="post" onSubmit={handleSubmit}>
              {error && <span className="error-message">{error}</span>}
              <Form.Group className="d-flex search-field">
                <Form.Control
                  type="password"
                  name="password1"
                  placeholder={t("password")}
                  size="lg"
                  className="h-auto"
                  required
                  onInput={handleInput}
                />
              </Form.Group>
              <Form.Group className="d-flex search-field">
                <Form.Control
                  type="password"
                  name="password2"
                  placeholder={t("passwordAgain")}
                  size="lg"
                  className="h-auto"
                  required
                  onInput={handleInput}
                />
              </Form.Group>

              <div className="mt-3">
                <button
                  className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                  type="submit"
                >
                  <Trans>change</Trans>
                </button>
              </div>

              {loading && <Loader />}
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
