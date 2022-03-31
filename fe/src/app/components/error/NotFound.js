import React from "react";
import { Trans } from "react-i18next";
import { NavLink } from "react-router-dom";

export default function NotFound() {
  return (
    <div>
      <div className="d-flex align-items-center text-center error-page bg-primary pt-5 pb-4 h-100">
        <div className="row flex-grow">
          <div className="col-lg-8 mx-auto text-white">
            <div className="row align-items-center d-flex flex-row">
              <div className="col-lg-6 text-lg-right pr-lg-4">
                <h1 className="display-1 mb-0">404</h1>
              </div>
              <div className="col-lg-6 error-page-divider text-lg-left pl-lg-4">
                <h2>
                  <Trans>error.pageNotFound</Trans>
                </h2>
                <h3 className="font-weight-light">
                  <Trans>error.pageNotFoundText</Trans>.
                </h3>
              </div>
            </div>
            <div className="row mt-5">
              <div className="col-12 text-center mt-xl-2">
                <NavLink className="text-white font-weight-medium" to="/">
                  <Trans>Back to homepage</Trans>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
