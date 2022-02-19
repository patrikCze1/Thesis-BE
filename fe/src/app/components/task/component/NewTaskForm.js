import React, { useState } from "react";
import { useDispatch } from "react-redux";
import i18n from "../../../../i18n";
import { createTaskAction } from "../../../reducers/task/task.reducer";

export default function NewTaskForm({ projectId, boardId, onHide }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");

  const handleCreateTask = (e) => {
    e.preventDefault();

    if (title) {
      dispatch(
        createTaskAction(projectId, {
          title,
          projectId,
          boardId,
        })
      );
      onHide();
    }
  };

  return (
    <div className="mb-3 new-task-form bg-white p-2">
      <form onSubmit={handleCreateTask} className="d-flex ">
        <input
          type="text"
          name="title"
          className="form-control h-auto"
          placeholder={i18n.t("label.title")}
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
