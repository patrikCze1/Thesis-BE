import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Swal2 from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import i18n from "../../i18n";

export function useModuleInfoModal() {
  const [show, setShow] = useState(false);

  const handleShowInfoModal = () => {
    console.log("handleShowInfoModal");
    setShow(!show);
  };

  const renderInfoModal = (title, content) => {
    console.log("renderInfoModal", show);
    if (show)
      return (
        <Modal
          size="md"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          onHide={() => setShow(false)}
          show={show}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              {title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {content ? content : i18n.t("label.noDescription")}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setShow(false)}>
              {i18n.t("label.close")}
            </Button>
          </Modal.Footer>
        </Modal>
      );
    else return "";
  };

  return { handleShowInfoModal, renderInfoModal };
}

export const useSwalAlert = () => {
  const Swal = withReactContent(Swal2);

  return { Swal };
};
