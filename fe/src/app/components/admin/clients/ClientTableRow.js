import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Modal, Dropdown } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";

import {
  clientDetailAction,
  deleteClientAction,
} from "../../../reducers/common/clientReducer";
import ClientForm from "./ClientForm";
import { useSwalAlert } from "../../../hooks/common";
import { parseJsonFromDb } from "../../../service/user/user.service";

export default function ClientTableRow({ client }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { Swal } = useSwalAlert();
  const emails = parseJsonFromDb(client.emails);
  const phones = parseJsonFromDb(client.phones);

  const [editClient, setEditClient] = useState(null);

  const handleClientEdit = (e) => {
    e.preventDefault();
    dispatch(clientDetailAction(client.id));
    setEditClient(client.id);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: "warning",
      title: t("Delete client") + "?",
      text: t("Client will be deleted", { client: client.name }),
      confirmButtonText: t("remove"),
      showCancelButton: true,
      cancelButtonText: t("cancel"),
    }).then((result) => {
      if (result.value) dispatch(deleteClientAction(client.id));
    });
  };

  return (
    <tr>
      <td>{client.name}</td>
      <td>
        {emails &&
          emails.map((email, i) => {
            return (
              <span key={i}>
                <a href={`mailto:${email}`}>{email}</a>
                <br />
              </span>
            );
          })}
      </td>
      <td>
        {phones &&
          phones.map((phone, i) => {
            return (
              <span key={i}>
                <a href={`tel:${phone}`}>{phone}</a>
                <br />
              </span>
            );
          })}
      </td>
      <td>
        {client.webpage && (
          <a href={`${client.webpage}`} target="_blank">
            <Trans>Website</Trans>
          </a>
        )}
      </td>
      <td className="text-center">
        <Dropdown>
          <Dropdown.Toggle variant="btn" id="dropdownMenuIconButton1">
            <i className="mdi mdi-dots-vertical"></i>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleClientEdit}>
              <Trans>Edit</Trans>
            </Dropdown.Item>
            <Dropdown.Item onClick={handleDeleteClick}>
              <Trans>Delete</Trans>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </td>

      {editClient && (
        <Modal
          size="md"
          show={editClient ? true : false}
          onHide={() => setEditClient(false)}
          aria-labelledby="example-modal-sizes-title-sm"
        >
          <Modal.Body>
            <button
              type="button"
              className="close close-modal"
              onClick={() => setEditClient(false)}
            >
              <span aria-hidden="true">×</span>
              <span className="sr-only">
                <Trans>Close</Trans>
              </span>
            </button>
            <ClientForm clientId={editClient} />
          </Modal.Body>
        </Modal>
      )}
    </tr>
  );
}
