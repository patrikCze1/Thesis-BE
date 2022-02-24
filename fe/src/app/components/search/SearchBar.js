import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Autosuggest from "react-autosuggest";
import { useHistory } from "react-router-dom";

import axios from "./../../../utils/axios.config";
import { ROUTE } from "../../../utils/enum";
import { createRouteWithParams } from "../../service/router.service";

const getSuggestionValue = (suggestion) => suggestion.text;

const renderSuggestion = (suggestion) => <div>{suggestion.text}</div>;

const renderSectionTitle = (section) => {
  return <strong>{section.title}</strong>;
};

const getSectionSuggestions = (section) => {
  return section.suggestions;
};

// const renderInputComponent = (inputProps) => (
//   <div>
//     <input className="form-control" {...inputProps} />
//   </div>
// );

export default function SearchBar() {
  const { t } = useTranslation();
  const history = useHistory();

  const [suggestions, setSuggestions] = useState([]);
  const [value, setValue] = useState("");

  const onSuggestionSelected = (
    e,
    { suggestion, sectionIndex, suggestionIndex }
  ) => {
    console.log("suggestion", suggestion);
    e.preventDefault();
    setSuggestions([]);
    if (sectionIndex === 0) {
      //project
      history.push(
        createRouteWithParams(ROUTE.PROJECTS_BOARDS, { ":id": suggestion.id })
      );
    } else if (sectionIndex === 1) {
      //task
      if (suggestion.boardId)
        history.push(
          createRouteWithParams(ROUTE.PROJECTS_BOARDS_DETAIL, {
            ":id": suggestion.projectId,
            ":boardId": suggestion.boardId,
          }) + `?ukol=${suggestion.id}`
        );
      else
        history.push(
          createRouteWithParams(ROUTE.PROJECTS_DETAIL_BACKLOG, {
            ":id": suggestion.projectId,
          }) + `?ukol=${suggestion.id}`
        );
    }
    setValue("");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    history.push(`/hledat?q=${value}`);
  };

  // Autosuggest will call this function every time you need to update suggestions.
  const onSuggestionsFetchRequested = async ({ value }) => {
    if (value.length > 2) {
      try {
        const res = await axios.get(`/api/search/?query=${value}`);

        const { tasks, projects } = res.data;
        const taskSuggestions = tasks.map((task) => ({
          id: task.id,
          text: task.name,
          projectId: task.projectId,
          boardId: task.boardId,
        }));
        const projectSuggestions = projects.map((project) => ({
          id: project.id,
          text: project.name,
        }));
        setSuggestions([
          {
            title: t("Projects"),
            suggestions: projectSuggestions,
          },
          {
            title: t("Tasks"),
            suggestions: taskSuggestions,
          },
        ]);
      } catch (error) {
        console.log("search err", error);
      }
    }
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onChange = (event, { newValue }) => {
    setValue(newValue);
  };

  const inputProps = {
    placeholder: t("Search"),
    value,
    onChange: onChange,
  };

  return (
    <form
      className="nav-link form-inline mt-2 mt-md-0 p-relative autocomplete-wrapper"
      method="get"
      onSubmit={handleSearch}
    >
      <div className="input-group">
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
          multiSection
          renderSectionTitle={renderSectionTitle}
          getSectionSuggestions={getSectionSuggestions}
          // alwaysRenderSuggestions
          onSuggestionSelected={onSuggestionSelected}
        />
        <div className="input-group-append">
          <a onClick={(e) => handleSearch(e)} className="input-group-text">
            <i className="mdi mdi-magnify"></i>
          </a>
        </div>
      </div>
    </form>
  );
}
