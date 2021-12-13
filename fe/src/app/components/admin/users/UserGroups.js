import React, { useEffect } from "react";
import { Trans } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { loadGroupsAction } from "../../../reducers/user/groupReducer";
import GroupListItem from "../groups/GroupListItem";
import Loader from "./../../common/Loader";

export default function UserGroups({ userId }) {
  const dispatch = useDispatch();

  const { groups, groupsLoaded } = useSelector((state) => state.groupReducer);

  useEffect(() => {
    dispatch(loadGroupsAction(`?userId=${userId}`));
  }, [userId]);

  let renderedUserGroups;

  if (groups.length > 0)
    renderedUserGroups = groups.map((group) => <GroupListItem group={group} />);
  else
    renderedUserGroups = (
      <p className="text-center">
        <Trans>user.userHasNotGroups</Trans>.
      </p>
    );

  return (
    <div className="card-body">
      <h4 className="card-title">
        <Trans>user.groups</Trans>
      </h4>
      {groupsLoaded ? renderedUserGroups : <Loader />}
    </div>
  );
}
