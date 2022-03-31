import React, { useState } from "react";

import { getServerFileUrl } from "../../service/file.service";
import Loader from "./Loader";

export default function AttachmentItem({ file, onDelete }) {
  const [showLoader, setShowLoader] = useState(false);

  const handleDelete = () => {
    setShowLoader(true);
    onDelete(file.id);
  };

  return (
    <li>
      <a href={getServerFileUrl(file.path)} target="_blank">
        <i className="mdi mdi-file"></i> {file.originalName}
      </a>
      {onDelete && (
        <>
          <button
            className="btn btn-icon btn-rounded btn-small"
            onClick={handleDelete}
            disabled={showLoader}
          >
            <i className="mdi mdi-close-circle-outline text-black-50"></i>
          </button>
          <div className="d-inline-block">
            {showLoader && <Loader cssClass="loader-mini" />}
          </div>
        </>
      )}
    </li>
  );
}
