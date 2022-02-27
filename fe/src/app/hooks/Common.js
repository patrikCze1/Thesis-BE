import React, { useEffect, useState } from "react";
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
          size="lg"
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

export const useScript = (url) => {
  useEffect(() => {
    const script = document.createElement("script");

    script.src = url;
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [url]);
};

export const useGoogleCharts = () => {
  const [google, setGoogle] = useState(null);

  useEffect(() => {
    if (!google) {
      const head = document.head;
      let script = document.getElementById("googleChartsScript");
      if (!script) {
        script = document.createElement("script");
        script.src = "https://www.gstatic.com/charts/loader.js";
        script.id = "googleChartsScript";
        script.onload = () => {
          if (window.google && window.google.charts) {
            window.google.charts.load("current", { packages: ["corechart"] });

            window.google.charts.setOnLoadCallback(() =>
              setGoogle(window.google)
            );
          }
        };
        head.appendChild(script);
      } else if (
        window.google &&
        window.google.charts &&
        window.google.visualization
      ) {
        setGoogle(window.google);
      }
    }

    return () => {
      let script = document.getElementById("googleChartsScript");
      if (script) {
        script.remove();
      }
    };
  }, [google]);

  return google;
};
