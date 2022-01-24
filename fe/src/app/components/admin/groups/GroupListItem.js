import React from "react";

export default function GroupListItem({ group }) {
  return (
    <div className="row py-2">
      <div className="col-sm-12">
        <div className="d-flex justify-content-between pb-3 border-bottom">
          <span className="p">{group.name}</span>
        </div>
      </div>
    </div>
  );
}
