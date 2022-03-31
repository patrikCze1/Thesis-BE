import React, { useState } from "react";
import { Trans } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import Quill from "./Quill";

import { createAction } from "../../reducers/task/taskCommentReducer";
import { LoaderTransparent } from "../common";

export default function TaskCommentForm({ taskId, onHide }) {
  const dispatch = useDispatch();
  const { creating } = useSelector((state) => state.taskCommentReducer);
  const [formData, setFormData] = useState({ text: "", files: [] });

  const handleSubmit = (e) => {
    console.log(formData);
    e.preventDefault();
    if (formData.text) {
      const fd = new FormData();

      fd.append("text", formData.text);

      formData.files.forEach((file) => {
        fd.append(`files`, file);
      });

      dispatch(createAction(taskId, fd));
      setFormData({ text: "", files: [] });
    }
  };

  const handleChange = (prop, val) => {
    if (prop === "text")
      setFormData({
        ...formData,
        [prop]: val,
      });
    else {
      const files = Array.from(val).map((file) => file);
      setFormData({
        ...formData,
        files,
      });
    }
  };

  const handleRemoveAttachment = (e, index) => {
    e.preventDefault();
    setFormData({
      ...formData,
      files: setFormData?.files?.filter((val, i) => i !== index) || [],
    });
  };
  console.log("formData", formData);
  const getUploadedFiles = () => {
    if (formData?.files.length) {
      return (
        <aside>
          <h5 className="my-2">
            <Trans>comment.files</Trans>
          </h5>
          <ul className="list-ticked">
            {formData.files.map((file, i) => {
              console.log("file", file.name, i);
              return (
                <li key={i} className="d-flex">
                  <i className="mdi mdi-check-all mr-1"></i>
                  {file.name}
                  <button
                    className="btn btn-link p-0 d-inline-block text-right ml-1"
                    onClick={(e) => handleRemoveAttachment(e, i)}
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

  return (
    <form className="position-relative" onSubmit={handleSubmit}>
      <div className="form-group mb-1">
        {
          //todo fix options
          // <Mentions
          //   rows={3}
          //   className="h-auto form-mention"
          //   onChange={(val) => handleCommentTextInput(val)}
          //   value={formData.text || ""}
          //   required
          //   autoFocus
          // >
          //   {projectUsers.map((user) => (
          //     <Option value={user.username} key={user.id}>
          //       {getFullName(user)}
          //     </Option>
          //   ))}
          // </Mentions>
        }

        <Quill onChange={handleChange} value={formData.text} prop="text" />
      </div>

      <div className="form-group mb-3">
        <div className="custom-file">
          <input
            type="file"
            id="commentAttachment"
            className="form-control visibility-hidden form-control-file"
            onChange={(e) => handleChange("files", e.target.files)}
            multiple
          />
          <label className="custom-file-label" htmlFor="commentAttachment">
            <Trans>comment.addFiles</Trans>
          </label>
        </div>
        {getUploadedFiles()}
      </div>

      <div>
        <button type="submit" className="btn btn-primary font-weight-bold">
          <Trans>Add</Trans>
        </button>
        <button type="button" class="btn btn-secondary" onClick={onHide}>
          <Trans>label.cancel</Trans>
        </button>
      </div>

      {creating && <LoaderTransparent />}
    </form>
  );
}
