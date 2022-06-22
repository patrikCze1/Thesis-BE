import React from "react";
import { Switch, Route } from "react-router-dom";

import GoToLogin from "../components/auth/GoToLogin";
import ForgottenPassword from "../components/auth/ForgottenPassword";
import ResetPassword from "../components/auth/ResetPassword";
import { ROUTE } from "./../../utils/enum";
import { Login } from "../screen/auth";

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
