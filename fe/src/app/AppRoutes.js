import React from "react";
import { Switch, Route } from "react-router-dom";

import Projects from "./components/project/Projects";
import Dashboard from "./components/dashboard/Dashboard";
import KanbanTable from "./components/kanban/KanbanTable";
import Login from "./components/auth/Login";
import ForgottenPassword from "./components/auth/ForgottenPassword";
import ResetPassword from "./components/auth/ResetPassword";
import Users from "./components/admin/users/Users";
import Groups from "./components/admin/groups/Groups";
import Clients from "./components/admin/clients/Clients";
import UserProfil from "./components/user/UserProfile";
import PrivateRoute from "./components/security/PrivateRoute";
import SearchResults from "./components/search/SearchResults";
import { routeEnum } from "./enums/navigation/navigation";
import NotificationScreen from "./components/notification/NotificationScreen";
import TimeTrackScreen from "./components/timeTrack/TimeTrackScreen";
import ReportScreen from "./components/timeTrack/ReportScreen";
import TodoScreen from "./components/myTodo/TodoScreen";
import { ROLES } from "../utils/enum";

export default function AppRoutes() {
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

      <PrivateRoute path={routeEnum.PROJECTS_DETAIL}>
        <KanbanTable />
      </PrivateRoute>
      <PrivateRoute path={routeEnum.PROJECTS}>
        <Projects />
      </PrivateRoute>
      <PrivateRoute path={routeEnum.NOTIFICATIONS}>
        <NotificationScreen />
      </PrivateRoute>
      <PrivateRoute path={routeEnum.TIME_TRACKS_REPORT}>
        <ReportScreen />
      </PrivateRoute>
      <PrivateRoute path={routeEnum.TIME_TRACKS}>
        <TimeTrackScreen />
      </PrivateRoute>

      <PrivateRoute path={routeEnum.TODO}>
        <TodoScreen />
      </PrivateRoute>

      <PrivateRoute path={routeEnum.USER_PROFIL}>
        <UserProfil />
      </PrivateRoute>

      <PrivateRoute path={routeEnum.SEARCH}>
        <SearchResults />
      </PrivateRoute>

      <PrivateRoute path={routeEnum.ADMIN_GROUP} roles={[ROLES.ADMIN]}>
        <Groups />
      </PrivateRoute>

      <PrivateRoute path={routeEnum.ADMIN_CLIENT} roles={[ROLES.ADMIN]}>
        <Clients />
      </PrivateRoute>

      <PrivateRoute path={routeEnum.ADMIN_USER} roles={[ROLES.ADMIN]}>
        <Users />
      </PrivateRoute>

      <PrivateRoute path={routeEnum.HOME}>
        <Dashboard />
      </PrivateRoute>
    </Switch>
  );
}
