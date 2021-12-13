import React, { useState } from "react";

export default function TodoListItem({ todo, onDelete, onComplete }) {
  const [isCompleted, setIsCompleted] = useState(todo.completed ? true : false);

  const handleComplete = () => {
    onComplete(todo.id, !isCompleted);
    setIsCompleted(!isCompleted);
  };

  return (
    <li className={isCompleted ? "completed" : null}>
      <div className="form-check">
        <label htmlFor="" className="form-check-label">
          <input
            className="checkbox"
            type="checkbox"
            checked={isCompleted}
            onInput={handleComplete}
          />
          {todo.name}
          <i className="input-helper"></i>
        </label>
      </div>
      <i
        className="remove mdi mdi-close-circle-outline"
        onClick={() => onDelete(todo.id)}
      ></i>
    </li>
  );
}
