import React from "react";
import ReactQuill from "react-quill";

export default function Quill({ onChange, prop, value }) {
  return (
    <ReactQuill
      onChange={(value, _, source) => {
        if (source === "user") onChange(prop, value);
      }}
      theme="snow"
      value={value || ""}
    />
  );
}
