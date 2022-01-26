import React, { useRef, useState } from "react";

import Pagination from "../components/common/Pagination";

/**
 *
 * @param {Number} limit
 * @param {Number} offset
 * @param {Number} count
 * @returns {Array} [offset, renderPagination]
 */
export function usePagination(limit, offset, count) {
  const [paginationOffset, setPaginationOffset] = useState(offset);
  const currentPageRef = useRef(1);

  const handleNextPage = (e) => {
    e.preventDefault();
    if (paginationOffset + limit <= count) {
      setPaginationOffset(paginationOffset + limit);
      currentPageRef.current = ++currentPageRef.current;
    }
  };

  const handlePrevPage = (e) => {
    e.preventDefault();
    if (paginationOffset >= limit) {
      setPaginationOffset(paginationOffset - limit);
      currentPageRef.current = --currentPageRef.current;
    }
  };

  const handlePageSelect = (page) => {
    currentPageRef.current = page;
    setPaginationOffset(limit * (page - 1));
  };

  const render = () => {
    return (
      <Pagination
        pages={Math.ceil(count / limit)}
        currentPage={currentPageRef.current}
        onClickNext={handleNextPage}
        onClickPrev={handlePrevPage}
        onClick={handlePageSelect}
      />
    );
  };

  return [paginationOffset, render];
}
