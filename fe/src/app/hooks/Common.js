import React, { useState } from "react";
import Swal2 from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export function useModuleInfoModal() {
  const [show, setShow] = useState(false);

  const handleShow = () => {
    console.log("info");
  };

  return { handleShow, show };
}

export const useSwalAlert = () => {
  const Swal = withReactContent(Swal2);

  return { Swal };
};
