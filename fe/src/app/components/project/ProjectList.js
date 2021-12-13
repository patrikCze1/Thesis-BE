import React from "react";
import { Trans } from "react-i18next";

import ProjectListItem from "./ProjectListItem";

export default function ProjectList({ projects }) {
  return (
    <div className="grid-margin stretch-card">
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>
                <Trans>Title</Trans>
              </th>
              <th>
                <Trans>Client</Trans>
              </th>
              <th>
                <Trans>State</Trans>
              </th>
              <th className="text-center w-100px">
                <Trans>Action</Trans>
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              return <ProjectListItem key={project.id} project={project} />;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
