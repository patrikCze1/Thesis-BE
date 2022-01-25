import React from "react";

export default function Loader({ cssClass }) {
  return (
    <div className={"loader-demo-box " + cssClass}>
      <div className="bar-loader">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}
