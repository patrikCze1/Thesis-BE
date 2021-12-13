import React from "react";

export default function GroupListItem({ group }) {
  return (
    <div className="row py-2">
      <div class="col-sm-12">
        <div class="d-flex justify-content-between pb-3 border-bottom">
          <span class="p">{group.name}</span>
        </div>
      </div>
    </div>
  );
}
