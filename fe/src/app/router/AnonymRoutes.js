import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import Login from "../components/auth/Login";
import GoToLogin from "../components/auth/GoToLogin";
import ForgottenPassword from "../components/auth/ForgottenPassword";
import ResetPassword from "../components/auth/ResetPassword";
import { ROUTE } from "./../../utils/enum";
import i18n from "../../i18n";

export default function AnonymRoutes() {
  return (
    <Switch>
      <Route path={ROUTE.LOGIN}>
        <Login />
      </Route>
      <Route path={ROUTE.FORGOTTEN_PASSWORD}>
        <ForgottenPassword />
      </Route>
      <Route path={ROUTE.RESET_PASSWORD}>
        <ResetPassword />
      </Route>

      <Route exact path={ROUTE.HOME}>
        <Login />
      </Route>
      <Route>
        <GoToLogin />
      </Route>
    </Switch>
  );
}
