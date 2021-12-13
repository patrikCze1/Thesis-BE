import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Trans } from "react-i18next";

export default function Dropzone({ onSubmit }) {
  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
    noKeyboard: true,
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
    },
  });
  console.log("acceptedFiles", files);

  const handleSubmit = () => {
    onSubmit(acceptedFiles);
    setFiles([]);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((val, i) => i !== index));
  };

  return (
    <div>
      <div
        {...getRootProps({ className: "dropzone" })}
        style={{
          //   minHeight: "100px",
          border: "1px solid #ebedf2",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <input {...getInputProps()} />
        <p className="text-center mb-0">
          <Trans>task.uploadFiles</Trans>
        </p>
        {/* <button
          type="button"
          onClick={open}
          className="btn btn-primary mt-auto"
        >
          <Trans>task.uploadFiles</Trans>
        </button> */}
      </div>
      <aside>
        {files.length > 0 && (
          <h5 className="my-2">
            <Trans>label.files</Trans>
          </h5>
        )}
        <ul className="list-ticked">
          {files.map((file, i) => {
            console.log("file", file.name, i);
            return (
              <li key={i} className="d-flex">
                <i className="mdi mdi-check-all mr-1"></i>
                {file.name}
                <button
                  className="btn btn-link p-0 d-inline-block text-right ml-auto"
                  onClick={() => handleRemoveFile(i)}
                >
                  <i className="mdi mdi-close-circle-outline text-danger "></i>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
      <button
        onClick={handleSubmit}
        className="btn btn-primary  d-block ml-auto"
      >
        <Trans>label.upload</Trans>
      </button>
    </div>
  );
}
