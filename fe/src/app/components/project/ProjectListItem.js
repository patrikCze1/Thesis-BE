import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";
import { Dropdown } from "react-bootstrap";

import { Trans, useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { deleteProjectAction } from "./../../reducers/project/project.reducer";
import { routeEnum } from "../../enums/navigation/navigation";
import { PROJECT_STATE } from "../../enums";
import { hasRole } from "../../service/role.service";
import { ROLES } from "../../../utils/enum";

export default function ProjectListItem({ project }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const MySwal = withReactContent(Swal);
  const { user } = useSelector((state) => state.currentUserReducer);

  const handleEditClick = () => {
    history.push({
      search: `?upravit=${project.id}`,
    });
  };

  const handleDeleteClick = () => {
    MySwal.fire({
      icon: "warning",
      title: t("project.deleteProject") + "?",
      text: t("project.projectWillBeDeleted", {
        project: project.name,
      }),
      confirmButtonText: t("remove"),
      showCancelButton: true,
      cancelButtonText: t("cancel"),
    }).then((result) => {
      if (result.value) dispatch(deleteProjectAction(project.id));
    });
  };

  return (
    <tr>
      <td className="py-1">
        <NavLink
          to={`${routeEnum.PROJECTS}/${project.id}`}
          className="project-title"
        >
          {project.name}
        </NavLink>
      </td>
      <td>{project.Client && project.Client.name}</td>
      <td>
        <label className={`badge badge-${project.status}`}>
          <Trans>{PROJECT_STATE[project.status]}</Trans>
        </label>
      </td>
      <td className="text-center">
        {hasRole([ROLES.ADMIN, ROLES.MANAGER], user.roles) && (
          <Dropdown>
            <Dropdown.Toggle variant="btn">
              <i className="mdi mdi-dots-vertical"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleEditClick}>
                <Trans>Edit</Trans>
              </Dropdown.Item>
              <Dropdown.Item onClick={handleDeleteClick}>
                <Trans>Delete</Trans>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </td>
    </tr>
  );
}
