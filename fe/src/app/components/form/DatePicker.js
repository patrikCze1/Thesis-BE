import React from "react";
import ReactDatePicker from "react-datepicker";

export default function DatePicker({
  value,
  onChange,
  placeholder,
  required = false,
}) {
  if (typeof value === "string") value = new Date(value);
  return (
    <ReactDatePicker
      selected={value}
      onChange={onChange}
      //   startDate={fromDate}
      //   endDate={toDate}
      //   selectsRange
      className="form-control"
      placeholderText={placeholder}
      locale="cs"
      //   timeFormat="p"
      //   timeIntervals={15}
      dateFormat="P" //Pp
      //   showTimeSelect
      withPortal
      isClearable
      required={required}
    />
  );
}
