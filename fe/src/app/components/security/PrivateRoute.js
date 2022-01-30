import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

import { ROUTE } from "./../../../utils/enum";
import { hasRole } from "../../service/role.service";
import AccessDenied from "./../error/AccessDenied";

export default function PrivateRoute({ children, roles, ...rest }) {
  const { user } = useSelector((state) => state.currentUserReducer);

  if (!user || !user?.email) {
    return (
      <Redirect
        to={{
          pathname: ROUTE.LOGIN,
        }}
      />
    );
  }

  if (roles && !hasRole(roles, user.roles)) return <AccessDenied />;

  return <Route render={({ location }) => children} {...rest} />;
}
