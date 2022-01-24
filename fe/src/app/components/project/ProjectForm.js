import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Col, Button } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { Typeahead } from "react-bootstrap-typeahead";
import Dragula from "react-dragula";
import { toast } from "react-toastify";

import {
  createProjectAction,
  editProjectAction,
  loadProjectAction,
} from "./../../reducers/project/project.reducer";
import { loadClietntsAction } from "./../../reducers/common/clientReducer";
import { loadGroupsAction } from "./../../reducers/user/groupReducer";
import { loadUsersAction } from "./../../reducers/user/userReducer";

import Loader from "./../common/Loader";
import axios from "./../../../utils/axios.config";

export default function ProjectForm({ projectId }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: null,
    description: null,
    client: [],
    groups: [],
    users: [],
  });
  const [stages, setStages] = useState([]);
  const { clients } = useSelector((state) => state.clientReducer);
  const { groups } = useSelector((state) => state.groupReducer);
  const { users } = useSelector((state) => state.userReducer);
  const { project, projectLoaded } = useSelector(
    (state) => state.projectReducer
  );
  const [isEdit, setIsEdit] = useState(projectId ? true : false);
  console.log("projectId", projectId);
  console.log("project", project);
  useEffect(() => {
    dispatch(loadClietntsAction());
    dispatch(loadGroupsAction());
    dispatch(loadUsersAction());
    console.log("projectId", projectId);
    if (projectId) dispatch(loadProjectAction(projectId));
  }, []);

  useEffect(() => {
    if (project && Object.keys(project).length > 0) {
      setFormData({
        ...formData,
        name: project.name,
        description: project.description || "",
        key: project.key || "",
        clientId: project.clientId
          ? [{ value: project.clientId, label: project.Client.name }]
          : [],
        groups: project.groups
          ? project.groups.map((group) => {
              return { value: group.id, label: group.name };
            })
          : [],
        users: project.users
          ? project.users.map((user) => {
              return {
                value: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
              };
            })
          : [],
      });
      if (project.projectStages) setStages(project.projectStages);
    }

    if (projectId || Object.keys(project).length > 0) setIsEdit(true);
  }, [project]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === true) {
      const data = {
        ...formData,
        clientId: formData.clientId.length ? formData.clientId[0].value : null,
        users: formData.users.map((user) => user.value),
        groups: formData.groups.map((group) => group.value),
      };

      if (projectId || project.id) {
        dispatch(editProjectAction(projectId, data));
      } else {
        dispatch(createProjectAction(data));
      }
    }
  };

  const handleInputChange = (e) => {
    const target = e.target;

    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const clietnsArr = clients.map((client) => {
    return { value: client.id, label: client.name };
  });

  const handleClientSelectChange = (value) => {
    console.log("handleClientSelectChange", value);
    setFormData({
      ...formData,
      clientId: value,
    });
  };

  const groupsArr = groups.map((group) => {
    return { value: group.id, label: group.name };
  });
  const handleGroupSelectChange = (values) => {
    setFormData({
      ...formData,
      groups: values,
    });
  };

  const usersArr = users.map((user) => {
    return {
      value: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  });
  const handleUserSelectChange = (values) => {
    setFormData({
      ...formData,
      users: values,
    });
  };

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
    try {
      await axios.patch(`/api/projects/${projectId}/stages/`, { stages });
      toast.success(t("project.changesSaved"));
    } catch (error) {
      toast.error(t(error.message));
    }
  };

  const handleRenameStage = (e, id) => {
    const editedStages = stages.map((stage) => {
      if (stage.id == id) stage.name = e.target.value;
      return stage;
    });
    setStages(editedStages);
  };

  const handleRemoveStage = async (id) => {
    setStages(stages.filter((stage) => stage.id !== id));
    try {
      await axios.delete(`/api/projects/stages/${id}`);
      toast.success(t("project.stageRemoved"));
    } catch (error) {
      toast.error(t(error.message));
    }
  };

  const handleAddStage = async () => {
    const newStage = { name: "Nová fáze", order: stages.length + 1, id: null };
    try {
      const res = await axios.post(`/api/projects/${project.id}/stages`, {
        ...newStage,
      });
      setStages([...stages, res.data.stage]);
      toast.success(t("project.stageAdded"));
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!projectLoaded && !projectId) {
    return <Loader />;
  }

  return (
    <div className="row">
      <div className="col-md-12 grid-margin">
        <div>
          <div className="card-body">
            <Form onSubmit={handleSubmit}>
              <Form.Row>
                <Form.Group as={Col} md="5">
                  <Form.Label>
                    <Trans>project.name</Trans>
                  </Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder=""
                    defaultValue=""
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    maxLength={255}
                  />
                </Form.Group>
                <Form.Group as={Col} md="2">
                  <Form.Label>
                    <Trans>project.key</Trans>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=""
                    defaultValue=""
                    name="key"
                    value={formData.key}
                    onChange={handleInputChange}
                    maxLength={10}
                  />
                </Form.Group>
                <Form.Group as={Col} md="5">
                  <Form.Label>
                    <Trans>Client</Trans>
                  </Form.Label>
                  <Typeahead
                    id="projectClient"
                    options={clietnsArr}
                    name="clientId"
                    selected={formData.clientId}
                    onChange={handleClientSelectChange}
                  />
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col} md="12" controlId="validationCustom05">
                  <Form.Label>
                    <Trans>Description</Trans>
                  </Form.Label>
                  <textarea
                    className="form-control"
                    id="validationCustom05"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col} md="12" controlId="validationCustom03">
                  <Form.Label>
                    <Trans>Assign group</Trans>
                  </Form.Label>
                  <Typeahead
                    id="projectGroups"
                    multiple={true}
                    options={groupsArr}
                    name="groups"
                    selected={formData.groups}
                    onChange={handleGroupSelectChange}
                  />
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col} md="12">
                  <Form.Label>
                    <Trans>Assign employee</Trans>
                  </Form.Label>
                  <Typeahead
                    id="projectUsers"
                    multiple={true}
                    labelKey={(option) =>
                      `${option.firstName} ${option.lastName}`
                    }
                    options={usersArr}
                    name="users"
                    selected={formData.users}
                    onChange={handleUserSelectChange}
                  />
                </Form.Group>
              </Form.Row>

              <Button type="submit">
                <Trans>{isEdit ? "Edit" : "Create"}</Trans>
              </Button>
            </Form>
            {/* {actionProcessing && <Loader />} */}

            {isEdit && (
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
                  <div
                    className="container dragula-container"
                    ref={dragulaDecorator}
                  >
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
