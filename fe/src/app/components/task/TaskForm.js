import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, ProgressBar } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { Trans, useTranslation } from "react-i18next";
import Mentions from "rc-mentions";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { GithubPicker } from "react-color";

import {
  deleteTaskAction,
  editTaskAction,
  completeTaskAction,
} from "./../../reducers/task/taskReducer";
import {
  createAction,
  editAction as editCheckAction,
  deleteAction,
  loadChecks,
} from "./../../reducers/task/taskCheckReducer";
import {
  createAction as createCommentAction,
  loadComments,
  socketDeleteComment,
  socketNewComment,
} from "./../../reducers/task/taskCommentReducer";
import {
  deleteTaskAttachmentAction,
  setAttachmentsAction,
  uploadAction,
} from "../../reducers/task/taskAttachmentReducer";
import Editable from "../form/Editable";
import { getIo } from "../../../utils/websocket.config";
import { ROLES, SOCKET, TASK_COLORS, TASK_PRIORITY } from "../../../utils/enum";
import { getFullName } from "../../service/user/user.service";
import { hasRole } from "../../service/role.service";
import TaskCommentItem from "./TaskCommentItem";
import Dropzone from "../common/Dropzone";
import Loader from "../common/Loader";
import AttachmentItem from "../common/AttachmentItem";

