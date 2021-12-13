import React from "react";

export default function SearchResultItem({ title, onClick }) {
  return (
    <div className="col-12 results">
      <div className="pt-2 border-bottom">
        <a className="d-block h4 text-dark" href="!#" onClick={onClick}>
          {title}
        </a>
      </div>
    </div>
  );
}
