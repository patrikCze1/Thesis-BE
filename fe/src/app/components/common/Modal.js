import React from "react";

export default function Modal(props) {
  return (
    <div
      className="modal fade show"
      id="modal-default"
      aria-modal="true"
      role="dialog"
      style={{ display: 'block' }}
    >
      <div className="modal-dialog">
          { props.childern }
      </div>
    </div>
  );
}
