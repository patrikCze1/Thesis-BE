import React, { useState } from "react";
import { useDispatch } from "react-redux";
import i18n from "../../../../i18n";
import { createTaskAction } from "../../../reducers/task/task.reducer";

export default function NewTaskForm({
  projectId,
  boardId,
  onHide,
  parentId,
  className = "",
}) {
  const dispatch = useDispatch();
  const [name, setName] = useState("");

  const handleCreateTask = (e) => {
    e.preventDefault();

    if (name) {
      dispatch(
        createTaskAction(projectId, {
          name,
          projectId,
          boardId,
          parentId,
        })
      );
      onHide();
    }
  };

  return (
    <div className={`mb-3 new-task-form bg-white p-2 ${className}`}>
      <form onSubmit={handleCreateTask} className="d-flex ">
        <input
          type="text"
          name="name"
          className="form-control h-auto"
          placeholder={i18n.t("label.name")}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary font-weight-bold ml-0 ml-sm-2 mt-2 mt-sm-0"
        >
          <i className="mdi mdi-plus btn-icon-prepend"></i>
        </button>
      </form>
    </div>
  );
}
