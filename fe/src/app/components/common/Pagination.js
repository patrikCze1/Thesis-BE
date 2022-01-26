import React, { useEffect, useState } from "react";
import { Trans } from "react-i18next";

export default function Pagination({
  pages,
  currentPage = 1,
  onClickPrev,
  onClickNext,
  onClick,
}) {
  const [pagination, setPagination] = useState([]);

  const handlePageSelect = (e, page) => {
    e.preventDefault();
    onClick(page);
  };

  const getPaginationItems = () => {
    const paginationItems = [...Array(pages).keys()].map((i) => (
      <li
        className={`page-item ${currentPage} ${i} ${
          currentPage === i + 1 ? "active" : null
        }`}
        key={i}
      >
        <a
          className="page-link"
          role="button"
          href={`?strana=${i + 1}`}
          onClick={(e) => handlePageSelect(e, i + 1)}
        >
          {i + 1}
        </a>
      </li>
    ));
    setPagination(paginationItems);
  };

  useEffect(() => {
    getPaginationItems();
  }, [currentPage, pages]);

  if (pagination.length <= 1) return <></>;

  return (
    <div className="text-center mt-3">
      <ul className="rounded-flat pagination justify-content-center">
        <li className="page-item">
          <a className="page-link" role="button" href="#" onClick={onClickPrev}>
            <span aria-hidden="true">‹</span>
            <span className="sr-only">
              <Trans>pagination.previous</Trans>
            </span>
          </a>
        </li>

        {pagination}

        <li className="page-item">
          <a className="page-link" role="button" href="#" onClick={onClickNext}>
            <span aria-hidden="true">›</span>
            <span className="sr-only">
              <Trans>pagination.next</Trans>
            </span>
          </a>
        </li>
      </ul>
    </div>
  );
}
