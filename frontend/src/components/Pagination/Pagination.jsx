import React, { useContext, useEffect, useState } from "react";
import "./Pagination.css";
import { StoreContext } from "../../context/StoreContext";

const Pagination = ({ setIsLoading }) => {
  const { postPerPage, pagination, updatePagination, indexPagination } =
    useContext(StoreContext);

  const [pages, setPages] = useState([]);
  const [totalItem, setTotalItem] = useState(0);
  const [startItemIndex, setStartItemIndex] = useState(0);
  const [endItemIndex, setEndItemIndex] = useState(0);

  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const chunkSize = postPerPage * 3;

  useEffect(() => {
    const currentData = pagination.find(
      (item) => item.name === indexPagination
    );

    if (currentData) {
      setCurrentPage(currentData.currentPage);
      setTotalItem(currentData.foodCategory.length);
    }
  }, [pagination, indexPagination]);

  useEffect(() => {
    setIsLoading(true);
    const currentData = pagination.find(
      (item) => item.name === indexPagination
    );

    if (currentData) {
      const startIndex = currentChunkIndex * chunkSize;
      const endIndex = Math.min(startIndex + chunkSize, totalItem);

      var pageStartIndex = currentPage - currentChunkIndex * 3;
      pageStartIndex = (pageStartIndex - 1) * postPerPage;
      if (totalItem > 0) {
        setStartItemIndex(startIndex + pageStartIndex + 1);
      } else {
        setStartItemIndex(startIndex + pageStartIndex);
      }
      setEndItemIndex(
        Math.min(startIndex + pageStartIndex + postPerPage, totalItem)
      );

      const currentChunk = currentData.foodCategory.slice(startIndex, endIndex);

      let pageNumbers = [];
      for (let i = 1; i <= Math.ceil(currentChunk.length / postPerPage); i++) {
        pageNumbers.push(i + currentChunkIndex * 3);
      }
      if (pageNumbers.length === 0) {
        setPages(pageNumbers.push(1));
      }
      setPages(pageNumbers);
    }
    setIsLoading(false);
  }, [totalItem, currentPage]);

  useEffect(() => {
    setIsLoading(true);
    const currentData = pagination.find(
      (item) => item.name === indexPagination
    );

    if (currentData) {
      const newCurrentPosts = currentData.foodCategory.slice(
        postPerPage * (currentPage - 1),
        postPerPage * currentPage
      );
      updatePagination(
        indexPagination,
        currentData.foodCategory,
        currentPage,
        newCurrentPosts
      );
    }
    setIsLoading(false);
  }, [totalItem]);

  const onLeftArrowClick = () => {
    setIsLoading(true);
    if (currentChunkIndex > 0) {
      setCurrentChunkIndex((prevIndex) => prevIndex - 1);
      const newPage = 1 + (currentChunkIndex - 1) * 3;
      setCurrentPage(newPage);

      const currentData = pagination.find(
        (item) => item.name === indexPagination
      );
      if (currentData) {
        const newCurrentPosts = currentData.foodCategory.slice(
          postPerPage * (newPage - 1),
          postPerPage * newPage
        );
        updatePagination(
          indexPagination,
          currentData.foodCategory,
          newPage,
          newCurrentPosts
        );
      }
    }
    setIsLoading(false);
  };

  const onRightArrowClick = () => {
    setIsLoading(true);
    const currentData = pagination.find(
      (item) => item.name === indexPagination
    );
    const totalChunks = Math.ceil(currentData.foodCategory.length / chunkSize);

    if (currentChunkIndex < totalChunks - 1) {
      setCurrentChunkIndex((prevIndex) => prevIndex + 1);
      const newPage = 1 + (currentChunkIndex + 1) * 3;
      setCurrentPage(newPage);

      if (currentData) {
        const newCurrentPosts = currentData.foodCategory.slice(
          postPerPage * (newPage - 1),
          postPerPage * newPage
        );
        updatePagination(
          indexPagination,
          currentData.foodCategory,
          newPage,
          newCurrentPosts
        );
      }
    }
    setIsLoading(false);
  };

  const onClickHandler = async (page) => {
    setIsLoading(true);
    setCurrentPage(page);

    const currentData = pagination.find(
      (item) => item.name === indexPagination
    );
    if (currentData) {
      const newCurrentPosts = currentData.foodCategory.slice(
        postPerPage * (page - 1),
        postPerPage * page
      );
      await updatePagination(
        indexPagination,
        currentData.foodCategory,
        page,
        newCurrentPosts
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="pagination-container">
      <p className="pagination-show-page">
        <span>Showing</span> {startItemIndex}-{endItemIndex} <span>from</span>{" "}
        {totalItem} <span>data</span>
      </p>
      <div className="pagination">
        <div className="pagination-arrow-container" onClick={onLeftArrowClick}>
          <a href="#food-display">
            <i
              className="fas fa-chevron-left normal-pagination-arrow-icon"
              aria-hidden="true"
            ></i>
          </a>
        </div>
        {pages.map((page, index) => (
          <a href="#food-display" key={index}>
            <button
              onClick={() => onClickHandler(page)}
              className={page === currentPage ? "active" : ""}
            >
              {page}
            </button>
          </a>
        ))}
        <div className="pagination-arrow-container" onClick={onRightArrowClick}>
          <a href="#food-display">
            <i
              className="fas fa-chevron-right normal-pagination-arrow-icon"
              aria-hidden="true"
            ></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
