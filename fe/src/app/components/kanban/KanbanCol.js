import React from "react";
import { Droppable } from "react-beautiful-dnd";
import KanbanTask from "./../task/KanbanTask";

export default function KanbanCol({ kanbanCol, tasks }) {
  return (
    <div className="kanban-col">
      <div className="board-wrapper p-3">
        <div className="board-portlet">
          <h4 className="portlet-heading text-dark">{kanbanCol.name}</h4>
        </div>
        <Droppable
          droppableId={`droppableCol-${kanbanCol.id}`}
          index={kanbanCol.id}
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
