import React from "react";
import { Dropdown } from "react-bootstrap";
import { Trans } from "react-i18next";
import { useDispatch } from "react-redux";
import { useHistory, NavLink } from "react-router-dom";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

import i18n from "../../../../i18n";
import { ROLES, ROUTE } from "../../../../utils/enum";
import { deleteBoardAction } from "../../../reducers/project/board.reducer";
import { hasRole } from "../../../service/role.service";
import { createRouteWithParams } from "../../../service/router.service";

export default function BoardItem({ board, user }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const MySwal = withReactContent(Swal);

  const handleEditClick = () => {
    history.push({
      search: `?upravit=${board.id}`,
    });
  };

  const handleDeleteClick = () => {
    MySwal.fire({
      icon: "warning",
      title: i18n.t("board.deleteBoard") + "?",
      text: i18n.t("board.boardWillBeDeleted", {
        board: board.name,
      }),
      confirmButtonText: i18n.t("remove"),
      showCancelButton: true,
      cancelButtonText: i18n.t("cancel"),
    }).then((result) => {
      if (result.value) dispatch(deleteBoardAction(board.id));
    });
  };

  return (
    <div className="col-lg-4 col-md-6 col-sm-6 pb-4">
      <div className="card bg-primary">
        <div className="card-body">
          <div className=" d-flex justify-content-between">
            <NavLink
              to={createRouteWithParams(ROUTE.PROJECTS_BOARDS_DETAIL, {
                ":id": board.projectId,
                ":boardId": board.id,
              })}
            >
              <h3 className="font-weight-medium mb-0 text-white">
                {board.name}
              </h3>
            </NavLink>
            {hasRole([ROLES.ADMIN, ROLES.MANAGEMENT], user.roles) && (
              <Dropdown>
                <Dropdown.Toggle className="p-0">
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
          </div>
          {board.beginAt && board.endAt && (
            <p className="text-white">
              {board.beginAt &&
                new Intl.DateTimeFormat("cs-CZ", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }).format(new Date(board.beginAt))}{" "}
              -{" "}
              {board.endAt &&
                new Intl.DateTimeFormat("cs-CZ", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }).format(new Date(board.endAt))}
            </p>
          )}
          <p
            className=" mt-3 mb-0 text-white overflow-hidden"
            style={{ maxHeight: 100 }}
            dangerouslySetInnerHTML={{ __html: board.description }}
          ></p>
        </div>
      </div>
    </div>
  );
}
