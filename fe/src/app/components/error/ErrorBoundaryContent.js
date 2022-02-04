import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

export default function ErrorBoundaryContent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("error.errorAppeared")}</h1>
      <a href="/">{t("message.goToMainPage")}</a>
    </div>
  );
}
