import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Trans } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "react-bootstrap";

import {
  createStageAction,
  deleteStageAction,
  editStagesAction,
} from "../../../reducers/project/board.reducer";
import i18n from "../../../../i18n";
import { STAGE_TYPE } from "../../../../utils/enum";
import { useSwalAlert } from "../../../hooks/common";
import { LoaderTransparent } from "../../common";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export default function BoardStagesForm({ boardId }) {
  const dispatch = useDispatch();
  const { Swal } = useSwalAlert();
  const { stages: projectStages, working } = useSelector(
    (state) => state.boardReducer
  );
  const [stages, setStages] = useState([...projectStages]);
  const [showNewStageForm, setShowNewStageForm] = useState(false);
  const [newPhaseTitle, setNewPhaseTitle] = useState("");

  const grid = stages.length || 0;

  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: grid * 2,
    margin: `0 4px 0 0`,

    // change background colour if dragging
    background: isDragging ? "#c5c5c5" : "lightgrey",
    borderRadius: "4px",
    borderColor: "lightgrey",

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  const getListStyle = (isDraggingOver) => ({
    background: isDraggingOver ? "#e2e6ea" : "#f2f2f2",
    display: "flex",
    padding: grid,
    overflow: "auto",
  });

  useEffect(() => {
    setStages(projectStages);
  }, [projectStages]);

  const handleSaveOrder = async (e) => {
    const editedStages = stages.map((stage, i) => {
      return { ...stage, order: i };
    });
    console.log("handleSaveOrder", editedStages);
    dispatch(editStagesAction(boardId, editedStages));
  };

  const handleEditStage = (prop, val, id) => {
    const editedStages = stages.map((stage) => {
      if (stage.id == id) stage[prop] = val;
      return stage;
    });
    setStages(editedStages);
  };

  const handleRemoveStage = (id) => {
    Swal.fire({
      icon: "warning",
      title: i18n.t("alert.deleteStage") + "?",
      text: i18n.t("alert.stageWillBeDeleted"),
      confirmButtonText: i18n.t("remove"),
      showCancelButton: true,
      cancelButtonText: i18n.t("cancel"),
    }).then((result) => {
      if (result.value) dispatch(deleteStageAction(id));
    });
  };

  const handleAddStage = () => {
    setShowNewStageForm(!showNewStageForm);
  };

  const handleCreateNewStage = (e) => {
    e.preventDefault();
    if (newPhaseTitle) {
      dispatch(
        createStageAction(boardId, {
          name: newPhaseTitle,
          order: stages.length + 1,
          type: STAGE_TYPE.WAITING,
        })
      );
      setNewPhaseTitle("");
      setShowNewStageForm(false);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      stages,
      result.source.index,
      result.destination.index
    );
    console.log("items", items);
    setStages(items);
  };

  return (
    <div className="row mt-5 bg-white position-relative">
      <div className="col-md-12">
        <h3 className="d-flex">
          <Trans>Stage settings</Trans>

          <div className="d-flex ml-auto p-relative">
            <button
              onClick={handleAddStage}
              className="btn btn-outline-primary "
            >
              <Trans>project.addPhase</Trans>
            </button>
          </div>
        </h3>
      </div>
      <div className="col-md-12">
        <div>
          {showNewStageForm && (
            <div className="mb-3 new-task-form bg-white p-2">
              <form onSubmit={handleCreateNewStage} className="d-flex ">
                <input
                  type="text"
                  name="name"
                  className="form-control h-auto"
                  placeholder={i18n.t("label.name")}
                  required
                  value={newPhaseTitle}
                  onChange={(e) => setNewPhaseTitle(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn btn-primary font-weight-bold ml-0 ml-sm-2 mt-2 mt-sm-0"
                >
                  <i className="mdi mdi-plus btn-icon-prepend"></i>
                </button>
              </form>
            </div>
          )}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
                {...provided.droppableProps}
                className="mb-3"
              >
                {stages.map((stage, index) => (
                  <Draggable
                    key={stage.id}
                    draggableId={"col" + stage.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                      >
                        <span
                          data-id={stage.id}
                          data-name={stage.name}
                          className="stage-el dragula-order"
                        ></span>
                        <div className="mb-2">
                          <input
                            className="form-control-sm form-control"
                            type="text"
                            value={stage.name || ""}
                            onChange={(e) =>
                              handleEditStage("name", e.target.value, stage.id)
                            }
                            placeholder={i18n.t("label.name")}
                          />
                        </div>
                        <div className="mb-2">
                          <input
                            className="form-control-sm form-control"
                            type="number"
                            value={stage.limit || ""}
                            min={1}
                            onChange={(e) =>
                              handleEditStage("limit", e.target.value, stage.id)
                            }
                            placeholder={i18n.t("stage.limit")}
                          />
                        </div>
                        <div className="mb-2">
                          <select
                            className="form-control-sm form-control"
                            onChange={(e) =>
                              handleEditStage("type", e.target.value, stage.id)
                            }
                            value={stage.type}
                          >
                            <option value={STAGE_TYPE.WAITING}>
                              {i18n.t("stage.waiting")}
                            </option>
                            <option value={STAGE_TYPE.IN_PROGRESS}>
                              {i18n.t("stage.inProgress")}
                            </option>
                            <option value={STAGE_TYPE.COMPLETED}>
                              {i18n.t("stage.completed")}
                            </option>
                          </select>
                        </div>
                        <div className="d-flex justify-content-between">
                          <button
                            type="button"
                            onClick={() => handleRemoveStage(stage.id)}
                            className="btn btn-outline-danger btn-icon"
                          >
                            <i className="fa fa-times"></i>
                          </button>

                          <i className="mdi mdi-menu fa-2x"></i>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <Button type="button" onClick={handleSaveOrder}>
          {i18n.t("label.saveChanges")}
        </Button>
      </div>
      {working && <LoaderTransparent />}
    </div>
  );
}
