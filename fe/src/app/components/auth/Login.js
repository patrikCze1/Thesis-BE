import React, { useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { Form } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import axios from "./../../../utils/axios.config";
import Loader from "./../common/Loader";
import { loadCurrentUserAction } from "./../../reducers/user/currentUserReducer";
import logo from "./../../../assets/images/logo_blue.svg";
import { ROUTE } from "../../../utils/enum";
import { initIo } from "../../../utils/websocket.config";

export default function Login() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.currentUserReducer);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const history = useHistory();

  // useEffect(() => {
  //     const getCsrfToken = async () => {
  //       const { data } = await axios.get(`${process.env.REACT_APP_BASE_API_URL}/api/auth/csrf-token`);
  //       axios.defaults.headers.post['X-CSRF-Token'] = data.csrfToken;
  //      };
  //     getCsrfToken();
  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await axios.post(
        `/api/auth/login`,
        { ...formData },
        {
          auth: {
            username: formData.email,
            password: formData.password,
          },
        }
      );

      if (res?.status === 200) {
        setLoading(false);
        dispatch(loadCurrentUserAction(res.data));
        console.log(res);
        initIo();

        history.push(ROUTE.HOME);
      }
    } catch (err) {
      console.error("login err ", err);
      if (err?.response?.status === 400) {
        setError(t("Invalid credentials"));
      } else {
        setError(t("Can not login"));
      }
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

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
        <div className="col-lg-4 mx-auto">
          <div className="auth-form-light text-left py-5 px-4 px-sm-5">
            <div className="brand-logo text-center">
              <img src={logo} alt="logo" />
            </div>
            <h4>
              <Trans>Login</Trans>
            </h4>
            <Form className="pt-3" method="post" onSubmit={handleSubmit}>
              {error && <span className="error-message">{error}</span>}
              <Form.Group className="d-flex search-field">
                <Form.Control
                  type="text"
                  name="email"
                  placeholder="E-mail"
                  size="lg"
                  className="h-auto"
                  required
                  onInput={(e) => handleInputChange(e)}
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
                  onInput={(e) => handleInputChange(e)}
                  autoComplete="on"
                />
              </Form.Group>
              <div className="mt-3">
                <button
                  className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                  type="submit"
                >
                  <Trans>Login</Trans>
                </button>
              </div>
              <div className="my-2 d-flex justify-content-between align-items-center">
                {/* <div className="form-check">
                    <label className="form-check-label text-muted">
                      <input type="checkbox" className="form-check-input" />
                      <i className="input-helper"></i>
                      Keep me signed in
                    </label>
                  </div> */}
                <NavLink
                  to={ROUTE.FORGOTTEN_PASSWORD}
                  className="auth-link text-black"
                >
                  <Trans>Forgot password</Trans>?
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
