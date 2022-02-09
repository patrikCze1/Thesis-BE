import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext } from "react-beautiful-dnd";
import { useParams, NavLink } from "react-router-dom";
import i18next from "i18next";
import { Trans, useTranslation } from "react-i18next";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import KanbanCol from "./KanbanCol";
import Loader from "./../common/Loader";

import {
  loadProjectAction,
  socketDeleteStage,
  socketEditStages,
  socketNewStage,
} from "./../../reducers/project/project.reducer";
import {
  loadTasksAction,
  editTaskAction,
  createTaskAction,
} from "../../reducers/task/task.reducer";
import { loadUsersByProject } from "./../../reducers/user/userReducer";
import { getFullName, getShortName } from "../../service/user/user.service";
import {
  socketDeleteTask,
  socketEditTask,
  socketNewTask,
} from "../../reducers/task/task.reducer";
import { getIo } from "../../../utils/websocket.config";
import { ROUTE, SOCKET } from "../../../utils/enum";
import KanbanFilter from "./component/KanbanFilter";
import i18n from "../../../i18n";
import { createRouteWithParams } from "../../service/router.service";
import { useTaskDetail } from "../../hooks/task";
import { useProjectDetail } from "../../hooks/project";

// const initialFilter = {
//   query: "",
//   color: "",
//   afterDeadline: false,
//   beforeDeadline: false,
//   assignedMe: false,
//   notAssigned: false,
// };

