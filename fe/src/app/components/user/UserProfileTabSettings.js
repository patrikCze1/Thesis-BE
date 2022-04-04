import React from "react";
import { Trans } from "react-i18next";
import { useSelector } from "react-redux";

import PasswordRepeat from "../common/PasswordRepeat";
import { useChangePassword } from "../../hooks/user";
import { LoaderTransparent } from "../common";

export default function UserProfileTabSettings() {
  const { actionProcessing } = useSelector((state) => state.currentUserReducer);
  const { error, handleInputChange, handleSubmitPassword, passwordFormData } =
    useChangePassword();
  console.log("actionProcesing", actionProcessing);
  return (
    <div className="media">
      <div className="media-body position-relative">
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
        </form>
        {actionProcessing && <LoaderTransparent />}
      </div>
    </div>
  );
}
