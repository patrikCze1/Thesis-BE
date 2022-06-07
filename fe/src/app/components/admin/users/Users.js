import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import { Trans, useTranslation } from "react-i18next";
import { Modal, Dropdown } from "react-bootstrap";

import {
  loadUsersAction,
  loadUserDetailAction,
  clearUserDetailAction,
  deleteUserAction,
  editUserAction,
} from "./../../../reducers/user/userReducer";
import UserForm from "./UserForm";
import Loader from "./../../common/Loader";
import i18n from "../../../../i18n";
import { useModuleInfoModal, useSwalAlert } from "../../../hooks/common";
import { parseJsonFromDb } from "../../../service/user/user.service";

const { SearchBar } = Search;

export default function Users() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();
  const { Swal } = useSwalAlert();
  const { renderInfoModal, handleShowInfoModal } = useModuleInfoModal();

  const columns = [
    {
      dataField: "lastName",
      text: t("Last name"),
      sort: true,
    },
    {
      dataField: "firstName",
      text: t("First name"),
      sort: true,
    },
    {
      dataField: "position",
      text: t("Position"),
      sort: true,
    },
    // {
    //   dataField: "createdAt",
    //   text: t("Created at"),
    //   sort: true,
    //   formatter: (cell) => {
    //     return new Intl.DateTimeFormat("cs-CZ", {
    //       year: "numeric",
    //       month: "2-digit",
    //       day: "2-digit",
    //     }).format(new Date(cell));
    //   },
    // },
    {
      dataField: "roles",
      text: t("user.role"),
      formatter: (cell) => {
        console.log("cell", cell);
        // console.log("parseRolesFromDb(cell.roles)", parseRolesFromDb(cell));
        if (cell) {
          const roles = parseJsonFromDb(cell);
          return roles.map((role) => t(`role.${role}`)).join(", ");
        }
        return "";
      },
    },
    {
      dataField: "action",
      text: t("Action"),
      sort: false,
      classes: "text-center w-100px",
      headerClasses: "text-center w-100px",
      formatter: (_, user) => {
        return (
          <Dropdown>
            <Dropdown.Toggle variant="btn">
              <i className="mdi mdi-dots-vertical"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleUserDetail(user.id)}>
                <Trans>Edit</Trans>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => handleDeactivate(user.id, !user.deactivated)}
              >
                {user.deactivated ? (
                  <Trans>label.activate</Trans>
                ) : (
                  <Trans>label.deactivate</Trans>
                )}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleDelete(user.id)}>
                <Trans>Delete</Trans>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        );
      },
    },
  ];

  const { users, usersLoaded } = useSelector((state) => state.userReducer);
  const [showUserForm, setShowUserForm] = useState(false);

  useEffect(() => {
    dispatch(loadUsersAction("?withDeactivated=true"));
  }, []);

  const handleCreateNewUser = () => {
    dispatch(clearUserDetailAction());
    setShowUserForm(true);
  };

  const handleUserDetail = (id) => {
    setShowUserForm(true);
    dispatch(loadUserDetailAction(id));
  };

  const handleDeactivate = (id, deactivated) => {
    dispatch(editUserAction(id, { deactivated }));
  };

  const handleDelete = (id) => {
    Swal.fire({
      icon: "warning",
      title: t("user.deleteUser") + "?",
      text: t("user.userWillBeDeleted"),
      confirmButtonText: t("remove"),
      showCancelButton: true,
      cancelButtonText: t("cancel"),
    }).then((result) => {
      if (result.value) dispatch(deleteUserAction(id));
    });
  };

  const handleCloseModal = () => {
    setShowUserForm(false);

    const queryParams = new URLSearchParams(window.location.search);

    if (queryParams.has("uzivatel")) {
      queryParams.delete("uzivatel");
      history.replace({
        search: queryParams.toString(),
      });
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">
          <Trans>Users</Trans>

          <button
            onClick={handleShowInfoModal}
            className="ml-1 p-0 btn btn-link"
          >
            <i className="mdi mdi-information-outline"></i>
          </button>
        </h1>
        <div className="d-lg-flex flex-column flex-md-row ml-md-0 ml-md-auto my-2 wrapper">
          <div className="d-flex mt-4 mt-md-0">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateNewUser}
            >
              <Trans>Create</Trans>
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-12">
                  {usersLoaded ? (
                    <ToolkitProvider
                      keyField="id"
                      bootstrap4
                      data={users}
                      columns={columns}
                      search
                    >
                      {(props) => (
                        <div>
                          <div className="d-flex align-items-center">
                            <SearchBar
                              {...props.searchProps}
                              placeholder={t("label.search")}
                            />
                          </div>
                          <BootstrapTable
                            hover
                            pagination={paginationFactory()}
                            {...props.baseProps}
                            wrapperClasses="table-responsive"
                            noDataIndication={i18n.t("label.noRecords")}
                            rowClasses={(user, i) => {
                              if (user.deactivated)
                                return "table-warning line-through";
                            }}
                            classes=""
                          />
                        </div>
                      )}
                    </ToolkitProvider>
                  ) : (
                    <Loader />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showUserForm && (
        <Modal
          size="xxl"
          show={showUserForm}
          onHide={handleCloseModal}
          aria-labelledby="example-modal-sizes-title-sm"
        >
          <Modal.Body>
            <button
              type="button"
              className="close close-modal"
              onClick={() => handleCloseModal()}
            >
              <span aria-hidden="true">×</span>
              <span className="sr-only">
                <Trans>Close</Trans>
              </span>
            </button>
            <UserForm closeModal={handleCloseModal} />
          </Modal.Body>
        </Modal>
      )}

      {renderInfoModal(i18n.t("Users"), i18n.t("user.infoText"))}
    </>
  );
}
