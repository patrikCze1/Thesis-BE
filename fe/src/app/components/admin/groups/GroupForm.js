import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import {
  createGroupAction,
  editGroupAction,
} from "./../../../reducers/user/groupReducer";
import { loadUsersAction } from "./../../../reducers/user/userReducer";
import { getFullName } from "../../../service/user/user.service";

export default function GroupForm({ closeModal }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const { group, error } = useSelector((state) => state.groupReducer);
  const { users, usersLoaded } = useSelector((state) => state.userReducer);
  const [dragState, setDragState] = useState({
    users: {},
    columns: {
      users: {
        title: t("Users"),
        users: [],
      },
      groupUsers: {
        title: t("Users of group"),
        users: [],
      },
    },
  });

  useEffect(() => {
    dispatch(loadUsersAction());
  }, [dispatch]);

  useEffect(() => {
    if (group.id && usersLoaded) {
      setFormData(group);
      setIsEdit(true);

      const groupUserIds = group.groupUsers.map((user) => user.id);

      const u = {};
      let userIds = [];
      for (const user of users) {
        u[user.id] = user;
        if (!groupUserIds.includes(user.id)) {
          userIds = [...userIds, user.id];
        }
      }

      setDragState({
        ...dragState,
        users: u,
        columns: {
          users: {
            ...dragState.columns.users,
            users: userIds,
          },
          groupUsers: {
            ...dragState.columns.groupUsers,
            users: groupUserIds,
          },
        },
      });
    }
    console.log(users);
  }, [group, users]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (isEdit) {
      const data = {
        ...formData,
        users: dragState.columns.groupUsers.users,
      };
      dispatch(editGroupAction(group.id, data));
    } else {
      dispatch(createGroupAction(formData));
    }
  };

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
    const start = dragState.columns[source.droppableId];
    const finish = dragState.columns[destination.droppableId];

    if (start === finish) return;

    const startUserIds = Array.from(start.users);
    startUserIds.splice(source.index, 1);
    const newStart = {
      ...start,
      users: startUserIds,
    };

    const finishUserIds = Array.from(finish.users);
    finishUserIds.splice(destination.index, 0, draggableId);

    const newFinish = {
      ...finish,
      users: finishUserIds,
    };

    const newState = {
      ...dragState,
      columns: {
        ...dragState.columns,
        [source.droppableId]: newStart,
        [destination.droppableId]: newFinish,
      },
    };
    setDragState(newState);
  };

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="card-body">
          <form className="forms-sample" onSubmit={handleSubmitForm}>
            {error && (
              <div role="alert" className="fade alert alert-danger show">
                {error}
              </div>
            )}
            <div className="row">
              <div className="col-md-12">
                <Form.Group>
                  <label htmlFor="name">
                    <Trans>Name</Trans>
                  </label>
                  <Form.Control
                    type="text"
                    id="name"
                    name="name"
                    placeholder={t("Name")}
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            {isEdit && (
              <div className="row">
                <div className="col-md-12">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="row mb-2">
                      {usersLoaded &&
                        Object.keys(dragState.columns).map((key, i) => {
                          console.log(dragState);
                          const users = dragState.columns[key].users.map(
                            (userId) => dragState.users[userId]
                          );
                          //return column.tittle;
                          return (
                            <Column
                              key={i}
                              column={dragState.columns[key]}
                              users={users}
                              index={key}
                            />
                          );
                        })}
                    </div>
                  </DragDropContext>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary mr-2">
              <Trans>Save</Trans>
            </button>
            <button
              className="btn btn-light"
              type="button"
              onClick={closeModal}
            >
              <Trans>Cancel</Trans>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Column({ users, column, index }) {
  return (
    <div className="col-6 group-dragable-col">
      <div className="border bg-secondary p-4">
        <div>
          <h6 className="card-title">{column.title}</h6>
        </div>
        <Droppable droppableId={index}>
          {(provided) => (
            <div
              className="kanbanHeight"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {users.map((user, index) => (
                <DraggableUser key={user.id} user={user} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}

export function DraggableUser({ user, index }) {
  return (
    <Draggable draggableId={`${user.id}`} index={index}>
      {(provided) => (
        <div
          className="mt-1 board-portlet"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <div className="card-body p-3 bg-white">
            <div className="media">
              <div className="media-body">
                <div className="d-flex">
                  <div>
                    <h6 className="mb-1">{getFullName(user)}</h6>
                    <p className="mb-0 text-muted">{user.position}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
