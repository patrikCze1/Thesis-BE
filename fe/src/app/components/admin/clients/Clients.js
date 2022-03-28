import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "react-bootstrap";
import { Trans } from "react-i18next";

import ClientForm from "./ClientForm";
import ClientTableRow from "./ClientTableRow";
import Loader from "./../../common/Loader";
import {
  clearClientAction,
  loadClietntsAction,
} from "./../../../reducers/common/clientReducer";
import { usePagination } from "../../../hooks/usePagination";
import i18n from "../../../../i18n";

export default function Clients() {
  const dispatch = useDispatch();
  const paginationLimit = 20;

  const [showClientForm, setShowClientForm] = useState(false);
  const { clients, clientsLoaded, clientsCount } = useSelector(
    (state) => state.clientReducer
  );
  const [paginationOffset, renderPagination] = usePagination(
    paginationLimit,
    0,
    clientsCount
  );

  useEffect(() => {
    dispatch(loadClietntsAction(paginationOffset, paginationLimit));
  }, [paginationOffset]);

  const handleShowClientForm = () => {
    dispatch(clearClientAction());
    setShowClientForm(!showClientForm);
  };

  const renderedClients =
    clients &&
    clients.map((client) => {
      return <ClientTableRow key={client.id} client={client} />;
    });

  return (
    <div>
      <div className="page-header">
        <h3 className="page-title">
          <Trans>Clients</Trans>
        </h3>
        <div className="d-lg-flex flex-column flex-md-row ml-md-0 ml-md-auto my-2 wrapper">
          <div className="d-flex mt-4 mt-md-0">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleShowClientForm}
            >
              <Trans>Create</Trans>
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>
                        <Trans>Name</Trans>
                      </th>
                      <th>
                        <Trans>Email</Trans>
                      </th>
                      <th>
                        <Trans>Phone</Trans>
                      </th>
                      <th>
                        <Trans>Website</Trans>
                      </th>
                      <th className="text-center w-100px">
                        <Trans>Action</Trans>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.length > 0 ? (
                      renderedClients
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center">
                          {i18n.t("label.noRecords")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {clientsLoaded ? renderPagination() : <Loader />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showClientForm && (
        <Modal
          size="xxl"
          show={showClientForm}
          onHide={() => setShowClientForm(false)}
          aria-labelledby="example-modal-sizes-title-sm"
        >
          <Modal.Body>
            <button
              type="button"
              className="close close-modal"
              onClick={() => setShowClientForm(false)}
            >
              <span aria-hidden="true">×</span>
              <span className="sr-only">
                <Trans>Close</Trans>
              </span>
            </button>
            <ClientForm clientId={null} />
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}
