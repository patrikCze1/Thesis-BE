import React from "react";
import { Droppable } from "react-beautiful-dnd";
import KanbanTask from "./../task/KanbanTask";

export default function KanbanCol({ kanbanCol, tasks }) {
  // dont display first column if is empty
  if (kanbanCol.id === null && !tasks.length > 0) return "";

  const isColFull = () => {
    return kanbanCol.limit !== null && kanbanCol.limit <= tasks.length;
  };

  return (
    <div className="kanban-col">
      <div className="board-wrapper p-3">
        <div className="board-portlet">
          <h4 className="portlet-heading text-dark">
            <span
              className={`kanban-col-type-${kanbanCol.type} px-2 board-portlet`}
            >
              {kanbanCol.name}
            </span>{" "}
            <small className={`${isColFull() ? "text-danger" : ""}`}>
              ({tasks.length}
              {kanbanCol.limit ? ` / ${kanbanCol.limit}` : ""})
            </small>
          </h4>
        </div>

        <Droppable
          droppableId={`droppableCol-${kanbanCol.id}`}
          index={kanbanCol.id}
          isDropDisabled={isColFull()}
        >
          {(provided) => (
            <div
              className="kanbanHeight"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {tasks.map((task, index) => (
                <KanbanTask key={task.id} task={task} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}
