import React, { useState } from "react";

export function useModuleInfoModal() {
  const [show, setShow] = useState(false);

  const handleShow = () => {
    console.log("info");
  };

  return { handleShow, show };
}
