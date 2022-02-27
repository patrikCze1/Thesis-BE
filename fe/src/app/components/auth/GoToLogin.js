import React from "react";
import { NavLink } from "react-router-dom";

import i18n from "../../../i18n";
import { ROUTE } from "../../../utils/enum";

export default function GoToLogin() {
  return (
    <div className="d-flex align-items-center auth px-0">
      <div className="row w-100 mx-0">
        <div className="col-lg-4 mx-auto">
          <p className="text-center">
            <NavLink to={ROUTE.LOGIN}>{i18n.t("label.goToLogin")}</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}
