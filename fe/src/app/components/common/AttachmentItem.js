import React from "react";
import { getServerFileUrl } from "../../service/file.service";

export default function AttachmentItem({ file, onDelete }) {
  return (
    <li>
      <a href={getServerFileUrl(file.path)} target="_blank">
        <i className="mdi mdi-file"></i> {file.originalName}
      </a>
      {onDelete && (
        <button
          className="btn btn-icon btn-rounded btn-small"
          onClick={() => onDelete(file.id)}
        >
          <i className="mdi mdi-close-circle-outline text-black-50"></i>
        </button>
      )}
    </li>
  );
}
