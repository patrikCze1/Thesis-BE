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

export default function ProjectForm({ projectId = false, closeForm }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
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
                firstName: user.firstName,
                lastName: user.lastName,
              };
            })
          : [],
        createdById: project.createdById,
        status: project.status || 1,
      });
    }

    if (projectId || Object.keys(project).length > 0) setIsEdit(true);
  }, [project]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === true) {
      const data = {
        ...formData,
        clientId: formData.clientId?.length ? formData.clientId[0].value : null,
        users: formData.users?.map((user) => user.value) || [],
        groups: formData.groups?.map((group) => group.value) || [],
      };
      console.log("data", data);
      if (projectId || project.id) {
        dispatch(editProjectAction(project.id, data));
      } else {
        dispatch(createProjectAction(data));
        closeForm();
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
                    // maxLength={10}
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
