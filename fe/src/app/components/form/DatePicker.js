import React from "react";
import ReactDatePicker from "react-datepicker";

export default function DatePicker({ value, onChange, placeholderText }) {
  return (
    <ReactDatePicker
      selected={value}
      onChange={onChange}
      //   startDate={fromDate}
      //   endDate={toDate}
      //   selectsRange
      className="form-control"
      placeholderText={placeholderText}
      locale="cs"
      //   timeFormat="p"
      //   timeIntervals={15}
      dateFormat="P" //Pp
      //   showTimeSelect
      withPortal
      isClearable
    />
  );
}
