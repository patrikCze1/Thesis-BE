import React from "react";
import { useTranslation } from "react-i18next";

import AppColorPicker from "../../common/AppColorPicker";

export default function KanbanFilter({ filter, onChange, onClear }) {
  const { t } = useTranslation();

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    onChange(name, checked);
  };

  const handleChange = (prop, val) => {
    onChange(prop, val);
  };

  return (
    <div className="kanban-filter">
      <h4>{t("label.filter")}</h4>
      <div className="form-group">
        <div className="input-group">
          <input
            type="search"
            onInput={(e) => handleChange(e.target.name, e.target.value)}
            value={filter.query}
            placeholder={t("filter.taskQuery")}
            className="form-control"
            name="query"
          />
          <div className="input-group-append">
            <span className="input-group-text bg-white">
              <i className="mdi mdi-magnify"></i>
            </span>
          </div>
        </div>
      </div>

      <span className="filter-group-title">{t("filter.deadline")}</span>
      <div className="form-group">
        <div className="form-check form-check-primary">
          <label className="form-check-label">
            <input
              type="checkbox"
              name="afterDeadline"
              className="form-check-input"
              checked={filter.afterDeadline}
              onChange={handleCheckbox}
            />
            {t("filter.afterDeadline")}
            <i className="input-helper"></i>
          </label>
        </div>
        <div className="form-check form-check-primary">
          <label className="form-check-label">
            <input
              type="checkbox"
              name="beforeDeadline"
              className="form-check-input"
              checked={filter.beforeDeadline}
              onChange={handleCheckbox}
            />
            {t("filter.deadlineIn24Hours")}
            <i className="input-helper"></i>
          </label>
        </div>
      </div>
      <span className="filter-group-title">{t("filter.members")}</span>
      <div className="form-group">
        <div className="form-check form-check-primary">
          <label className="form-check-label">
            <input
              type="checkbox"
              name="assignedMe"
              className="form-check-input"
              checked={filter.assignedMe}
              onChange={handleCheckbox}
            />
            {t("filter.myTasks")}
            <i className="input-helper"></i>
          </label>
        </div>
        <div className="form-check form-check-primary">
          <label className="form-check-label">
            <input
              type="checkbox"
              name="notAssigned"
              className="form-check-input"
              checked={filter.notAssigned}
              onChange={handleCheckbox}
            />
            {t("filter.tasksWithoutUser")}
            <i className="input-helper"></i>
          </label>
        </div>
      </div>

      <span className="filter-group-title">{t("label.color")}</span>
      <AppColorPicker
        value={filter.color || "#ffffff"}
        onChangeComplete={(col) => handleChange("color", col.hex)}
        triangle="hide"
      />
      <div className="text-center mt-3">
        <button className="btn btn-link" onClick={onClear}>
          <i className="mdi mdi-filter-remove mr-1"></i>
          {t("filter.clearFilter")}
        </button>
      </div>
    </div>
  );
}
