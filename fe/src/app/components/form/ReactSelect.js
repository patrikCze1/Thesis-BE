import React from "react";
import Select from "react-select";
import i18n from "../../../i18n";

export default function ReactSelect({
  options,
  onChange,
  value,
  clearble = true,
  disabled = false,
}) {
  const selectedOption =
    value != null ? options.find((option) => option.value === value) : null;
  console.log("selectedOption", selectedOption, value, options);
  return (
    <Select
      options={options}
      className="fs-small"
      onChange={onChange}
      value={selectedOption}
      isClearable={clearble}
      isDisabled={disabled}
      placeholder={i18n.t("label.choose")}
      noOptionsMessage={() => i18n.t("label.noResults")}
    />
  );
}