export default function KanbanTable() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { id: projectId } = useParams();
  const { renderModal, setShowTaskDetail } = useTaskDetail(projectId);
  const { project, projectLoaded, stages } = useProjectDetail(projectId);

  const { tasks } = useSelector((state) => state.taskReducer);
  const { users: projectUsers } = useSelector((state) => state.userReducer);
  const { user: currentUser } = useSelector(
    (state) => state.currentUserReducer
  );

  const stageZero = {
    id: null,
    name: t("Unassigned"),
    order: 0,
  };

  const [tableState, setTableState] = useState({
    tasks: {},
    columns: {},
    columnOrder: [],
  });
  const [showFilter, setShowFilter] = useState(false);
  const [filterObject, setFilterObject] = useState({});

  const handleWebsockets = () => {
    const socket = getIo();
    console.log("handleWebsockets");
    try {
      socket.on(SOCKET.TASK_NEW, (data) => {
        console.log("socket TASK_NEW", data);
        if (data.task.projectId == projectId)
          dispatch(socketNewTask(data.task));
      });
      socket.on(SOCKET.TASK_EDIT, (data) => {
        console.log("socket TASK_EDIT");
        if (data.task.projectId == projectId)
          dispatch(socketEditTask(data.task));
      });
      socket.on(SOCKET.TASK_DELETE, (data) => {
        console.log("socket.on(SOCKET.TASK_DELETE data", data);
        dispatch(socketDeleteTask(data.id));
      });
      socket.on(SOCKET.PROJECT_STAGE_NEW, (data) => {
        if (data.stage.projectId == projectId)
          dispatch(socketNewStage(data.stage));
      });
      socket.on(SOCKET.PROJECT_STAGE_EDIT, (data) => {
        if (data.projectId == projectId)
          dispatch(socketEditStages([stageZero, ...data.stages]));
      });
      socket.on(SOCKET.PROJECT_STAGE_DELETE, (data) => {
        dispatch(socketDeleteStage(data.id));
      });
    } catch (error) {
      console.error(error);
    }

    return socket;
  };
  console.log("projectStages", stages);

  useEffect(() => {
    dispatch(loadTasksAction(projectId, "?archive=false"));
    const sockets = handleWebsockets();

    // if (selectedTask) {
    //   dispatch(loadTaskDetailAction(projectId, selectedTask));
    // }

    return () => {
      console.log("close sockets");
      sockets?.close();
    };
  }, [projectId]);

  // useEffect(() => {
  //   if (project.projectStages)
  //     setProjectStages([stageZero, ...project.projectStages]);
  // }, [project]);

  useEffect(() => {
    refreshTableState();
  }, [tasks, stages]);

  console.log("tasks", tasks);
  const refreshTableState = () => {
    const stagesWithFirstCol = [stageZero, ...stages];

    const columnOrder = stagesWithFirstCol.sort((a, b) => {
      if (a.order < b.order) return -1;
      if (a.order > b.order) return 1;
      return 0;
    });

    const columns = {
      "droppableCol-null": stageZero,
    };
    for (const col of stages) {
      columns[`droppableCol-${col.id}`] = {
        id: col.id,
        name: col.name,
      };
    }

    // const tableTasks = {};
    // for (const task of tasks) {
    //   tableTasks[`draggableTask-${task.id}`] = {
    //     id: task.id,
    //     projectStage: task.projectStage,
    //   };
    // }
    console.log("setTableState");

    setTableState({
      ...tableState,
      tasks,
      columns,
      columnOrder,
    });
  };
  console.log("tableState", tableState);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const updatedTasks = tableState.tasks.map((task) => {
      const index = draggableId.indexOf("-");

      if (task.id == draggableId.substring(index + 1)) {
        const updatedTask = {
          ...task,
          projectStageId: tableState.columns[destination.droppableId].id,
        };
        dispatch(editTaskAction(projectId, updatedTask.id, updatedTask));
        return updatedTask;
      }
      return task;
    });

    setTableState({
      ...tableState,
      tasks: updatedTasks,
    });
  };

  const handleCreateTask = () => {
    dispatch(
      createTaskAction(projectId, {
        title: i18next.t("New task"),
        description: i18next.t("Description"),
        projectId,
      })
    );

    setShowTaskDetail(true);
  };

  // const handleClickUserIcon = (e, user) => {
  //   e.preventDefault();
  //   console.log("handleClickUserIcon", user);

  //   if (user.id === filteredUser?.id) {
  //     setFilteredUser(null);
  //   } else {
  //     setFilteredUser(user);
  //   }
  // };

  const handleShowFilter = () => {
    setShowFilter(!showFilter);
  };

  const handleClearFilter = () => {
    setFilterObject({});
    setShowFilter(false);
  };

  const handleUpdateFilter = (prop, val) => {
    console.log("handleUpdateFilter", prop, val);
    if (prop === "color" && val === "#ffffff") val = null;
    setFilterObject({ ...filterObject, [prop]: val });
  };

  const isFiltered = () => {
    for (const key in filterObject) {
      if (filterObject[key]) {
        return true;
      }
    }
    return false;
  };

  if (!projectLoaded) {
    return <Loader />;
  }

  return (
    <>
      <div className="d-flex align-items-center flex-wrap pb-4">
        <div className="wrapper d-flex align-items-center">
          <h4 className="mb-md-0 mb-4 text-dark">{project.name}</h4>

          <div className="image-grouped ml-md-4">
            {projectUsers &&
              projectUsers.map((user, i) => (
                <OverlayTrigger
                  key={i}
                  overlay={
                    <Tooltip id="tooltip-disabled">
                      <Trans>{getFullName(user)}</Trans>
                    </Tooltip>
                  }
                >
                  <a
                    href="#!"
                    className="text-avatar"
                    // className={`text-avatar ${
                    //   filteredUser?.id === user.id ? "highlited" : ""
                    // }`}
                    onClick={(e) => e.preventDefault()}
                    // onClick={(e) => handleClickUserIcon(e, user)}
                  >
                    <span>{getShortName(user)}</span>
                  </a>
                </OverlayTrigger>
              ))}
          </div>
        </div>
        <div className="wrapper ml-auto  d-lg-flex flex-column flex-md-row kanban-toolbar my-2">
          <div className="d-flex mt-4 mt-md-0">
            {/* <div className="input-group">
              <input
                type="search"
                onInput={(e) => setFilterQuery(e.target.value)}
                value={filterQuery}
                placeholder={t("Search")}
                className="form-control"
              />
              <div className="input-group-append">
                <span className="input-group-text bg-white">
                  <i className="mdi mdi-magnify"></i>
                </span>
              </div>
            </div> */}

            <button
              type="button"
              className={`btn btn-icon bg-white  ${
                isFiltered() && "btn-inverse-primary"
              }`}
              onClick={handleShowFilter}
            >
              <i className="mdi mdi-filter-outline text-primary"></i>
            </button>
            {isFiltered() && (
              <button
                type="button"
                className={`btn btn-icon ml-0 `}
                onClick={() => handleClearFilter()}
              >
                <i className="mdi mdi-filter-remove text-danger"></i>
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary btn-icon-text d-flex align-items-center"
              onClick={handleCreateTask}
            >
              <i className="mdi mdi-plus btn-icon-prepend"></i>
              <Trans>label.add</Trans>
            </button>

            <NavLink
              to={createRouteWithParams(ROUTE.PROJECTS_DETAIL_ARCHIVE, {
                ":id": projectId,
              })}
              title={i18n.t("task.archive")}
              className="btn btn-icons bg-white align-items-center d-flex"
            >
              <i className="mdi mdi-archive"></i>
            </NavLink>
          </div>
        </div>
      </div>

      {showFilter && (
        <div style={{ position: "relative" }}>
          <KanbanFilter
            onChange={handleUpdateFilter}
            filter={filterObject}
            onClear={handleClearFilter}
          />
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-wrapper">
          {projectLoaded &&
            tableState.columnOrder.length &&
            tableState.columnOrder.map((columnOrder) => {
              const column =
                tableState.columns[`droppableCol-${columnOrder.id}`];
              const columnTasks = tableState.tasks.filter((task) => {
                if (isFiltered())
                  return (
                    task.projectStageId == column.id &&
                    ((filterObject.notAssigned && task.solverId === null) ||
                      (filterObject.assignedMe &&
                        task.solverId === currentUser.id) ||
                      (filterObject.query &&
                        task.title
                          .toLowerCase()
                          .includes(filterObject.query?.toLowerCase())) ||
                      (filterObject.query &&
                        String(task.number).includes(filterObject.query)) ||
                      (filterObject.color &&
                        filterObject.color === task.colorCode) ||
                      (filterObject.afterDeadline &&
                        task.deadline != null &&
                        new Date() > new Date(task.deadline)) ||
                      (filterObject.beforeDeadline &&
                        task.deadline != null &&
                        new Date(Date.now() - 86400000) <
                          new Date(task.deadline)))
                    // task.solver?.id === filteredUser.id
                  );
                else return task.projectStageId == column.id;
              });
              console.log("columnTasks", columnTasks, column);
              return (
                <KanbanCol
                  key={column.id}
                  kanbanCol={column}
                  tasks={columnTasks}
                />
              );
            })}
        </div>
      </DragDropContext>

      {renderModal()}
    </>
  );
}
