import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dropdown, Form, ProgressBar } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { Trans, useTranslation } from "react-i18next";
import Mentions from "rc-mentions";
import { GithubPicker } from "react-color";

import {
  deleteTaskAction,
  editTaskAction,
} from "../../reducers/task/task.reducer";
import {
  createAction,
  editAction as editCheckAction,
  deleteAction,
} from "./../../reducers/task/taskCheckReducer";
import {
  createAction as createCommentAction,
  socketDeleteComment,
  socketNewComment,
} from "./../../reducers/task/taskCommentReducer";
import {
  deleteTaskAttachmentAction,
  uploadAction,
} from "../../reducers/task/taskAttachmentReducer";
import Editable from "../form/Editable";
import { getIo } from "../../../utils/websocket.config";
import {
  ROLES,
  SOCKET,
  TASK_ACTION_TYPE,
  TASK_COLORS,
  TASK_PRIORITY,
} from "../../../utils/enum";
import { getFullName } from "../../service/user/user.service";
import { hasRole } from "../../service/role.service";
import TaskCommentItem from "./component/TaskCommentItem";
import Dropzone from "../common/Dropzone";
import AttachmentItem from "../common/AttachmentItem";
import i18n from "../../../i18n";
import TaskCommentForm from "../form/TaskCommentForm";
import { validateCurrencyPattern } from "../../service/utils";
import { useSwalAlert } from "../../hooks/common";
import ReactSelect from "../form/ReactSelect";
import { useCreateTask } from "../../hooks/task";
import { createTaskRoute } from "../../service/router.service";
import { useHistory } from "react-router-dom";
import { LoaderTransparent } from "../common";

