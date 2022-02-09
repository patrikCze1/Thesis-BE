import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trans } from "react-i18next";
import { useHistory } from "react-router-dom";

import {
  loadNotificationsAction,
  setSeenAction,
  setSeenAllAction,
} from "../../reducers/notification/notification.reducer";
import Loader from "../common/Loader";
import Pagination from "../common/Pagination";
import NotificationListItem from "./NotificationListItem";
import { ROUTE } from "../../../utils/enum";

export default function NotificationScreen() {
  const dispatch = useDispatch();
  const history = useHistory();
  const paginationLimit = 20;
  const currentPageRef = useRef(1);
  const [paginationOffset, setPaginationOffset] = useState(0);
  const { notifications, loaded, count, unreadCount } = useSelector(
    (state) => state.notificationReducer
  );

  useEffect(() => {
    dispatch(loadNotificationsAction(paginationOffset, paginationLimit));
  }, [paginationOffset]);

  const handleClick = (e, notification) => {
    e.preventDefault();
    if (notification.TaskNotification) {
      const { projectId, id } = notification.TaskNotification.task;
      history.push(`${ROUTE.PROJECTS}/${projectId}?ukol=${id}`);
    }
  };

  const handleSeen = (e, id, notification) => {
    e.preventDefault();

    dispatch(setSeenAction(id, notification));
  };

  const handleSeeAll = () => {
    if (unreadCount > 0) dispatch(setSeenAllAction());
  };

  const handleNextPage = (e) => {
    e.preventDefault();
    if (paginationOffset + paginationLimit <= count) {
      setPaginationOffset(paginationOffset + paginationLimit);
      currentPageRef.current = ++currentPageRef.current;
    }
  };

  const handlePrevPage = (e) => {
    e.preventDefault();
    if (paginationOffset >= paginationLimit) {
      setPaginationOffset(paginationOffset - paginationLimit);
      currentPageRef.current = --currentPageRef.current;
    }
  };

  const handlePageSelect = (page) => {
    currentPageRef.current = page;
    setPaginationOffset(paginationLimit * (page - 1));
  };

  return (
    <div className="col-12">
      <div className="page-header">
        <h4>
          <Trans>Notifications</Trans>
          {unreadCount > 0 && ` (${unreadCount})`}
        </h4>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between">
            <p className="card-description mb-1">
              <Trans>Newest notifications</Trans>
            </p>

            <button className="btn btn-icon-text" onClick={handleSeeAll}>
              <i className="mdi mdi-eye btn-icon-prepend"></i>
              <Trans>notification.readAll</Trans>
            </button>
          </div>

          {loaded ? (
            notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationListItem
                  key={notification.id}
                  notification={notification}
                  onClick={(e) => handleClick(e, notification)}
                  setSeen={(e) => handleSeen(e, notification.id, notification)}
                />
              ))
            ) : (
              <p className="text-center">
                <Trans>label.noRecords</Trans>
              </p>
            )
          ) : (
            <Loader />
          )}

          {loaded ? (
            <Pagination
              pages={Math.ceil(count / paginationLimit)}
              currentPage={currentPageRef.current}
              onClickNext={handleNextPage}
              onClickPrev={handlePrevPage}
              onClick={handlePageSelect}
            />
          ) : (
            <Loader />
          )}
        </div>
      </div>
    </div>
  );
}
