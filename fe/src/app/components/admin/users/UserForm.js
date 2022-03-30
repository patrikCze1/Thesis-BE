import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Typeahead } from "react-bootstrap-typeahead";

import {
  editUserAction,
  createUserAction,
} from "./../../../reducers/user/userReducer";

import { getRoles } from "../../../service/role.service";
import UserGroups from "./UserGroups";
import LoaderTransparent from "../../common/LoaderTransparent";
import Loader from "../../common/Loader";

export default function UserForm({ closeModal }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    roles: [{ label: t(`role.user`), value: "user" }],
    sex: "M",
  });
  const [isEdit, setIsEdit] = useState(false);
  const { user, error, processing, userLoading } = useSelector(
    (state) => state.userReducer
  );

  const roles = getRoles().map((role) => {
    return { value: role, label: t(`role.${role}`) };
  });

  useEffect(() => {
    if (user.id) {
      const userRoles = user.roles.map((role) => {
        return { label: t(`role.${role}`), value: role };
      });
      setFormData({ ...user, roles: userRoles });
      setIsEdit(true);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    console.log("formData", formData);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();

    if (user.id) {
      dispatch(
        editUserAction(user.id, {
          ...formData,
          roles: formData.roles.map((role) => role.value),
        })
      );
    } else {
      dispatch(
        createUserAction({
          ...formData,
          roles: formData.roles.map((role) => role.value),
        })
      );
    }
  };

  return (
    <div className="row">
      {!userLoading ? (
        <div className="col-md-12">
          <div className="card-body">
            <form
              className="forms-sample position-relative"
              onSubmit={handleSubmitForm}
            >
              {error && (
                <div role="alert" className="fade alert alert-danger show">
                  {error}
                </div>
              )}
              <div className="row">
                <div className="col-md-6">
                  <Form.Group>
                    <label htmlFor="firstName">
                      <Trans>First name</Trans>
                    </label>
                    <Form.Control
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder={t("First name")}
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group>
                    <label htmlFor="lastName">
                      <Trans>Last name</Trans>
                    </label>
                    <Form.Control
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder={t("Last name")}
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group>
                    <label htmlFor="email">
                      <Trans>Email</Trans>
                    </label>
                    <Form.Control
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      placeholder={t("Email")}
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group>
                    <label htmlFor="phone">
                      <Trans>Phone</Trans>
                    </label>
                    <Form.Control
                      type="phone"
                      className="form-control"
                      id="phone"
                      name="phone"
                      placeholder={t("Phone")}
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group>
                    <label htmlFor="position">
                      <Trans>Position</Trans>
                    </label>
                    <Form.Control
                      type="text"
                      className="form-control"
                      id="position"
                      name="position"
                      placeholder={t("Position")}
                      value={formData.position}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group>
                    <label htmlFor="username">
                      <Trans>Username</Trans>
                      <small className="ml-1">
                        (<Trans>user.usernameInfo</Trans>)
                      </small>
                    </label>
                    <Form.Control
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      placeholder={t("Username")}
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group>
                    <label htmlFor="">
                      <Trans>Gendre</Trans>
                    </label>
                    <select
                      name="sex"
                      value={formData.sex}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="M">{t("sex.male")}</option>
                      <option value="F">{t("sex.female")}</option>
                    </select>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group>
                    <label htmlFor="">
                      <Trans>Role</Trans>
                    </label>
                    <Typeahead
                      id="userRole"
                      options={roles}
                      name="roles"
                      selected={formData.roles}
                      onChange={(value) =>
                        handleInputChange({ target: { name: "roles", value } })
                      }
                      placeholder={t("user.role")}
                      multiple
                    />
                  </Form.Group>
                </div>
              </div>

              {!isEdit && (
                <div className="row">
                  <div className="col">
                    <Form.Group>
                      <label htmlFor="password">
                        <Trans>Password</Trans>
                      </label>
                      <Form.Control
                        type="text"
                        className="form-control"
                        id="password"
                        name="password"
                        placeholder={t("Password")}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary mr-2">
                <Trans>Save</Trans>
              </button>
              <button
                className="btn btn-light"
                type="button"
                onClick={closeModal}
              >
                <Trans>Cancel</Trans>
              </button>
            </form>
            {processing && <LoaderTransparent />}
          </div>
          {user.id && <UserGroups userId={user.id} />}
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
}
