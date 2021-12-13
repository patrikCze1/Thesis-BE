import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import { Trans, useTranslation } from "react-i18next";
import { Modal, Dropdown } from "react-bootstrap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import {
  loadUsersAction,
  loadUserDetailAction,
  clearUserDetailAction,
  deleteUserAction,
} from "./../../../reducers/user/userReducer";
import UserForm from "./UserForm";
import Loader from "./../../common/Loader";

const { SearchBar } = Search;

export default function Users() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();
  const MySwal = withReactContent(Swal);

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
        console.log(cell);
        if (cell) return cell.map((role) => t(`role.${role}`)).join(", ");
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
    dispatch(loadUsersAction());
  }, []);

  const handleCreateNewUser = () => {
    dispatch(clearUserDetailAction());
    setShowUserForm(true);
  };

  const handleUserDetail = (id) => {
    setShowUserForm(true);
    dispatch(loadUserDetailAction(id));
  };

  const tableRowEvents = {
    // onClick: (e, user, rowIndex) => {
    //   handleUserDetail(user.id);
    //   history.push({
    //     search: `?uzivatel=${user.id}`,
    //   });
    // },
  };

  const handleDelete = (id) => {
    MySwal.fire({
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
        <h3 className="page-title">
          <Trans>Users</Trans>
        </h3>
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
                            // defaultSorted={defaultSorted}
                            pagination={paginationFactory()}
                            {...props.baseProps}
                            wrapperClasses="table-responsive"
                            rowEvents={tableRowEvents}
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
          size="lg"
          show={showUserForm}
          onHide={handleCloseModal}
          aria-labelledby="example-modal-sizes-title-sm"
        >
          <div>
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
          </div>
        </Modal>
      )}
    </>
  );
}
