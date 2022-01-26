import React, { useEffect, useState } from "react";
import { Trans } from "react-i18next";

const DOTS = "...";

export default function Pagination({
  pages,
  currentPage = 1,
  onClickPrev,
  onClickNext,
  onClick,
}) {
  const [pagination, setPagination] = useState([]);
  const siblingCount = 1;

  const handlePageSelect = (e, page) => {
    e.preventDefault();
    onClick(page);
  };

  const paginationRange = getPaginationRange(siblingCount, currentPage, pages);

  const getPaginationItems = () => {
    const paginationItems = paginationRange.map((i) => (
      <li
        className={`page-item ${currentPage === i ? "active" : null}`}
        key={i}
      >
        {i === DOTS ? (
          <span className="page-link">{i}</span>
        ) : (
          <a
            className="page-link"
            role="button"
            href={`?strana=${i}`}
            onClick={(e) => handlePageSelect(e, i)}
          >
            {i}
          </a>
        )}
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

function range(start, end) {
  let length = end - start + 1;
  /*
    Create an array of certain length and set the elements within it from
    start value to end value.
  */
  return Array.from({ length }, (_, idx) => idx + start);
}

function getPaginationRange(siblingCount, currentPage, pages) {
  const totalPageNumbers = siblingCount + 5;

  /*
    Case 1:
    If the number of pages is less than the page numbers we want to show in our
    paginationComponent, we return the range [1..pages]
  */
  if (totalPageNumbers >= pages) {
    return range(1, pages);
  }

  /*
    Calculate left and right sibling index and make sure they are within range 1 and pages
  */
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, pages);

  /*
    We do not show dots just when there is just one page number to be inserted between the extremes of sibling and the page limits i.e 1 and pages. Hence we are using leftSiblingIndex > 2 and rightSiblingIndex < pages - 2
  */
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < pages - 2;

  const firstPageIndex = 1;
  const lastPageIndex = pages;

  /*
    Case 2: No left dots to show, but rights dots to be shown
  */
  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = range(1, leftItemCount);

    return [...leftRange, DOTS, pages];
  }

  /*
    Case 3: No right dots to show, but left dots to be shown
  */
  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = range(pages - rightItemCount + 1, pages);
    return [firstPageIndex, DOTS, ...rightRange];
  }

  /*
    Case 4: Both left and right dots to be shown
  */
  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = range(leftSiblingIndex, rightSiblingIndex);
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }
}
