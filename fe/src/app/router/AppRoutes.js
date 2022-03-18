import React from "react";
import { Switch, Route } from "react-router-dom";

import Projects from "../components/project/ProjectsScreen";
import ProjectBoardsScreen from "../components/project/ProjectBoardsScreen";
import Dashboard from "../components/dashboard/Dashboard";
import KanbanTable from "../components/kanban/KanbanTable";
import Users from "../components/admin/users/Users";
import Groups from "../components/admin/groups/Groups";
import Clients from "../components/admin/clients/Clients";
import UserProfil from "../components/user/UserProfile";
import PrivateRoute from "../components/security/PrivateRoute";
import SearchResults from "../components/search/SearchResults";
import NotificationScreen from "../components/notification/NotificationScreen";
import TimeTrackScreen from "../components/timeTrack/TimeTrackScreen";
import ReportScreen from "../components/timeTrack/ReportScreen";
import TodoScreen from "../components/myTodo/TodoScreen";
import { ROLES, ROUTE } from "../../utils/enum";
import TaskArchiveScreen from "../components/task/TaskArchiveScreen";
import TaskBacklogScreen from "../components/task/TaskBacklogScreen";
import Login from "../components/auth/Login";
import ForgottenPassword from "../components/auth/ForgottenPassword";
import ResetPassword from "../components/auth/ResetPassword";

//https://reactnavigation.org/docs/auth-flow/
export default function AppRoutes() {
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

      <PrivateRoute path={ROUTE.PROJECTS_DETAIL_ARCHIVE}>
        <TaskArchiveScreen />
      </PrivateRoute>
      <PrivateRoute path={ROUTE.PROJECTS_DETAIL_BACKLOG}>
        <TaskBacklogScreen />
      </PrivateRoute>
      <PrivateRoute path={ROUTE.PROJECTS_BOARDS_DETAIL}>
        <KanbanTable />
      </PrivateRoute>
      <PrivateRoute path={ROUTE.PROJECTS_BOARDS}>
        <ProjectBoardsScreen />
      </PrivateRoute>
      <PrivateRoute path={ROUTE.PROJECTS}>
        <Projects />
      </PrivateRoute>
      <PrivateRoute path={ROUTE.NOTIFICATIONS}>
        <NotificationScreen />
      </PrivateRoute>
      <PrivateRoute path={ROUTE.TIME_TRACKS_REPORT}>
        <ReportScreen />
      </PrivateRoute>
      <PrivateRoute path={ROUTE.TIME_TRACKS}>
        <TimeTrackScreen />
      </PrivateRoute>

      <PrivateRoute path={ROUTE.TODO}>
        <TodoScreen />
      </PrivateRoute>

      <PrivateRoute path={ROUTE.USER_PROFIL}>
        <UserProfil />
      </PrivateRoute>

      <PrivateRoute path={ROUTE.SEARCH}>
        <SearchResults />
      </PrivateRoute>

      <PrivateRoute path={ROUTE.ADMIN_GROUP} roles={[ROLES.ADMIN]}>
        <Groups />
      </PrivateRoute>

      <PrivateRoute path={ROUTE.ADMIN_CLIENT} roles={[ROLES.ADMIN]}>
        <Clients />
      </PrivateRoute>

      <PrivateRoute path={ROUTE.ADMIN_USER} roles={[ROLES.ADMIN]}>
        <Users />
      </PrivateRoute>

      <PrivateRoute path={ROUTE.HOME}>
        <Dashboard />
      </PrivateRoute>
    </Switch>
  );
}
