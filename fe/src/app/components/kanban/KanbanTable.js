import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext } from "react-beautiful-dnd";
import { useParams, useHistory } from "react-router-dom";
import i18next from "i18next";
import { Trans, useTranslation } from "react-i18next";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";

import KanbanCol from "./KanbanCol";
import Loader from "./../common/Loader";
import TaskForm from "./../task/TaskForm";

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
  loadTaskDetailAction,
} from "./../../reducers/task/taskReducer";
import { loadUsersByProject } from "./../../reducers/user/userReducer";
import { getFullName, getShortName } from "../../service/user/user.service";
import {
  socketDeleteTask,
  socketEditTask,
  socketNewTask,
} from "./../../reducers/task/taskReducer";
import { getIo } from "../../../utils/websocket.config";
import { ioEnum } from "../../enums/websocket/io";
import { SOCKET } from "../../../utils/enum";

export default function KanbanTable() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();
  const { id } = useParams(); // project id

  const search = window.location.search;
  const params = new URLSearchParams(search);
  const selectedTask = params.get("ukol");

  const { project, projectLoaded, stages } = useSelector(
    (state) => state.projectReducer
  );
  const { tasks, task, taskLoaded } = useSelector((state) => state.taskReducer);
  const { users: projectUsers } = useSelector((state) => state.userReducer);

  const stageZero = {
    id: null,
    name: t("Unassigned"),
    order: 0,
  };

  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [tableState, setTableState] = useState({
    tasks: {},
    columns: {},
    columnOrder: [],
  });
  const [filteredUser, setFilteredUser] = useState(null);
  const [filterQuery, setFilterQuery] = useState(null);

  const handleWebsockets = () => {
    try {
      const socket = getIo();

      socket.on(ioEnum.TASK_NEW, (data) => {
        console.log("TASK_NEW", data);
        if (data.task.projectId == id) dispatch(socketNewTask(data.task));
      });
      socket.on(ioEnum.TASK_EDIT, (data) => {
        console.log("TASK_EDIT");
        if (data.task.projectId == id) dispatch(socketEditTask(data.task));
      });
      socket.on(ioEnum.TASK_DELETE, (data) => {
        dispatch(socketDeleteTask(data.id));
      });
      socket.on(SOCKET.PROJECT_STAGE_NEW, (data) => {
        if (data.stage.projectId == id) dispatch(socketNewStage(data.stage));
      });
      socket.on(SOCKET.PROJECT_STAGE_EDIT, (data) => {
        if (data.projectId == id)
          dispatch(socketEditStages([stageZero, ...data.stages]));
      });
      socket.on(SOCKET.PROJECT_STAGE_DELETE, (data) => {
        dispatch(socketDeleteStage(data.id));
      });
    } catch (error) {
      console.error(error);
    }
  };
  console.log("projectStages", stages);
  useEffect(() => {
    dispatch(loadProjectAction(id));
    dispatch(loadTasksAction(id));
    dispatch(loadUsersByProject(id));
    handleWebsockets();

    if (selectedTask) {
      dispatch(loadTaskDetailAction(id, selectedTask));
    }
  }, []);

  // useEffect(() => {
  //   if (project.projectStages)
  //     setProjectStages([stageZero, ...project.projectStages]);
  // }, [project]);

  useEffect(() => {
    refreshTableState();
  }, [tasks, stages]);
  console.log("tasks", tasks);
  const refreshTableState = () => {
    if (stages?.length) {
      const columnOrder = stages.sort((a, b) => {
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
    }
  };

  useEffect(() => {
    if (taskLoaded && selectedTask) {
      setShowTaskDetail(true);
    }
  }, [taskLoaded]);

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
        dispatch(editTaskAction(id, updatedTask.id, updatedTask));
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
      createTaskAction(id, {
        title: i18next.t("New task"),
        description: i18next.t("Description"),
        projectId: id,
      })
    );

    setShowTaskDetail(true);
  };

  const handleHideTaskDetail = () => {
    setShowTaskDetail(false);
    const queryParams = new URLSearchParams(window.location.search);

    if (queryParams.has("ukol")) {
      queryParams.delete("ukol");
      history.replace({
        search: queryParams.toString(),
      });
    }
  };

  const handleClickUserIcon = (e, user) => {
    e.preventDefault();
    console.log(user);

    if (user.id === filteredUser?.id) {
      setFilteredUser(null);
    } else {
      setFilteredUser(user);
    }
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
                    className={`text-avatar ${
                      filteredUser?.id === user.id ? "highlited" : ""
                    }`}
                    onClick={(e) => handleClickUserIcon(e, user)}
                  >
                    <span>{getShortName(user)}</span>
                  </a>
                </OverlayTrigger>
              ))}
          </div>
        </div>
        <div className="wrapper ml-auto  d-lg-flex flex-column flex-md-row kanban-toolbar my-2">
          <div className="d-flex mt-4 mt-md-0">
            <div className="input-group">
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
            </div>

            <button
              type="button"
              className="btn btn-primary btn-icon-text d-flex align-items-center"
              onClick={handleCreateTask}
            >
              <i class="mdi mdi-plus btn-icon-prepend"></i>
              <Trans>label.add</Trans>
            </button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-wrapper">
          {projectLoaded &&
            tableState.columnOrder.length &&
            tableState.columnOrder.map((columnOrder) => {
              const column =
                tableState.columns[`droppableCol-${columnOrder.id}`];
              const columnTasks = tableState.tasks.filter((task) => {
                if (filteredUser)
                  return (
                    task.projectStageId == column.id &&
                    task.solver?.id === filteredUser.id
                  );
                if (filterQuery)
                  return (
                    task.projectStageId == column.id &&
                    task.title.toLowerCase().includes(filterQuery.toLowerCase())
                  );
                else return task.projectStageId == column.id;
              });

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

      {showTaskDetail && (
        <Modal
          size="lg"
          show={showTaskDetail}
          onHide={handleHideTaskDetail}
          aria-labelledby="example-modal-sizes-title-sm"
        >
          {taskLoaded ? (
            <Modal.Body>
              <button
                type="button"
                className="close close-modal"
                onClick={() => setShowTaskDetail(false)}
              >
                <span aria-hidden="true">×</span>
                <span className="sr-only">
                  <Trans>Close</Trans>
                </span>
              </button>
              <TaskForm
                task={task}
                hideModal={() => setShowTaskDetail(false)}
              />
            </Modal.Body>
          ) : (
            <Loader />
          )}
        </Modal>
      )}
    </>
  );
}
