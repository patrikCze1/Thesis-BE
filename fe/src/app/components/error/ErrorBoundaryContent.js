import React from "react";
import { useTranslation } from "react-i18next";

export default function ErrorBoundaryContent({ error }) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <h1>{t("error.errorAppeared")}</h1>
      <a href="/">{t("message.goToMainPage")}</a>

      <p className="text-danger mt-2 text-center">
        Detail chyby: <br /> {error?.message}
      </p>
    </div>
  );
}
