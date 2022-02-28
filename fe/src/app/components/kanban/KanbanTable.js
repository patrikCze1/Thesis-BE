import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext } from "react-beautiful-dnd";
import { useParams, NavLink } from "react-router-dom";
import i18next from "i18next";
import { Trans, useTranslation } from "react-i18next";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";

import KanbanCol from "./KanbanCol";
import Loader from "./../common/Loader";

import {} from "./../../reducers/project/project.reducer";
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
import { ROLES, ROUTE, SOCKET, TASK_ACTION_TYPE } from "../../../utils/enum";
import KanbanFilter from "./component/KanbanFilter";
import i18n from "../../../i18n";
import { createRouteWithParams } from "../../service/router.service";
import { useCreateTask, useTaskDetail } from "../../hooks/task";
import { useProjectDetail } from "../../hooks/project";
import {
  loadBoardDetailAction,
  socketDeleteStage,
  socketEditStages,
  socketNewStage,
} from "../../reducers/project/board.reducer";
import BoardStagesForm from "../board/component/BoardStagesForm";
import { hasRole } from "../../service/role.service";
import { useModuleInfoModal } from "../../hooks/common";

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
  const { id: projectId, boardId } = useParams();
  const { renderModal } = useTaskDetail(projectId, TASK_ACTION_TYPE.NORMAL);
  const { renderForm, setShowNewTaskForm, showNewTaskForm } = useCreateTask(
    projectId,
    boardId
  );
  const { project, projectLoaded } = useProjectDetail(projectId);
  const { handleShowInfoModal, renderInfoModal } = useModuleInfoModal();

  const { tasks } = useSelector((state) => state.taskReducer);
  const { users: projectUsers } = useSelector((state) => state.userReducer);
  const { user: currentUser } = useSelector(
    (state) => state.currentUserReducer
  );
  const { board, stages } = useSelector((state) => state.boardReducer);

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
  const [showBoardSettings, setShowBoardSettings] = useState(false);

  const handleWebsockets = () => {
    const socket = getIo();
    console.log("handleWebsockets");
    try {
      socket.on(SOCKET.TASK_NEW, (data) => {
        console.log("socket TASK_NEW", data);
        if (data.task.boardId == boardId) dispatch(socketNewTask(data.task));
      });
      socket.on(SOCKET.TASK_EDIT, (data) => {
        console.log("socket TASK_EDIT");
        if (data.task.boardId == boardId) dispatch(socketEditTask(data.task));
      });
      socket.on(SOCKET.TASK_DELETE, (data) => {
        console.log("socket.on(SOCKET.TASK_DELETE data", data);
        dispatch(socketDeleteTask(data.id));
      });
      socket.on(SOCKET.BOARD_STAGE_NEW, (data) => {
        if (data.stage.boardId == boardId) dispatch(socketNewStage(data.stage));
      });
      socket.on(SOCKET.BOARD_STAGE_EDIT, (data) => {
        if (data.boardId == boardId) dispatch(socketEditStages(data.stages));
      });
      socket.on(SOCKET.BOARD_STAGE_DELETE, (data) => {
        dispatch(socketDeleteStage(data.id));
      });
    } catch (error) {
      console.error(error);
    }

    return socket;
  };
  console.log("projectStages", stages);

  useEffect(() => {
    dispatch(
      loadTasksAction(
        projectId,
        `?archived=false&boardId=${boardId}&orderBy=priority` //&stageId=!%3Dnull
      )
    );
    dispatch(loadBoardDetailAction(projectId, boardId));
    const sockets = handleWebsockets();

    return () => {
      console.log("close sockets");
      sockets?.close();
    };
  }, [projectId, boardId]);

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
      columns[`droppableCol-${col.id}`] = col;
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
      destination.droppableId === source.droppableId
      // && destination.index === source.index // handle order in col
    ) {
      return;
    }

    const updatedTasks = tableState.tasks.map((task) => {
      const index = draggableId.indexOf("-");

      if (task.id == draggableId.substring(index + 1)) {
        const updatedTask = {
          ...task, // todo remove not needed
          stageId: tableState.columns[destination.droppableId].id,
        };
        dispatch(
          editTaskAction(
            TASK_ACTION_TYPE.NORMAL,
            projectId,
            task.id,
            updatedTask
          )
        );
        return updatedTask;
      }
      return task;
    });

    setTableState({
      ...tableState,
      tasks: updatedTasks,
    });
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
    <div className="d-flex flex-column h-100 kanban-page-content">
      <div className="d-flex align-items-center flex-wrap pb-4">
        <div className="wrapper d-flex align-items-center">
          <h4 className="mb-md-0 mb-4 text-dark">
            <NavLink
              to={createRouteWithParams(ROUTE.PROJECTS_BOARDS, {
                ":id": projectId,
              })}
            >
              {project?.name}
            </NavLink>{" "}
            / {board?.name}
          </h4>

          <button
            onClick={handleShowInfoModal}
            className="ml-1 p-0 btn btn-link"
          >
            <i className="mdi mdi-information-outline"></i>
          </button>

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
                title={i18n.t("label.filter")}
              >
                <i className="mdi mdi-filter-remove text-danger"></i>
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary btn-icon-text d-flex align-items-center"
              onClick={() => setShowNewTaskForm(!showNewTaskForm)}
            >
              <i className="mdi mdi-plus btn-icon-prepend"></i>
              <Trans>label.add</Trans>
            </button>

            {/* <NavLink
              to={createRouteWithParams(ROUTE.PROJECTS_DETAIL_ARCHIVE, {
                ":id": projectId,
              })}
              title={i18n.t("task.archive")}
              className="btn btn-icons bg-white align-items-center d-flex"
            >
              <i className="mdi mdi-archive"></i>
            </NavLink> */}

            {hasRole([ROLES.MANAGEMENT, ROLES.ADMIN], currentUser.roles) && (
              <button
                type="button"
                className="btn btn-icons bg-white mr-0"
                title={i18n.t("board.editStages")}
                onClick={() => setShowBoardSettings(true)}
              >
                <i className="mdi mdi-menu"></i>
              </button>
            )}
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

      {renderForm()}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-wrapper h-100">
          {projectLoaded &&
            tableState.columnOrder.length &&
            tableState.columnOrder.map((columnOrder) => {
              const column =
                tableState.columns[`droppableCol-${columnOrder.id}`];
              const columnTasks = tableState.tasks.filter((task) => {
                if (isFiltered())
                  return (
                    task.stageId == column.id &&
                    ((filterObject.notAssigned && task.solverId === null) ||
                      (filterObject.assignedMe &&
                        task.solverId === currentUser.id) ||
                      (filterObject.query &&
                        task.name
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
                else return task.stageId == column.id;
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

      {showBoardSettings && (
        <Modal
          size="xxl"
          show={showBoardSettings}
          onHide={() => setShowBoardSettings(false)}
          aria-labelledby="example-modal-sizes-title-sm"
        >
          <Modal.Body>
            <button
              type="button"
              className="close close-modal"
              onClick={() => setShowBoardSettings(false)}
            >
              <span aria-hidden="true">×</span>
              <span className="sr-only">
                <Trans>Close</Trans>
              </span>
            </button>
            <BoardStagesForm boardId={boardId} />
          </Modal.Body>
        </Modal>
      )}

      {renderInfoModal(i18n.t("label.boardDescription", board.description))}
    </div>
  );
}
