import React, { useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { Form } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { ROUTE } from "../../../utils/enum.js";
import { Loader } from "../../components/common";

import logo from "./../../../assets/images/logo_blue.svg";

export default function Register() {
  const dispatch = useDispatch();

  const { user, actionProcessing } = useSelector(
    //@ts-ignore
    (state) => state.currentUserReducer
  );
  const [formData, setFormData] = useState({});
  // const [error, setError] = useState(false);

  const { t } = useTranslation();
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // dispatch(loginAction(formData.email, formData.password, history));
  };

  const handleInputChange = (e: React.SyntheticEvent) => {
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
            <h4>
              <Trans>auth.register</Trans>
            </h4>
            <Form className="pt-3" method="post" onSubmit={handleSubmit}>
              {/* {error && <span className="error-message">{error}</span>} */}
              <Form.Group className="d-flex search-field">
                <Form.Control
                  type="text"
                  name="email"
                  placeholder="E-mail"
                  size="lg"
                  className="h-auto"
                  required
                  onInput={handleInputChange}
                  autoComplete="on"
                />
              </Form.Group>
              <Form.Group className="d-flex search-field">
                <Form.Control
                  type="text"
                  name="phone"
                  placeholder={t("form.phone")}
                  size="lg"
                  className="h-auto"
                  required
                  onInput={handleInputChange}
                  autoComplete="on"
                />
              </Form.Group>
              <Form.Group className="d-flex search-field">
                <Form.Control
                  type="password"
                  name="password"
                  placeholder={t("form.password")}
                  size="lg"
                  className="h-auto"
                  required
                  onInput={handleInputChange}
                  autoComplete="on"
                />
              </Form.Group>
              <Form.Group className="d-flex search-field">
                <Form.Control
                  type="text"
                  name="name"
                  placeholder={t("form.name")}
                  size="lg"
                  className="h-auto"
                  required
                  onInput={handleInputChange}
                  autoComplete="on"
                />
              </Form.Group>
              <Form.Group className="d-flex search-field">
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
              </Form.Group>
              <div className="mt-3">
                <button
                  className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                  type="submit"
                >
                  <Trans>form.register</Trans>
                </button>
              </div>
              <div className="my-2 d-flex justify-content-between align-items-center">
                <NavLink to={ROUTE.LOGIN} className="auth-link text-black">
                  <Trans>auth.login</Trans>
                </NavLink>
              </div>

              {actionProcessing && <Loader cssClass={""} />}
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
