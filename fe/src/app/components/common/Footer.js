import React from "react";
import { Trans } from "react-i18next";

export default function Footer() {
  const now = new Date();
  return (
    <footer className="footer">
      <div className="d-sm-flex justify-content-center justify-content-sm-between">
        <span className="text-muted text-center text-sm-left d-block d-sm-inline-block">
          <Trans>Copyright</Trans> © {now.getFullYear()}{" "}
          <Trans>All rights reserved</Trans>.
        </span>
        <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
          <Trans>Hand-crafted</Trans> & <Trans>made with</Trans>{" "}
          <i className="mdi mdi-heart text-danger"></i>
        </span>
      </div>
    </footer>
  );
}
