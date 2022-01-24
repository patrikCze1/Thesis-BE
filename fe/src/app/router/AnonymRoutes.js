import React from "react";
import { Switch, Route } from "react-router-dom";

import Login from "../components/auth/Login";
import ForgottenPassword from "../components/auth/ForgottenPassword";
import ResetPassword from "../components/auth/ResetPassword";
import { routeEnum } from "../enums/navigation/navigation";

export default function AnonymRoutes() {
  return (
    <Switch>
      <Route path={routeEnum.LOGIN}>
        <Login />
      </Route>
      <Route path={routeEnum.FORGOTTEN_PASSWORD}>
        <ForgottenPassword />
      </Route>
      <Route path={routeEnum.RESET_PASSWORD}>
        <ResetPassword />
      </Route>
    </Switch>
  );
}
