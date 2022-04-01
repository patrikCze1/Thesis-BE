import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Col, Button } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { Typeahead } from "react-bootstrap-typeahead";

import {
  createProjectAction,
  editProjectAction,
  loadProjectAction,
} from "../../../reducers/project/project.reducer";
import { loadClietntsAction } from "../../../reducers/common/clientReducer";
import { loadGroupsAction } from "../../../reducers/user/groupReducer";
import { loadUsersAction } from "../../../reducers/user/userReducer";

import Loader from "../../common/Loader";
import { getFullName } from "../../../service/user/user.service";
import LoaderTransparent from "../../common/LoaderTransparent";
import { PROJECT_STATE } from "../../../../utils/enum";
import Quill from "../../form/Quill";
import { DatePicker } from "../../form";
import i18n from "../../../../i18n";
import { Switch } from "../../common";

export default function ProjectForm({ projectId = false, closeForm }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showDates, setShowDates] = useState(false);
  const { clients } = useSelector((state) => state.clientReducer);
  const { groups } = useSelector((state) => state.groupReducer);
  const { users } = useSelector((state) => state.userReducer);
  const { project, projectLoaded, savingProject } = useSelector(
    (state) => state.projectReducer
  );
  const { user: currentUser } = useSelector(
    (state) => state.currentUserReducer
  );
  const [isEdit, setIsEdit] = useState(projectId ? true : false);
  const [formData, setFormData] = useState({ ...project });
  console.log("users", users);
  useEffect(() => {
    console.log("ProjectForm effect projectId project", projectId, project);
    dispatch(loadClietntsAction());
    dispatch(loadGroupsAction());
    dispatch(loadUsersAction());
  }, []);

  useEffect(() => {
    if (project && Object.keys(project).length > 0) {
      setFormData({
        ...formData,
        name: project.name || "",
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
                label: getFullName(user),
              };
            })
          : [],
        createdById: project.createdById,
        status: project.status || 1,
        beginAt: project.beginAt,
        deadline: project.deadline,
      });
    }

    if (projectId || Object.keys(project).length > 0) {
      setIsEdit(true);
      if (project.beginAt || project.deadline) setShowDates(true);
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === true) {
      const data = {
        ...formData,
        clientId: formData.clientId?.length ? formData.clientId[0].value : null,
        users: formData.users?.map((user) => user.value) || [],
        groups: formData.groups?.map((group) => group.value) || [],
      };
      if (!showDates) {
        data.beginAt = null;
        data.deadline = null;
      }
      console.log("data", data);
      if (projectId || project.id) {
        dispatch(editProjectAction(project.id, data));
      } else {
        const success = await dispatch(createProjectAction(data));
        if (success) closeForm();
      }
    }
  };

  const handleChange = (prop, val) => {
    console.log("handleChange", formData, prop, val);
    setFormData({
      ...formData,
      [prop]: val,
    });
  };

  const clietnsArr = clients.map((client) => {
    return { value: client.id, label: client.name };
  });

  const groupsArr = groups.map((group) => {
    return { value: group.id, label: group.name };
  });

  const usersArr = users.map((user) => {
    return {
      value: user.id,
      label: getFullName(user),
    };
  });
  console.log("users", users);
  if (!projectLoaded) {
    return <Loader />;
  }
  console.log("formData", formData);
  console.log("usersArr", usersArr);
  return (
    <div className="row">
      <div className="col-md-12 grid-margin">
        <div>
          <div className="card-body">
            <Form onSubmit={handleSubmit} className="position-relative">
              <Form.Row>
                <Form.Group as={Col} md="5">
                  <Form.Label>
                    <Trans>project.name</Trans>
                  </Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder=""
                    name="name"
                    value={formData.name}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    maxLength={255}
                  />
                </Form.Group>

                <Form.Group as={Col} md="3">
                  <Form.Label>
                    <Trans>project.key</Trans>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=""
                    name="key"
                    value={formData.key}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    maxLength={10}
                  />
                </Form.Group>

                <Form.Group as={Col} md="4">
                  <Form.Label>
                    <Trans>project.status</Trans>
                  </Form.Label>
                  <select
                    className="form-control"
                    name="status"
                    value={formData.status || 5}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                  >
                    {Object.keys(PROJECT_STATE).map((key, i) => {
                      return (
                        <option value={key} key={i}>
                          {t(PROJECT_STATE[key])}
                        </option>
                      );
                    })}
                  </select>
                </Form.Group>

                <Form.Group as={Col} md="6">
                  <Form.Label>
                    <Trans>Client</Trans>
                  </Form.Label>
                  <Typeahead
                    id="projectClient"
                    options={clietnsArr}
                    name="clientId"
                    selected={formData.clientId}
                    onChange={(val) => handleChange("clientId", val)}
                  />
                </Form.Group>

                <Form.Group as={Col} md="6">
                  <Form.Label>
                    <Trans>project.creator</Trans>
                  </Form.Label>
                  <select
                    className="form-control"
                    name="createdById"
                    value={formData.createdById}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    disabled={currentUser.id != formData.createdById}
                  >
                    <option>{t("project.creator")}</option>
                    {users &&
                      users.map((user, i) => {
                        return (
                          <option value={user.id} key={i}>
                            {getFullName(user)}
                          </option>
                        );
                      })}
                  </select>
                </Form.Group>
              </Form.Row>

              <div className="form-group mb-2">
                <div className="form-check">
                  <label className="form-check-label">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      onClick={() => setShowDates(!showDates)}
                      value={showDates ? "checked" : ""}
                    />
                    <i className="input-helper"></i>
                    <Trans>board.setDeadlines</Trans>
                  </label>
                </div>
              </div>

              {showDates && (
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <DatePicker
                      value={formData.beginAt}
                      onChange={(val) => handleChange("beginAt", val)}
                      placeholder={i18n.t("label.beginAt")}
                      required={showDates}
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <DatePicker
                      value={formData.deadline}
                      onChange={(val) => handleChange("deadline", val)}
                      placeholder={i18n.t("label.deadline")}
                      // required={showDates}
                    />
                  </div>
                </div>
              )}

              {/* <Form.Row>
                <div className="form-group col-md-6">
                  <label className="form-label">
                    <Trans>project.timeBudget</Trans>
                  </label>

                  <Form.Group>
                    <div className="input-group">
                      
                      <Form.Control
                        type="text"
                        className="form-control"
                        aria-label="Amount"
                        placeholder=""
                        name="timeBudget"
                        value={formData.timeBudget}
                        onChange={(e) =>
                          handleChange(e.target.name, e.target.value)
                        }
                      />
                      <div className="input-group-append">
                        <span className="input-group-text">Hod</span>
                      </div>
                    </div>
                  </Form.Group>
                </div>

                <div className="form-group col-md-6">
                  <label className="form-label">
                    <Trans>project.priceBudget</Trans>
                  </label>

                  <Form.Group>
                    <div className="input-group">
                      <Form.Control
                        type="text"
                        className="form-control"
                        aria-label="Amount"
                        placeholder=""
                        name="priceBudget"
                        value={formData.priceBudget}
                        onChange={(e) =>
                          handleChange(e.target.name, e.target.value)
                        }
                      />
                      <div className="input-group-append">
                        <span className="input-group-text">Kc</span>
                      </div>
                    </div>
                  </Form.Group>
                </div>
              </Form.Row> */}

              <Form.Row>
                <div className="form-group col-md-12">
                  <label className="form-label">
                    <Trans>Description</Trans>
                  </label>

                  <Quill
                    onChange={handleChange}
                    value={formData.description}
                    prop="description"
                  />
                </div>
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
                    labelKey={(option) => option.label}
                    name="groups"
                    selected={formData.groups}
                    onChange={(val) => handleChange("groups", val)}
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
                    labelKey={(option) => option.label}
                    options={usersArr}
                    name="users"
                    selected={formData.users}
                    onChange={(val) => handleChange("users", val)}
                  />
                </Form.Group>
              </Form.Row>

              <Button type="submit">
                <Trans>{isEdit ? "Edit" : "Create"}</Trans>
              </Button>
              {savingProject && <LoaderTransparent />}
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
