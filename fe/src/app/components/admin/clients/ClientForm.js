import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import {
  createClientAction,
  editClientAction,
} from "../../../reducers/common/clientReducer";
import Loader from "../../common/Loader";
import LoaderTransparent from "../../common/LoaderTransparent";

export default function ClientForm({ clientId }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: null,
    webpage: null,
    phones: [""],
    emails: [""],
  });

  const { client, clientLoading, processing } = useSelector(
    (state) => state.clientReducer
  );
  console.log("client, clientLoading", client, clientLoading);
  useEffect(() => {
    if (clientId && !clientLoading) {
      setFormData((prevState) => ({
        ...prevState,
        name: client.name,
        webpage: client.webpage,
        phones: client?.phones || [],
        emails: client?.emails || [],
      }));
      console.log("formData", formData);
    }
  }, [client]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log(formData);

    if (clientId || client?.id) {
      dispatch(editClientAction(clientId || client?.id, formData));
    } else {
      dispatch(createClientAction(formData));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePhoneInputChange = (e, i) => {
    let phones = formData.phones;
    phones[i] = e.target.value;
    setFormData({ ...formData, phones });
  };

  const handleEmailInputChange = (e, i) => {
    let emails = formData.emails;
    emails[i] = e.target.value;
    setFormData({ ...formData, emails });
  };

  function renderPhoneInputs() {
    return formData.phones.map((el, i) => (
      <div key={i} className="form-group">
        <div className="input-group">
          <input
            type="phone"
            value={el || ""}
            name={`phone[${i}]`}
            className="form-control"
            onChange={(e) => handlePhoneInputChange(e, i)}
          />
          <div className="input-group-append">
            <button
              onClick={(e) => handleRemovePhoneInput(i)}
              type="button"
              className="btn btn-danger btn-icon"
            >
              <i className="mdi mdi-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    ));
  }

  function renderEmailInputs() {
    return formData.emails.map((el, i) => (
      <div key={i} className="form-group">
        <div className="input-group">
          <input
            type="email"
            value={el || ""}
            name={`email[${i}]`}
            className="form-control"
            onChange={(e) => handleEmailInputChange(e, i)}
          />
          <div className="input-group-append">
            <button
              onClick={(e) => handleRemoveEmailInput(i)}
              type="button"
              className="btn btn-danger btn-icon"
            >
              <i className="mdi mdi-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    ));
  }

  const handleAddPhoneInput = () => {
    setFormData({ ...formData, phones: [...formData.phones, ""] });
  };

  const handleRemovePhoneInput = (i) => {
    let phones = formData.phones;
    phones.splice(i, 1);
    setFormData({ ...formData, phones });
  };

  const handleAddEmailInput = () => {
    setFormData({ ...formData, emails: [...formData.emails, ""] });
  };

  const handleRemoveEmailInput = (i) => {
    let emails = formData.emails;
    emails.splice(i, 1);
    setFormData({ ...formData, emails });
  };

  return (
    <div className="row">
      {clientLoading === false ? (
        <div className="col-md-12">
          <div className="card-body">
            <form
              onSubmit={handleFormSubmit}
              method="post"
              className="position-relative"
            >
              <div className="form-row">
                <div className="form-group col-md-12">
                  <label className="form-label" htmlFor="clientName">
                    <Trans>client.name</Trans>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder={t("client.name")}
                    defaultValue={formData.name}
                    name="name"
                    id="clientName"
                    className="form-control"
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-md-12">
                  <label className="form-label" htmlFor="clientWebpage">
                    <Trans>client.weburl</Trans>
                  </label>
                  <input
                    type="text"
                    placeholder={t("client.weburl")}
                    defaultValue={formData.webpage}
                    name="webpage"
                    id="clientWebpage"
                    className="form-control"
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-md-6">
                  <label className="form-label d-block">
                    <Trans>client.phone</Trans>
                  </label>
                  {renderPhoneInputs()}
                  <button
                    type="button"
                    className="btn btn-primary btn-rounded btn-icon btn-small"
                    onClick={handleAddPhoneInput}
                  >
                    <i className="mdi mdi-plus"></i>
                  </button>
                </div>

                <div className="form-group col-md-6">
                  <label className="form-label d-block">
                    <Trans>client.email</Trans>
                  </label>
                  {renderEmailInputs()}
                  <button
                    type="button"
                    className="btn btn-primary btn-rounded btn-icon btn-small"
                    onClick={handleAddEmailInput}
                  >
                    <i className="mdi mdi-plus"></i>
                  </button>
                </div>
              </div>

              <Button type="submit">
                {client?.id ? <Trans>Edit</Trans> : <Trans>label.create</Trans>}
              </Button>
            </form>
          </div>
          {processing && <LoaderTransparent />}
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
}
