import React, { useEffect, useState } from "react";
import { Trans } from "react-i18next";
import { useHistory } from "react-router-dom";

import axios from "./../../../utils/axios.config";
import SearchResultItem from "./SearchResultItem";
import { ROUTE } from "../../../utils/enum";

export default function SearchResults() {
  const queryString = window.location.search;
  const sp = new URLSearchParams(queryString);
  const [query, setQuery] = useState(sp.get("q"));
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showPArticles, setShowPArticles] = useState(false);
  const history = useHistory();

  const fetchSearch = async () => {
    console.log("fetchSearch");
    if (query) {
      try {
        const res = await axios.get(`/api/search/?query=${query}`);

        setTasks(res.data.tasks);
        setProjects(res.data.projects);
      } catch (error) {
        console.log("search err", error);
      }
    }
  };

  useEffect(() => {
    setTasks([]);
    setProjects([]);
    console.log("search effect");
    setQuery(sp.get("q"));

    fetchSearch();
  }, [query, sp.get("q")]);

  const handleClickTask = (e, task) => {
    e.preventDefault();
    history.push(`${ROUTE.PROJECTS}/${task.projectId}/?ukol=${task.id}`);
  };

  const handleClickProject = (e, project) => {
    e.preventDefault();
    history.push(`${ROUTE.PROJECTS}/${project.id}`);
  };

  return (
    <div>
      <div className="page-header">
        <h3 className="page-title">
          <Trans>Search results</Trans>
        </h3>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-12 mb-5">
                  <h2>
                    <Trans>Search Result For</Trans>
                    <u className="ml-2">"{query}"</u>
                  </h2>
                </div>
                <div className="col-md-6">
                  <h3>
                    <Trans>Tasks</Trans>
                  </h3>

                  <div className="row">
                    {tasks.map((task, i) => (
                      <SearchResultItem
                        key={i}
                        title={task.title}
                        onClick={(e) => handleClickTask(e, task)}
                      />
                    ))}
                  </div>
                </div>

                <div className="col-md-6">
                  <h3>
                    <Trans>Projects</Trans>
                  </h3>
                  <div className="row">
                    {projects.map((project, i) => (
                      <SearchResultItem
                        key={i}
                        title={project.name}
                        onClick={(e) => handleClickProject(e, project)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
