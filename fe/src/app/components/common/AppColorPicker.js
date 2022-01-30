import React from "react";
import { GithubPicker } from "react-color";

import { TASK_COLORS } from "../../../utils/enum";

export default function AppColorPicker({
  onChangeComplete,
  value,
  triangle = "top-left",
}) {
  return (
    <GithubPicker
      onChangeComplete={onChangeComplete}
      color={value}
      colors={TASK_COLORS}
      triangle={triangle}
    />
  );
}
