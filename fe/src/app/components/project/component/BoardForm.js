import React, { useEffect, useState } from "react";
import { Trans } from "react-i18next";
import ReactQuill from "react-quill";
import { useDispatch, useSelector } from "react-redux";
import {
  createBoardAction,
  editBoardAction,
} from "../../../reducers/project/board.reducer";
import LoaderTransparent from "../../common/LoaderTransparent";

export default function BoardForm({ projectId, isEdit, closeForm }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ name: "", description: "" });
  const { working, board } = useSelector((state) => state.boardReducer);

  useEffect(() => {
    console.log("useEffect isEdit,board", isEdit, board);
    if (isEdit && board) {
      setFormData({ name: board.name, description: board.description });
    }
  }, [board]);

  const handleChange = (prop, val) => {
    setFormData({ ...formData, [prop]: val });
  };

  const handleSubmit = (e) => {
    // todo check if user has acess to project
    e.preventDefault();
    if (isEdit) dispatch(editBoardAction(projectId, board.id, formData));
    else {
      dispatch(createBoardAction(projectId, formData));
      closeForm();
    }
  };

  return (
    <div className="row">
      <div className="col-md-12 grid-margin">
        <div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="position-relative">
              <div className="form-row">
                <div className="form-group col-md-12">
                  <label className="form-label">
                    <Trans>project.name</Trans>
                  </label>
                  <input
                    className="form-control"
                    required
                    type="text"
                    placeholder=""
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    maxLength={255}
                  />
                </div>

                <div className="form-group col-md-12">
                  <label className="form-label">
                    <Trans>Description</Trans>
                  </label>

                  <ReactQuill
                    value={formData.description}
                    onChange={(value) => handleChange("description", value)}
                    theme="snow"
                  />
                </div>
              </div>

              <button className="btn btn-primary" type="submit">
                <Trans>{isEdit ? "Edit" : "Create"}</Trans>
              </button>
              {working && <LoaderTransparent />}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
