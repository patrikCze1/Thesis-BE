import React, { useRef, useState } from "react";
import { Trans } from "react-i18next";
import ReactQuill from "react-quill";

export default function Editable({
  value,
  placeholder,
  name,
  type = "text",
  disabled = false,
  onSave,
  label = null,
}) {
  const [isEdited, setIsEdited] = useState(false);
  const [val, setVal] = useState(value);
  const valRef = useRef(value);

  const handleSave = () => {
    onSave(valRef.current);
    setIsEdited(false);
  };
  const handleCancel = () => {
    setVal(value);
    setIsEdited(false);
  };

  const handleEdit = () => {
    if (!disabled) {
      setVal(value);
      setIsEdited(true);
    }
  };

  const handleInputChange = (val) => {
    setVal(val);
    valRef.current = val;
  };

  const renderButtons = (
    <div className="mt-2">
      <button type="button" className="btn btn-primary" onClick={handleSave}>
        <Trans>label.save</Trans>
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleCancel}
      >
        <Trans>label.cancel</Trans>
      </button>
    </div>
  );

  if (!isEdited) {
    return (
      <div>
        {label && (
          <h6 className={!disabled && "editable-text"} onClick={handleEdit}>
            {label}
          </h6>
        )}
        {value && value.length > 0 ? (
          <span
            className={!disabled && "editable-text"}
            onClick={handleEdit}
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          <span className={!disabled && "editable-text"} onClick={handleEdit}>
            {placeholder}
          </span>
        )}
      </div>
    );
  }

  if (type === "text")
    return (
      <>
        <input
          type="text"
          className="form-control"
          name={name}
          placeholder={placeholder}
          value={val}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={disabled}
        />
        {renderButtons}
      </>
    );

  if (type === "quill")
    return (
      <>
        <ReactQuill
          value={val}
          onChange={(value) => handleInputChange(value)}
          theme={"snow"}
        />
        {renderButtons}
      </>
    );

  return <></>;
}
