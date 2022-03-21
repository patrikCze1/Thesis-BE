import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Form } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import axios from "./../../../utils/axios.config";
import Loader from "./../common/Loader";
import logo from "./../../../assets/images/logo_blue.svg";
import { ROUTE } from "../../../utils/enum";
import PasswordRepeat from "../common/PasswordRepeat";

export default function ResetPassword() {
  const [formData, setFormData] = useState({ password: "", passwordAgain: "" });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const { t } = useTranslation();

  const handleInput = (prop, val) => {
    setFormData({
      ...formData,
      [prop]: val,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordAgain) {
      setError(t("auth.passwordsNotEqual"));
      return;
    }
    setLoading(true);
    setError(false);

    const search = window.location.search;
    const params = new URLSearchParams(search);
    const token = params.get("token");

    try {
      await axios.post("/api/auth/reset-password", {
        password: formData.password,
        passwordAgain: formData.passwordAgain,
        token,
      });
      toast.success(t("auth.passwordChanged"));
      history.push(ROUTE.LOGIN);
    } catch (error) {
      setError(error?.response?.data?.message);
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

              <PasswordRepeat onInputChange={handleInput} data={formData} />

              <div className="mt-3">
                <button
                  className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                  type="submit"
                >
                  <Trans>label.change</Trans>
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
