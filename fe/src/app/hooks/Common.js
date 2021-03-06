import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Swal2 from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import i18n from "../../i18n";

//todo render fn refresh parent compoennt
export function useModuleInfoModal(item) {
  const [show, setShow] = useState(false);
  console.log("item", item);
  const handleShowInfoModal = () => {
    console.log("handleShowInfoModal");
    setShow(!show);
  };

  /**
   *
   * @param {string} title
   * @param {string} content
   * @returns JSX Element | ''
   */
  const renderInfoModal = (title, content) => {
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
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: content }}></div>
            ) : (
              i18n.t("label.noDescription")
            )}
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
