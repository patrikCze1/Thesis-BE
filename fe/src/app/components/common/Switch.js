import React from "react";
import { Form } from "react-bootstrap";

export default function Switch({ name, value, label, onChange }) {
  return (
    <Form.Check
      type="switch"
      id="custom-switch"
      label={label}
      onChange={onChange}
      checked={value}
    />
  );
}
