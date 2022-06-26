import React, { useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { Form } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import axios from "./../../../utils/axios.config";
import { ROUTE } from "../../../utils/enum.js";
import { Loader } from "../../components/common";

import logo from "./../../../assets/images/logo_blue.svg";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  name: string;
};
const initState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  name: "",
};

export default function Register() {
  const { user } = useSelector(
    //@ts-ignore
    (state) => state.currentUserReducer
  );
  const [formData, setFormData] = useState<FormData>(initState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { t } = useTranslation();
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("api/companies", formData);
      toast.success(t("auth.registrationSuccess") as string);
      setFormData(initState);
      setRegistrationSuccess(true);
    } catch (error) {
      console.error("error", error);
      setErrorMessage(error.response?.data?.message);
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.SyntheticEvent) => {
    setErrorMessage(null);
    const { name, value } = e.target as HTMLInputElement;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      history.push(ROUTE.HOME);
    }
  }, []);

  return (
    <div className="d-flex align-items-center auth px-0">
      <div className="row w-100 mx-0">
        <div className="col-10 mx-auto">
          <div className="auth-form-light text-left py-5 px-4 px-sm-5">
            <div className="brand-logo text-center">
              <img src={logo} alt="logo" />
            </div>
            {!registrationSuccess ? (
              <>
                <h4>
                  <Trans>auth.register</Trans>
                </h4>

                <Form className="pt-3" method="post" onSubmit={handleSubmit}>
                  {errorMessage && (
                    <span className="error-message">{errorMessage}</span>
                  )}
                  <div className="row">
                    <Form.Group className="col-md-6">
                      <Form.Control
                        type="text"
                        name="firstName"
                        placeholder={t("form.firstName")}
                        size="lg"
                        className="h-auto"
                        required
                        onInput={handleInputChange}
                        autoComplete="on"
                        value={formData.firstName || ""}
                      />
                    </Form.Group>
                    <Form.Group className="col-md-6">
                      <Form.Control
                        type="text"
                        name="lastName"
                        placeholder={t("form.lastName")}
                        size="lg"
                        className="h-auto"
                        required
                        onInput={handleInputChange}
                        autoComplete="on"
                        value={formData.lastName || ""}
                      />
                    </Form.Group>
                    <Form.Group className="col-md-6">
                      <Form.Control
                        type="text"
                        name="email"
                        placeholder="E-mail"
                        size="lg"
                        className="h-auto"
                        required
                        onInput={handleInputChange}
                        autoComplete="on"
                        value={formData.email || ""}
                      />
                    </Form.Group>

                    <Form.Group className="col-md-6">
                      <Form.Control
                        type="text"
                        name="phone"
                        placeholder={t("form.phone")}
                        size="lg"
                        className="h-auto"
                        required
                        onInput={handleInputChange}
                        autoComplete="on"
                        value={formData.phone || ""}
                      />
                    </Form.Group>
                    <Form.Group className="col-md-6">
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder={t("form.password")}
                        size="lg"
                        className="h-auto"
                        required
                        onInput={handleInputChange}
                        value={formData.password || ""}
                      />
                    </Form.Group>
                    <Form.Group className="col-md-6">
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder={t("form.companyName")}
                        size="lg"
                        className="h-auto"
                        required
                        onInput={handleInputChange}
                        autoComplete="on"
                        value={formData.name || ""}
                      />
                    </Form.Group>
                    {/* <Form.Group className="col-md-6">
                  <Form.Control
                    type="text"
                    name="companyId"
                    placeholder={t("form.companyId")}
                    size="lg"
                    className="h-auto"
                    required
                    onInput={handleInputChange}
                    autoComplete="on"
                  />
                </Form.Group> */}

                    <div className="col-12">
                      <div className="mt-3">
                        <button
                          className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                          type="submit"
                          disabled={loading}
                        >
                          <Trans>form.register</Trans>
                        </button>
                      </div>
                      <div className="my-2 d-flex justify-content-between align-items-center">
                        <NavLink
                          to={ROUTE.LOGIN}
                          className="auth-link text-black text-center"
                        >
                          <Trans>auth.login</Trans>
                        </NavLink>
                      </div>
                    </div>
                  </div>
                  {loading && <Loader cssClass={""} />}
                </Form>
              </>
            ) : (
              <div>
                <h4 className="text-center">
                  <Trans>auth.registrationSuccess</Trans>
                </h4>
                <p className="text-center">
                  <Trans>auth.registrationSuccessMsg</Trans>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
