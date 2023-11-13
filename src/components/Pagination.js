import React from 'react';
import {Button} from 'react-bootstrap'


const Pagination = ({ nPages, currentPage, setCurrentPage }) => {
  const pageNumbers = [...Array(nPages + 1).keys()].slice(1);

  const goToNextPage = () => {
    if (currentPage !== nPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage !== 1) setCurrentPage(currentPage - 1);
  };

  return (
    <nav>
      <ul className="page-container">
        <div className="page-item">
          <Button
            className="page-link-btn"
            onClick={goToPrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
        </div>
        {pageNumbers.map((pgNumber) => (
          <div
            key={pgNumber}
            className={`page-item ${currentPage === pgNumber ? 'active' : ''}`}
          >
            <Button
              onClick={() => setCurrentPage(pgNumber)}
              className="page-link-btn"
            >
              {pgNumber}
            </Button>
          </div>
        ))}
        <div className="page-item">
          <Button
            className="page-link-btn"
            onClick={goToNextPage}
            disabled={currentPage === nPages}
          >
            Next
          </Button>
        </div>
      </ul>
    </nav>
  );
};

export default Pagination;
