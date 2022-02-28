import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import { Trans, useTranslation } from "react-i18next";
import { Modal, Dropdown } from "react-bootstrap";

import {
  loadGroupsAction,
  loadGroupDetailAction,
  clearGroupDetailAction,
  deleteGroupAction,
} from "./../../../reducers/user/groupReducer";
import GroupForm from "./GroupForm";
import Loader from "../../common/Loader";
import i18n from "../../../../i18n";
import { useSwalAlert } from "../../../hooks/common";

const { SearchBar } = Search;

export default function Groups() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { Swal } = useSwalAlert();
  const { groups, groupsLoaded } = useSelector((state) => state.groupReducer);
  const [showGroupForm, setShowGroupForm] = useState(false);

  const columns = [
    {
      dataField: "name",
      text: t("label.name"),
      sort: true,
    },
    {
      dataField: "createdAt",
      text: t("group.createdAt"),
      sort: true,
      formatter: (cell) => {
        return new Intl.DateTimeFormat("cs-CZ", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(cell));
      },
    },
    {
      dataField: "action",
      text: t("Action"),
      sort: false,
      classes: "text-center w-100px",
      headerClasses: "text-center w-100px",
      formatter: (_, group) => {
        return (
          <Dropdown>
            <Dropdown.Toggle variant="btn">
              <i className="mdi mdi-dots-vertical"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleShowGroupDetail(group.id)}>
                <Trans>Edit</Trans>
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleDeleteGroup(group.id)}>
                <Trans>Delete</Trans>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        );
      },
    },
  ];

  useEffect(() => {
    dispatch(loadGroupsAction());
  }, [dispatch]);

  const handleShowGroupDetail = (id) => {
    setShowGroupForm(true);
    dispatch(loadGroupDetailAction(id));
  };

  const handleCreateNewGroup = () => {
    dispatch(clearGroupDetailAction());
    setShowGroupForm(true);
  };

  const handleCloseModal = () => {
    setShowGroupForm(false);
  };

  const handleDeleteGroup = (id) => {
    Swal.fire({
      icon: "warning",
      title: t("group.deleteGroup") + "?",
      text: t("group.groupWillBeDeleted"),
      confirmButtonText: t("remove"),
      showCancelButton: true,
      cancelButtonText: t("cancel"),
    }).then((result) => {
      if (result.value) dispatch(deleteGroupAction(id));
    });
  };
  console.log("groupsLoaded", groupsLoaded);
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">
          <Trans>Groups</Trans>
        </h1>
        <div className="d-lg-flex flex-column flex-md-row ml-md-0 ml-md-auto my-2 wrapper">
          <div className="d-flex mt-4 mt-md-0">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateNewGroup}
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
                  {groupsLoaded ? (
                    <ToolkitProvider
                      keyField="id"
                      bootstrap4
                      data={groups}
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
                            // wrapperClasses="table-responsive"
                            noDataIndication={i18n.t("label.noRecords")}
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

      {showGroupForm && (
        <Modal
          size="xxl"
          show={showGroupForm}
          onHide={handleCloseModal}
          aria-labelledby="example-modal-sizes-title-sm"
        >
          <Modal.Body>
            <button
              type="button"
              className="close close-modal"
              onClick={handleCloseModal}
            >
              <span aria-hidden="true">×</span>
              <span className="sr-only">
                <Trans>Close</Trans>
              </span>
            </button>
            <GroupForm closeModal={handleCloseModal} />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}
