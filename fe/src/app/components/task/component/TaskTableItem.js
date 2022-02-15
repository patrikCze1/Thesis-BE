import React from "react";

export default function TaskTableItem({ task }) {
  return (
    <tr>
      <td> {task.number} </td>
      <td> {task.title} </td>
      <td></td>
      <td> $ 77.99 </td>
      <td> May 15, 2015 </td>
    </tr>
  );
}
