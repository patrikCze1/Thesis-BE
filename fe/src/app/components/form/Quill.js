import React from "react";
import ReactQuill from "react-quill";

export default function Quill({ onChange, value }) {
  return (
    <ReactQuill
      onChange={(value, _, source) => {
        if (source === "user") onChange("description", value);
      }}
      theme="snow"
      value={value}
    />
  );
}