export default function TaskForm({ task, hideModal }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ description: "" });
  const [checkInput, setCheckInput] = useState(null);
  const [checklistProgress, setChecklistProgress] = useState(0);
  const [commentFormData, setCommentFormData] = useState({
    text: "",
    files: [],
  });
  const [deadline, setDeadline] = useState(task.deadline);
  const [projectUsers, setProjectUsers] = useState([]); //todo users
  const [showFileForm, setShowFileForm] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { checks } = useSelector((state) => state.taskCheckReducer);
  const { comments } = useSelector((state) => state.taskCommentReducer);
  const { project } = useSelector((state) => state.projectReducer);
  const { users } = useSelector((state) => state.userReducer);
  const { attachments, uploading } = useSelector(
    (state) => state.taskAttachmentReducer
  );
  const { user: currentUser } = useSelector(
    (state) => state.currentUserReducer
  );
  const disableEdit = false;
  const { Option } = Mentions;
  const MySwal = withReactContent(Swal);
  console.log("task attachments", attachments);
  const handleWebsockets = () => {
    try {
      const socket = getIo();
      socket.on(SOCKET.TASK_COMMENT_NEW, (data) => {
        if (data.comment.taskId == task.id)
          dispatch(socketNewComment(data.comment));
      });
      // socket.on(SOCKET.TASK_COMMENT_DELETE, (data) => {
      //   console.log("TASK_COMMENT_DELETE", data);
      //   dispatch(socketDeleteComment(data.id));
      // });
    } catch (error) {
      console.error(error);
    }
  };

  const canDelete =
    hasRole([ROLES.MANAGEMENT, ROLES.ADMIN], currentUser.roles) ||
    currentUser.id === task.createdById;
  const canEdit =
    hasRole([ROLES.MANAGEMENT, ROLES.ADMIN], currentUser.roles) ||
    currentUser.id === task.createdById;

  useEffect(() => {
    setFormData({ ...formData, ...task });
    console.log("set form data", task);
    dispatch(loadChecks(task.checks));
    dispatch(loadComments(task.taskComments));
    dispatch(setAttachmentsAction(task.attachments));
    setProjectUsers(users);
    handleWebsockets();
  }, [task]);

  const calculateChecklistProgress = (checks) => {
    const completed = checks.filter((check) => check.completed === true).length;
    setChecklistProgress((completed / checks.length) * 100);
  };

  useEffect(() => {
    if (checks?.length) calculateChecklistProgress(checks);
  }, [checks]);

  const handleChangeAndSave = (e) => {
    console.log("e.target", e.target);
    const { name, value } = e.target;
    const updatedTask = {
      ...formData,
      [name]: value,
    };

    if (!value) updatedTask[name] = null;
    console.log("updatedTask", updatedTask);
    setFormData(updatedTask);
    dispatch(editTaskAction(task.projectId, task.id, updatedTask));
  };

  const handleDeadlineChange = (value) => {
    setDeadline(value);
    dispatch(
      editTaskAction(task.projectId, task.id, { ...formData, deadline: value })
    );
  };

  function handleQuillChange(value) {
    setFormData({
      ...formData,
      description: value,
    });
    dispatch(
      editTaskAction(task.projectId, task.id, {
        ...formData,
        description: value,
      })
    );
  }

  const handleCreateCheck = (e) => {
    e.preventDefault();
    if (checkInput) {
      dispatch(createAction({ taskId: task.id, title: checkInput }));
      setCheckInput("");
    }
  };

  const handleEditCheck = (check) => {
    dispatch(editCheckAction(check.id, check));
  };

  const handleCheckFormInput = (e) => {
    setCheckInput(e.target.value);
    console.log(e.target.value);
  };

  const handleCommentTextInput = (val) => {
    setCommentFormData({
      ...commentFormData,
      text: val,
    });
  };

  const handleCommentFileInput = (e) => {
    const files = Array.from(e.target.files).map((file) => file);
    setCommentFormData({
      ...commentFormData,
      files: files,
    });
  };

  const handleCreateComment = (e) => {
    console.log(commentFormData);
    e.preventDefault();
    if (commentFormData.text) {
      const fd = new FormData();

      fd.append("text", commentFormData.text);

      commentFormData.files.forEach((file) => {
        fd.append(`files`, file);
      });

      dispatch(createCommentAction(task.id, fd));
      setCommentFormData({ text: "", files: [] });
    }
  };

  const handleRemoveCommentAttachment = (index) => {
    setCommentFormData({
      ...commentFormData,
      files: commentFormData?.files.filter((val, i) => i !== index),
    });
  };

  const getUploadedFiles = () => {
    if (commentFormData?.files.length) {
      return (
        <aside>
          <h5 className="my-2">
            <Trans>comment.files</Trans>
          </h5>
          <ul className="list-ticked">
            {commentFormData.files.map((file, i) => {
              console.log("file", file.name, i);
              return (
                <li key={i} className="d-flex">
                  <i className="mdi mdi-check-all mr-1"></i>
                  {file.name}
                  <button
                    className="btn btn-link p-0 d-inline-block text-right ml-auto"
                    onClick={() => handleRemoveCommentAttachment(i)}
                  >
                    <i className="mdi mdi-close-circle-outline text-danger "></i>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      );
    }
  };

  const handleCompleteClick = () => {
    MySwal.fire({
      icon: task.isCompleted ? "warning" : "info",
      title: task.isCompleted
        ? t("task.unCompleteTask") + "?"
        : `${t("task.completeTask")}?`,
      confirmButtonText: task.isCompleted
        ? t("label.change")
        : t("label.complete"),
      showCancelButton: true,
      cancelButtonText: t("cancel"),
    }).then((result) => {
      if (result.value) dispatch(completeTaskAction(task.projectId, task.id));
    });
  };

  const handleRemoveClick = () => {
    MySwal.fire({
      icon: "warning",
      title: t("task.deleteTask") + "?",
      text: t("task.taskWillBeDeleted"),
      confirmButtonText: t("remove"),
      showCancelButton: true,
      cancelButtonText: t("cancel"),
    }).then((result) => {
      if (result.value) {
        dispatch(deleteTaskAction(task.projectId, task.id));
        hideModal();
      }
    });
  };

  const handleDeleteAttachment = (id) => {
    console.log("delete", id);
    dispatch(deleteTaskAttachmentAction(task.id, id));
  };

  const handleUploadTaskFiles = (files) => {
    console.log("files", files);
    if (files.length > 0) {
      const fd = new FormData();

      files.forEach((file) => {
        fd.append(`files`, file);
      });

      dispatch(uploadAction(task.id, fd));
    }
  };

  return (
    <div className="card-body">
      <div className="row">
        <div className="col-md-10 order-md-1 order-2">
          <Form.Group>
            <h4>
              <Editable
                type="text"
                name="title"
                placeholder={`${t("label.title")}...`}
                value={formData.title}
                disabled={disableEdit}
                onSave={(val) =>
                  handleChangeAndSave({ target: { name: "title", value: val } })
                }
                disabled={!canEdit}
              />
            </h4>
          </Form.Group>

          <Form.Group>
            <Editable
              value={
                formData.description
                  ? formData.description
                  : t("project.description")
              }
              type="quill"
              onSave={(val) => handleQuillChange(val)}
              placeholder={`${t("task.description")}...`}
              label={t("task.description")}
              disabled={!canEdit}
            />
          </Form.Group>

          <div className="form-group">
            <h6>
              <Trans>task.files</Trans>
            </h6>
            {uploading && <Loader />}

            <ul className="comment-attachment-list">
              {attachments?.length > 0 &&
                attachments.map((file, i) => {
                  return (
                    <AttachmentItem
                      key={file.id}
                      file={file}
                      onDelete={canEdit && handleDeleteAttachment}
                    />
                  );
                })}
            </ul>
            {canEdit && (
              <>
                <button
                  className="btn btn-outline-primary btn-icon-text mb-2 d-block"
                  onClick={() => setShowFileForm(!showFileForm)}
                >
                  {showFileForm ? (
                    <>
                      <i className="mdi mdi-chevron-up va-middle mr-1"></i>
                      <Trans>label.hide</Trans>
                    </>
                  ) : (
                    <>
                      <i className="mdi mdi-chevron-down va-middle mr-1"></i>
                      <Trans>task.uploadFiles</Trans>
                    </>
                  )}
                </button>

                {showFileForm && <Dropzone onSubmit={handleUploadTaskFiles} />}
              </>
            )}
          </div>

          <hr />
          <div className="row mb-3">
            <div className="col-md-12">
              <h5 className="card-title">
                <Trans>Checklist</Trans>
              </h5>
              {checks?.length > 0 && (
                <div className="mb-2">
                  <ProgressBar
                    striped
                    variant={checklistProgress === 100 ? "success" : `info`}
                    now={checklistProgress}
                  />
                </div>
              )}
              {canEdit && (
                <form
                  className="add-items d-sm-flex mb-2"
                  onSubmit={handleCreateCheck}
                >
                  <input
                    type="text"
                    name="check"
                    className="form-control h-auto"
                    placeholder={t("Set checklist")}
                    value={checkInput}
                    onChange={handleCheckFormInput}
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary font-weight-bold ml-0 ml-sm-2 mt-2 mt-sm-0"
                  >
                    <Trans>Add</Trans>
                  </button>
                </form>
              )}
              <div className="list-wrapper">
                <ul className="d-flex flex-column todo-list">
                  {checks &&
                    checks.map((check) => {
                      return <CheckItem key={check.id} check={check} />;
                    })}
                </ul>
              </div>
            </div>
          </div>
          <hr />
          <h5 className="card-title">
            <Trans>Comments</Trans>
          </h5>
          <form className="" onSubmit={handleCreateComment}>
            <div className="form-group mb-1">
              {
                //todo fix options
                <Mentions
                  rows={3}
                  className="h-auto form-mention"
                  onChange={(val) => handleCommentTextInput(val)}
                  value={commentFormData.text}
                  required
                  autoFocus
                >
                  {projectUsers.map((user) => (
                    <Option value={user.username}>{getFullName(user)}</Option>
                  ))}
                </Mentions>
              }
            </div>

            <div className="form-group mb-3">
              <div className="custom-file">
                <input
                  type="file"
                  id="commentAttachment"
                  className="form-control visibility-hidden form-control-file"
                  onChange={handleCommentFileInput}
                  multiple
                />
                <label
                  className="custom-file-label"
                  htmlFor="commentAttachment"
                >
                  <Trans>comment.addFiles</Trans>
                </label>
              </div>
              {getUploadedFiles()}
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary font-weight-bold"
              >
                <Trans>Add</Trans>
              </button>
            </div>
          </form>
          <div className="comment-list">
            {comments?.length > 0 &&
              comments.map((comment) => {
                return (
                  <TaskCommentItem
                    comment={comment}
                    key={comment.id}
                    currentUser={currentUser}
                  />
                );
              })}
          </div>
        </div>

        <div className="col-md-2 order-md-2 order-1">
          <h4>
            <Trans>label.settings</Trans>
          </h4>
          <Form.Group>
            <label>
              <Trans>Priority</Trans>
            </label>
            <select
              className="form-control"
              name="priority"
              value={formData.priority}
              onChange={(e) => handleChangeAndSave(e)}
              disabled={!canEdit}
            >
              {Object.keys(TASK_PRIORITY).map((key, i) => {
                return (
                  <option value={key} key={i}>
                    {t(TASK_PRIORITY[key])}
                  </option>
                );
              })}
            </select>
          </Form.Group>

          <Form.Group>
            <label>
              <Trans>Stage</Trans>
            </label>
            <select
              className="form-control"
              name="projectStageId"
              value={formData.projectStageId}
              onChange={(e) => handleChangeAndSave(e)}
            >
              {project &&
                project.projectStages &&
                project.projectStages.map((stage, i) => {
                  return (
                    <option value={stage.id} key={i}>
                      {stage.name}
                    </option>
                  );
                })}
            </select>
          </Form.Group>

          <Form.Group>
            <label>
              <Trans>Creator</Trans>
            </label>
            <select
              className="form-control"
              name="createdById"
              value={formData.createdById}
              onChange={(e) => handleChangeAndSave(e)}
              disabled={!canEdit}
            >
              {projectUsers &&
                projectUsers.map((user, i) => {
                  return (
                    <option value={user.id} key={i}>
                      {getFullName(user)}
                    </option>
                  );
                })}
            </select>
          </Form.Group>

          <Form.Group>
            <label>
              <Trans>Solver</Trans>
            </label>
            <select
              className="form-control"
              name="solverId"
              value={formData.solverId}
              onChange={(e) => handleChangeAndSave(e)}
            >
              <option value="">{t("Choose")}</option>
              {projectUsers &&
                projectUsers.map((user, i) => {
                  return (
                    <option value={user.id} key={i}>
                      {getFullName(user)}
                    </option>
                  );
                })}
            </select>
          </Form.Group>

          <Form.Group>
            <label>
              <Trans>label.color</Trans>
            </label>
            <button
              className="form-control w-100 p-2"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <div
                style={{
                  backgroundColor: formData.colorCode,
                  borderRadius: "4px",

                  width: "100%",
                  height: "100%",
                }}
              ></div>
              {showColorPicker && (
                <GithubPicker
                  onChangeComplete={(val) => {
                    if (val?.hex != formData.colorCode)
                      handleChangeAndSave({
                        target: { name: "colorCode", value: val?.hex },
                      });
                    setShowColorPicker(false);
                  }}
                  color={formData.colorCode}
                  colors={TASK_COLORS}
                />
              )}
            </button>
          </Form.Group>

          <Form.Group className="react-datepicker-flex">
            <label>
              <Trans>Deadline</Trans>
            </label>
            <DatePicker
              className="form-control w-100"
              locale="cs"
              selected={deadline && new Date(deadline)}
              onChange={(val) => handleDeadlineChange(val)}
              timeFormat="p"
              timeIntervals={15}
              dateFormat="Pp"
              showTimeSelect
              withPortal
              disabled={!canEdit}
            />
          </Form.Group>
          <Form.Group>
            <label>
              <Trans>label.actions</Trans>
            </label>

            {task.isCompleted ? (
              <>
                <span className="text-primary d-block">
                  <i className="mdi mdi-check btn-icon-prepend"></i>
                  <Trans>task.taskCompleted</Trans>
                </span>
                <span className="text-right d-block mt-1 mb-1">
                  <a
                    href="#"
                    className="text-small text-warning"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCompleteClick();
                    }}
                  >
                    <Trans>label.change</Trans>
                  </a>
                </span>
              </>
            ) : (
              <button
                className="btn btn-outline-primary btn-icon-text w-100"
                onClick={handleCompleteClick}
              >
                <i className="mdi mdi-check btn-icon-prepend"></i>
                <Trans>task.completeTask</Trans>
              </button>
            )}
            {canDelete && (
              <div>
                <button
                  className="btn btn-outline-danger btn-icon-text w-100 mt-2"
                  onClick={handleRemoveClick}
                >
                  <i className="mdi mdi-delete btn-icon-prepend"></i>
                  <Trans>task.delete</Trans>
                </button>
              </div>
            )}
          </Form.Group>
        </div>
      </div>
    </div>
  );
}

const CheckItem = ({ check }) => {
  const dispatch = useDispatch();

  const handleCheckCheck = () => {
    console.log(check);
    const completed = check.completed;
    dispatch(editCheckAction(check.id, { ...check, completed: !completed }));
  };
  const handleDelete = () => {
    dispatch(deleteAction(check.id));
  };
  return (
    <li className={check.completed ? "completed" : null}>
      <div className="form-check">
        <label htmlFor="" className="form-check-label">
          <input
            className="checkbox"
            type="checkbox"
            checked={check.completed}
            onChange={handleCheckCheck}
          />
          {check.title}
          {/* <Editable
              initialValue={ props.children }
              isValueClickable
              mode="inline"
                size="sm"
                name="check"
                // onChange={(e) => handleInputChange(e)}
              /> */}
          <i className="input-helper"></i>
        </label>
      </div>
      <i
        className="remove mdi mdi-close-circle-outline"
        onClick={handleDelete}
      ></i>
    </li>
  );
};
