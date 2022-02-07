import React from "react";
import { Trans } from "react-i18next";
import { useSelector } from "react-redux";
import { useChangePassword } from "../../hooks/User";

import PasswordRepeat from "../common/PasswordRepeat";
import Loader from "./../common/Loader";

export default function UserProfileTabSettings() {
  const { actionProcesing } = useSelector((state) => state.currentUserReducer);
  const { error, handleInputChange, handleSubmitPassword, passwordFormData } =
    useChangePassword();

  return (
    <div className="media">
      <div className="media-body">
        <h4 className="mt-0">
          <Trans>Change password</Trans>
        </h4>
        <form onSubmit={handleSubmitPassword}>
          {error && (
            <div role="alert" className="fade alert alert-danger show">
              {error}
            </div>
          )}

          <PasswordRepeat
            onInputChange={handleInputChange}
            data={passwordFormData}
          />

          <button type="submit" className="btn btn-primary mr-2">
            <Trans>Change</Trans>
          </button>

          {actionProcesing && <Loader />}
        </form>
      </div>
    </div>
  );
}
