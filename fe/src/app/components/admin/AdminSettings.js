import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "react-bootstrap";
import { Trans } from "react-i18next";

import ClientForm from "./clients/ClientForm";
import ClientTableRow from "./clients/ClientTableRow";
import Loader from "./../common/Loader";
import { loadClietntsAction } from "./../../reducers/common/clientReducer";

export default function AdminSettings() {
  const dispatch = useDispatch();

  const [showClientForm, setShowClientForm] = useState(false);

  useEffect(() => {
    dispatch(loadClietntsAction());
  }, []);

  const { clients, clientsLoaded } = useSelector(
    (state) => state.clientReducer
  );

  const handleShowClientForm = () => {
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
          <Trans>Administration</Trans>
        </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="!#">Tables</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Basic tables
            </li>
          </ol>
        </nav>
      </div>

      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">
                <Trans>Clients</Trans>

                <button
                  onClick={handleShowClientForm}
                  className="btn btn-primary btn-icon-text float-right"
                >
                  <i className="mdi mdi-plus-box btn-icon-prepend"></i>
                  <Trans>Add</Trans>
                </button>
              </h4>

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
                      <th>
                        <Trans>Action</Trans>
                      </th>
                    </tr>
                  </thead>
                  <tbody>{clientsLoaded && renderedClients}</tbody>
                </table>
                {!clientsLoaded && <Loader />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showClientForm && (
        <Modal
          size="md"
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
