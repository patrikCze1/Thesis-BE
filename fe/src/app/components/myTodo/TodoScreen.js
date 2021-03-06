import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trans, useTranslation } from "react-i18next";

import TodoListItem from "./TodoListItem";
import {
  createTodoAction,
  deleteTodoAction,
  editTodoAction,
  loadTodosAction,
} from "../../reducers/myTodo/myTodo.reducer";
import { useModuleInfoModal } from "../../hooks/common";
import i18n from "../../../i18n";
import { Loader } from "../common";

export default function TodoScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { handleShowInfoModal, renderInfoModal } = useModuleInfoModal();

  const { todos, loaded } = useSelector((state) => state.todoReducer);

  const [todoName, setTodoName] = useState(null);

  useEffect(() => {
    dispatch(loadTodosAction());
  }, []);

  const handleNameInput = (e) => {
    setTodoName(e.target.value);
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (todoName && todoName.length > 0) dispatch(createTodoAction(todoName));
    setTodoName("");
  };

  const handleRemoveTodo = (id) => {
    console.log("remove todo", id);
    dispatch(deleteTodoAction(id));
  };

  const handleComplete = (id, completed) => {
    console.log("complete todo", id);
    dispatch(editTodoAction(id, { completed }));
  };

  //todo add delete all completed function
  return (
    <div className="row">
      <div className="col-12">
        <div className="page-header">
          <h4 className="card-title">
            <Trans>menu.myTodos</Trans>
            <button
              onClick={handleShowInfoModal}
              className="ml-1 p-0 btn btn-link"
            >
              <i className="mdi mdi-information-outline"></i>
            </button>
          </h4>
        </div>
        <div className="card px-3">
          <div className="card-body">
            <form className="add-items d-sm-flex" onSubmit={handleAddTodo}>
              <input
                type="text"
                className="form-control h-auto"
                placeholder={t("todo.name")}
                value={todoName}
                onInput={handleNameInput}
                required
                maxLength="255"
              />
              <button
                type="submit"
                className="btn btn-primary font-weight-bold ml-0 ml-sm-2 mt-2 mt-sm-0"
              >
                <Trans>Add</Trans>
              </button>
            </form>
            <div className="list-wrapper todo-list">
              {loaded ? (
                todos.length > 0 ? (
                  <ul className="d-flex flex-column todo-list">
                    {todos.map((todo, i) => {
                      return (
                        <TodoListItem
                          todo={todo}
                          onComplete={handleComplete}
                          onDelete={handleRemoveTodo}
                          key={i}
                        />
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-center">{i18n.t("label.noRecords")}</p>
                )
              ) : (
                <Loader />
              )}
            </div>
          </div>
        </div>
      </div>
      {renderInfoModal(i18n.t("label.info"), i18n.t("todo.infoText"))}
    </div>
  );
}