export default function TaskForm({
  task,
  hideModal,
  taskType = TASK_ACTION_TYPE.NORMAL,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ description: "" });
  const [checkInput, setCheckInput] = useState(null);
  const [checklistProgress, setChecklistProgress] = useState(0);
  const [deadline, setDeadline] = useState(task.deadline || null);
  const [projectUsers, setProjectUsers] = useState([]); //todo users
  const [showFileForm, setShowFileForm] = useState(false);
  const [showCheckForm, setShowCheckForm] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const { checks, creating: creatingCheck } = useSelector(
    (state) => state.taskCheckReducer
  );
  const { comments } = useSelector((state) => state.taskCommentReducer);
  const { stages, boards } = useSelector((state) => state.boardReducer);
  const { users } = useSelector((state) => state.userReducer);
  const { attachments, uploading } = useSelector(
    (state) => state.taskAttachmentReducer
  );
  const { user: currentUser } = useSelector(
    (state) => state.currentUserReducer
  );
  const { renderForm, setShowNewTaskForm, showNewTaskForm } = useCreateTask(
    task.projectId,
    task.boardId,
    task.id
  );

  const history = useHistory();
  const disableEdit = false;
  const { Option } = Mentions;
  const { Swal } = useSwalAlert();
  console.log("task attachments", task, attachments);
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

      return () => socket?.close();
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
    setProjectUsers(users);
    handleWebsockets();
  }, [task]);
  console.log("task", task);
  const calculateChecklistProgress = (checks) => {
    const completed = checks.filter((check) => check.completed === true).length;
    setChecklistProgress((completed / checks.length) * 100);
  };

  const projectUsersOptions = Array.isArray(projectUsers)
    ? projectUsers.map((user) => {
        return { value: user.id, label: getFullName(user) };
      })
    : [];

  useEffect(() => {
    if (checks?.length) calculateChecklistProgress(checks);
  }, [checks]);

  const handleSave = (data) => {
    dispatch(editTaskAction(taskType, task.projectId, task.id, data));
  };

  const handleChangeAndSave = (e, save = true) => {
    let { name, value } = e.target;
    if (name === "estimation") value = validateCurrencyPattern(value);
    const updatedTask = {
      ...formData,
      [name]: value,
    };
    console.log("handleChangeAndSave", name, value);
    if (!value) updatedTask[name] = null;
    console.log("updatedTask", updatedTask);
    setFormData(updatedTask);
    if (save) handleSave({ [name]: value });
  };

  const handleDeadlineChange = (value) => {
    setDeadline(value);
    dispatch(
      editTaskAction(taskType, task.projectId, task.id, {
        ...formData,
        deadline: value,
      })
    );
  };

  const handleCreateCheck = (e) => {
    e.preventDefault();
    if (checkInput) {
      dispatch(createAction({ taskId: task.id, title: checkInput }));
      setCheckInput("");
    }
  };

  // const handleEditCheck = (check) => {
  //   dispatch(editCheckAction(check.id, check));
  // };

  const handleCheckFormInput = (e) => {
    setCheckInput(e.target.value);
    console.log(e.target.value);
  };

  // const handleCompleteClick = () => {
  //   Swal.fire({
  //     icon: task.completedAt ? "warning" : "info",
  //     title: task.completedAt
  //       ? t("task.unCompleteTask") + "?"
  //       : `${t("task.completeTask")}?`,
  //     confirmButtonText: task.completedAt
  //       ? t("label.change")
  //       : t("label.complete"),
  //     showCancelButton: true,
  //     cancelButtonText: t("cancel"),
  //   }).then((result) => {
  //     if (result.value) dispatch(completeTaskAction(task.projectId, task.id));
  //   });
  // };

  const handleRemoveClick = () => {
    Swal.fire({
      icon: "warning",
      title: t("task.deleteTask") + "?",
      text: t("task.taskWillBeDeleted"),
      confirmButtonText: t("remove"),
      showCancelButton: true,
      cancelButtonText: t("cancel"),
    }).then((result) => {
      if (result.value) {
        dispatch(deleteTaskAction(taskType, task.projectId, task.id));
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

  const handleMoveTo = (data) => {
    console.log("data", data);
    dispatch(editTaskAction(taskType, task.projectId, task.id, data, true));
    hideModal();
  };

  console.log("boards", boards);
  console.log("formData", formData);
  return (
    <div className="card-body pt-4">
      {canDelete && (
        <Dropdown className="modal-options">
          <Dropdown.Toggle variant="btn" className="py-0">
            <i className="mdi mdi-dots-horizontal fs-1-2"></i>
          </Dropdown.Toggle>
          <Dropdown.Menu className="menu-position-updated">
            {canDelete && (
              <Dropdown.Item
                className="btn btn-inverse-danger"
                onClick={handleRemoveClick}
              >
                <Trans>task.delete</Trans>
              </Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown>
      )}

      <div className="row">
        <div className="col-md-10 order-md-1 order-2">
          {task.parentId && (
            <span className="p-2 d-inline-block text-white badge badge-info mb-2 fs-small">
              {i18n.t("task.superiorTask")}{" "}
              <a
                href={`${createTaskRoute(task.parent)}`}
                className="text-white text-"
                onClick={(e) => {
                  e.preventDefault();
                  history.push(createTaskRoute(task.parent));
                }}
              >
                {task.parent.name}
              </a>
            </span>
          )}
          <Form.Group>
            <h4>
              <Editable
                type="text"
                name="name"
                placeholder={`${t("label.title")}...`}
                value={formData.name || ""}
                disabled={disableEdit}
                onSave={(val) =>
                  handleChangeAndSave({ target: { name: "name", value: val } })
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
                  : t("task.description")
              }
              type="quill"
              onSave={(value) =>
                handleChangeAndSave({ target: { name: "description", value } })
              }
              placeholder={`${t("task.description")}...`}
              label={t("task.description")}
              disabled={!canEdit}
            />
          </Form.Group>

          <div className="form-group">
            <h6>
              <span
                className={canEdit && "editable-text"}
                onClick={() => setShowFileForm(!showFileForm)}
              >
                <Trans>task.files</Trans>
                <i className="mdi mdi-upload"></i>
              </span>
            </h6>

            <ul className="comment-attachment-list">
              {attachments?.length > 0 &&
                attachments.map((file) => {
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
                {showFileForm && (
                  <Dropzone
                    onSubmit={handleUploadTaskFiles}
                    uploading={uploading}
                  />
                )}
              </>
            )}
          </div>

          {task?.subtasks?.length > 0 && (
            <>
              <hr />
              <div className="row mb-3">
                <div className="col-md-12">
                  <h5 className="card-title">{i18n.t("task.subtasks")}</h5>

                  {task.subtasks.map((task) => (
                    <a
                      href="#"
                      onClick={(e) => history.push(createTaskRoute(task))}
                      className="mr-2"
                    >
                      {task.name}
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          {(checks?.length > 0 || canEdit) && (
            <>
              <hr />
              <div className="row mb-3">
                <div className="col-md-12">
                  <h5 className="card-title">
                    <span
                      className={canEdit && "editable-text"}
                      onClick={() => setShowCheckForm(!showCheckForm)}
                    >
                      <Trans>Checklist</Trans>
                      <i className="mdi mdi-checkbox-multiple-marked-outline ml-1"></i>
                    </span>
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
                  {canEdit && showCheckForm && (
                    <form
                      className="add-items d-sm-flex mb-2 position-relative"
                      onSubmit={handleCreateCheck}
                    >
                      <input
                        type="text"
                        name="check"
                        className="form-control h-auto"
                        placeholder={t("Set checklist")}
                        value={checkInput || ""}
                        onChange={handleCheckFormInput}
                        required
                        maxLength="255"
                      />
                      <button
                        type="submit"
                        className="btn btn-primary font-weight-bold ml-0 ml-sm-2 mt-2 mt-sm-0"
                      >
                        <Trans>Add</Trans>
                      </button>

                      {creatingCheck && <LoaderTransparent />}
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
            </>
          )}
          <hr />

          <h5 className="card-title">
            <Trans>Comments</Trans>
          </h5>

          {!showCommentForm && (
            <div className="form-group">
              <span
                className="form-control-sm form-control text-black-50 cursor-pointer"
                onClick={() => setShowCommentForm(true)}
              >
                {i18n.t("label.yourComment")}...
              </span>
            </div>
          )}

          {showCommentForm && (
            <TaskCommentForm
              taskId={task.id}
              onHide={() => setShowCommentForm(false)}
            />
          )}

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
          <Form.Group className="mb-3">
            <label>
              <Trans>Priority</Trans>
            </label>
            <select
              className="form-control form-control-sm"
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

          {!formData.stageId && (
            <Form.Group>
              <label>
                <Trans>task.board</Trans>
              </label>
              <select
                className="form-control form-control-sm"
                name="boardId"
                // value={formData.boardId}
                value=""
                onChange={(e) =>
                  handleMoveTo({ boardId: e.target.value, archived: false })
                }
              >
                <option value="">{t("Choose")}</option>

                {boards &&
                  boards.map((board, i) => {
                    return (
                      <option value={board.id} key={i}>
                        {board.name}
                      </option>
                    );
                  })}
              </select>
            </Form.Group>
          )}

          {formData.boardId && (
            <Form.Group className="mb-3">
              <label>
                <Trans>Stage</Trans>
              </label>
              <select
                className="form-control form-control-sm"
                name="stageId"
                value={formData.stageId || null}
                onChange={handleChangeAndSave}
              >
                {!formData.stageId && (
                  <option value={null}>{t("project.stage.choose")}</option>
                )}
                {stages &&
                  stages.map((stage, i) => {
                    return (
                      <option value={stage.id} key={i}>
                        {stage.name}
                      </option>
                    );
                  })}
              </select>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <label>
              <Trans>Creator</Trans>
            </label>
            <select
              className="form-control form-control-sm"
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

          <Form.Group className="mb-3">
            <label>
              <Trans>Solver</Trans>
            </label>
            <ReactSelect
              options={projectUsersOptions}
              onChange={(val) => {
                handleChangeAndSave({
                  target: { name: "solverId", value: val?.value || null },
                });
              }}
              value={formData.solverId}
            />
            {/* <select
              className="form-control form-control-sm"
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
            </select> */}
          </Form.Group>

          <Form.Group className="mb-3">
            <label>
              <Trans>label.color</Trans>
            </label>
            <button
              className="form-control form-control-sm w-100 p-2"
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

          <Form.Group className="react-datepicker-flex mb-3">
            <label>
              <Trans>Deadline</Trans>
            </label>
            <DatePicker
              className="form-control form-control-sm w-100"
              locale="cs"
              selected={deadline && new Date(deadline)}
              onChange={(val) => handleDeadlineChange(val)}
              timeFormat="p"
              timeIntervals={15}
              dateFormat="Pp"
              showTimeSelect
              withPortal
              isClearable
              disabled={!canEdit}
            />
            {deadline &&
              task.completedAt &&
              new Date(deadline) < new Date(task.completedAt) && (
                <small className="text-warning">
                  {t("task.completedAfterDeadline")}
                </small>
              )}
          </Form.Group>

          <Form.Group className="mb-3">
            <label>
              <Trans>task.estimation</Trans>
            </label>
            <input
              className="form-control form-control-sm"
              name="estimation"
              value={formData.estimation}
              onChange={(e) => handleChangeAndSave(e, false)}
              disabled={!canEdit}
              placeholder={i18n.t("task.hoursCount")}
              onBlur={() => {
                if (formData.estimation != task.estimation)
                  handleSave({ estimation: formData.estimation });
              }}
            />
          </Form.Group>

          {canEdit && (
            <Form.Group className="mb-3">
              <label>
                <strong>
                  <Trans>label.actions</Trans>
                </strong>
              </label>

              <Dropdown>
                <Dropdown.Toggle variant="btn btn-light">
                  {i18n.t("task.moveTo")}
                  <i className="mdi mdi-chevron-down"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {(task.stageId || task.archived === true) && (
                    <Dropdown.Item
                      onClick={() =>
                        handleMoveTo({
                          boardId: null,
                          stageId: null,
                          archived: false,
                        })
                      }
                    >
                      {i18n.t("task.backlog")}
                      <i className="mdi mdi-chevron-right"></i>
                    </Dropdown.Item>
                  )}

                  {task.archived === false && (
                    <Dropdown.Item
                      onClick={() =>
                        handleMoveTo({
                          archived: true,
                        })
                      }
                    >
                      {i18n.t("task.archive")}
                      <i className="mdi mdi-chevron-right"></i>
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>

              <button
                onClick={() => setShowNewTaskForm(!showNewTaskForm)}
                className="btn btn-light mt-2"
              >
                {i18n.t("task.createSubtask")}
              </button>
              {showNewTaskForm ? renderForm("pos-top") : ""}
            </Form.Group>
          )}
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
