import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { Router } from "react-router";
import { composeWithDevTools } from "redux-devtools-extension";
import { createBrowserHistory } from "history";

import App from "./app/App";
import reducers from "./app/reducers";
import "./i18n";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

require("dotenv").config({ path: "./../.env" });

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware));

const store = createStore(reducers, composedEnhancer);
const history = createBrowserHistory();

// remove logs
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById("root")
);

serviceWorkerRegistration.unregister();
