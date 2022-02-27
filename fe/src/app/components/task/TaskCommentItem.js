import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import { getShortName, getFullName } from "../../service/user/user.service";
import { hasRole } from "../../service/role.service";
import { ROLES } from "../../../utils/enum";
import { deleteTaskCommentAction } from "../../reducers/task/taskCommentReducer";
import { getServerFileUrl } from "../../service/file.service";
import AttachmentItem from "../common/AttachmentItem";

export default function TaskCommentItem({ comment, currentUser }) {
  const MySwal = withReactContent(Swal);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleDelete = () => {
    MySwal.fire({
      icon: "warning",
      title: t("comment.deleteComment") + "?",
      confirmButtonText: t("label.delete"),
      showCancelButton: true,
      cancelButtonText: t("cancel"),
    }).then((result) => {
      if (result.value)
        dispatch(deleteTaskCommentAction(comment.taskId, comment.id));
    });
  };

  return (
    <div className="list-item">
      <div className="mr-3">
        <span className="text-avatar">
          {getShortName(comment.taskCommentUser)}
        </span>
      </div>
      <div className="content">
        <div className="d-flex align-items-center">
          <h6 className="product-name text-dark">
            {getFullName(comment.taskCommentUser)}
          </h6>
          <small className="time ml-3 d-none d-sm-block">
            {new Intl.DateTimeFormat("cs-CZ", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(comment.createdAt))}
          </small>
        </div>
        <div className="d-flex align-items-center">
          <div
            className="comment-text-content"
            dangerouslySetInnerHTML={{ __html: comment.text }}
          ></div>
        </div>
        {comment?.commentAttachments.length > 0 && (
          <ul className="comment-attachment-list">
            {comment.commentAttachments.map((file) => {
              return <AttachmentItem key={file.id} file={file} />;
            })}
          </ul>
        )}
      </div>
      {(hasRole(ROLES.ADMIN, currentUser.roles) ||
        currentUser.id === comment.userId) && (
        <button
          onClick={handleDelete}
          className="btn btn-icon btn-rounded btn-small"
        >
          <i className="mdi mdi-close-circle-outline text-black-50"></i>
        </button>
      )}
    </div>
  );
}
