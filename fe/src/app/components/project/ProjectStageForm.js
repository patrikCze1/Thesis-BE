import React, { useState, useEffect } from "react";
import Dragula from "react-dragula";
import { toast } from "react-toastify";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  createStageAction,
  deleteStageAction,
  editStagesAction,
} from "../../reducers/project/project.reducer";
import { Button } from "react-bootstrap";

export default function ProjectStageForm({ projectId }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { stages: projectStages } = useSelector(
    (state) => state.projectReducer
  );
  const [stages, setStages] = useState(projectStages);

  useEffect(() => {
    setStages(projectStages);
  }, [projectStages]);

  const dragulaDecorator = (componentBackingInstance) => {
    if (componentBackingInstance) {
      const options = {};
      const dragula = Dragula([componentBackingInstance], options);

      dragula.on("drop", (el, target, source, sibling) => {
        const elements = document.getElementsByClassName("stage-el");
        const stageList = Array.from(elements).map((element, i) => {
          return {
            id: Number(element.dataset.id),
            name: element.dataset.name,
            order: i + 1,
            projectId: Number(projectId),
          };
        });
        let uniqueStages = [];
        stageList.forEach(function (item) {
          var i = uniqueStages.findIndex((x) => x.id == item.id);
          if (i <= -1) {
            uniqueStages.push(item);
          }
        });

        setStages(uniqueStages);
      });
    }
  };

  const handleSaveOrder = async (e) => {
    console.log("handleSaveOrder", stages);
    dispatch(editStagesAction(projectId, stages));
  };

  const handleRenameStage = (e, id) => {
    const editedStages = stages.map((stage) => {
      if (stage.id == id) stage.name = e.target.value;
      return stage;
    });
    setStages(editedStages);
  };

  const handleRemoveStage = async (id) => {
    await dispatch(deleteStageAction(id));
    setStages(stages.filter((stage) => stage.id !== id));
  };

  const handleAddStage = async () => {
    dispatch(
      createStageAction(projectId, {
        name: t("project.newPhase"),
        order: stages.length + 1,
        id: null,
      })
    );
  };

  return (
    <div className="row mt-5">
      <div className="col-md-12">
        <h3 className="d-flex">
          <Trans>Stage settings</Trans>

          <button
            onClick={handleAddStage}
            className="btn btn-outline-primary d-block ml-auto"
          >
            <Trans>project.addPhase</Trans>
          </button>
        </h3>
        <div className="container dragula-container" ref={dragulaDecorator}>
          {stages &&
            stages.map((stage) => (
              <div key={stage.id} className="dragula-element">
                <i className="fa fa-bars"></i>
                <span
                  data-id={stage.id}
                  data-name={stage.name}
                  className="stage-el dragula-order"
                ></span>
                <input
                  type="text"
                  value={stage.name}
                  onChange={(e) => handleRenameStage(e, stage.id)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveStage(stage.id)}
                  className="btn btn-danger btn-rounded btn-icon"
                >
                  <i className="fa fa-times"></i>
                </button>
              </div>
            ))}
        </div>

        <Button type="button" onClick={handleSaveOrder}>
          <Trans>Edit changes</Trans>
        </Button>
      </div>
    </div>
  );
}
