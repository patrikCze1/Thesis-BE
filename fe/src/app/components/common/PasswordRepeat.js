import React from "react";
import { Trans } from "react-i18next";
import i18n from "../../../i18n";

export default function PasswordRepeat({ onInputChange, data }) {
  return (
    <>
      <div className="form-group">
        <label htmlFor="password">
          <Trans>Password</Trans>
        </label>
        <input
          placeholder={i18n.t("Password")}
          type="password"
          name="password"
          id="password"
          className="form-control form-control-lg"
          onChange={(e) => onInputChange(e.target.name, e.target.value)}
          value={data.password}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="passwordAgain">
          <Trans>Password again</Trans>
        </label>
        <input
          placeholder={i18n.t("Password again")}
          type="password"
          name="passwordAgain"
          id="passwordAgain"
          className="form-control form-control-lg"
          onChange={(e) => onInputChange(e.target.name, e.target.value)}
          value={data.passwordAgain}
          required
        />
      </div>
    </>
  );
}
