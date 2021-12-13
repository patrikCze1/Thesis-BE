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

export default function TodoScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { todos } = useSelector((state) => state.todoReducer);

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
              />
              <button
                type="submit"
                className="btn btn-primary font-weight-bold ml-0 ml-sm-2 mt-2 mt-sm-0"
              >
                <Trans>Add</Trans>
              </button>
            </form>
            <div className="list-wrapper">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
