import React, { useContext, useEffect, useState } from "react";
import "./Pagination.css";
import { PaginationContext } from "../../context/PaginationContext";
import { images } from "../../constants/data";

const Pagination = ({
  currentPage,
  setCurrentPage,
  currentChunkIndex,
  setCurrentChunkIndex,
  setIsLoading,
}) => {
  const { postsPerPage, pagination, updatePagination, indexPagination } =
    useContext(PaginationContext);

  const [pages, setPages] = useState([]);
  const [totalItem, setTotalItem] = useState(0);
  const [startItemIndex, setStartItemIndex] = useState(0);
  const [endItemIndex, setEndItemIndex] = useState(0);

  const chunkSize = postsPerPage * 3;

  useEffect(() => {
    fetchData();
  }, [pagination, indexPagination]);

  useEffect(() => {
    const currentData = pagination.find(
      (item) => item.name === indexPagination
    );

    if (currentData) {
      const newCurrentPosts = currentData.foodCategory.slice(
        postsPerPage * (currentPage - 1),
        postsPerPage * currentPage
      );
      updatePagination(
        indexPagination,
        currentData.foodCategory,
        currentPage,
        newCurrentPosts
      );
    }
  }, [totalItem]);

  const fetchData = () => {
    try {
      setIsLoading(true);

      const currentData = pagination.find(
        (item) => item.name === indexPagination
      );

      if (currentData) {
        setCurrentPage(currentData.currentPage);

        setTotalItem(currentData.foodCategory.length);
        const startIndex = currentChunkIndex * chunkSize;
        const endIndex = Math.min(startIndex + chunkSize, totalItem);

        const currentChunk = currentData.foodCategory.slice(
          startIndex,
          endIndex
        );

        var pageStartIndex = currentPage - currentChunkIndex * 3;
        pageStartIndex = (pageStartIndex - 1) * postsPerPage;
        if (totalItem > 0) {
          setStartItemIndex(startIndex + pageStartIndex + 1);
        } else {
          setStartItemIndex(startIndex + pageStartIndex);
        }
        setEndItemIndex(
          Math.min(startIndex + pageStartIndex + postsPerPage, totalItem)
        );

        let pageNumbers = [];
        for (
          let i = 1;
          i <= Math.ceil(currentChunk.length / postsPerPage);
          i++
        ) {
          pageNumbers.push(i + currentChunkIndex * 3);
        }
        if (pageNumbers.length === 0) {
          setPages(pageNumbers.push(1));
        }
        setPages(pageNumbers);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onLeftArrowClick = () => {
    if (currentChunkIndex > 0) {
      setCurrentChunkIndex((prevIndex) => prevIndex - 1);
      const newPage = 1 + (currentChunkIndex - 1) * 3;
      setCurrentPage(newPage);

      const currentData = pagination.find(
        (item) => item.name === indexPagination
      );
      if (currentData) {
        const newCurrentPosts = currentData.foodCategory.slice(
          postsPerPage * (newPage - 1),
          postsPerPage * newPage
        );
        updatePagination(
          indexPagination,
          currentData.foodCategory,
          newPage,
          newCurrentPosts
        );
      }
    }
  };

  const onRightArrowClick = () => {
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
          postsPerPage * (newPage - 1),
          postsPerPage * newPage
        );
        updatePagination(
          indexPagination,
          currentData.foodCategory,
          newPage,
          newCurrentPosts
        );
      }
    }
  };

  const onClickHandler = async (page) => {
    setCurrentPage(page);

    const currentData = pagination.find(
      (item) => item.name === indexPagination
    );
    if (currentData) {
      const newCurrentPosts = currentData.foodCategory.slice(
        postsPerPage * (page - 1),
        postsPerPage * page
      );
      await updatePagination(
        indexPagination,
        currentData.foodCategory,
        page,
        newCurrentPosts
      );
    }
  };

  return (
    <div className="pagination-container">
      <p className="pagination-show-page">
        <span>Showing</span> {startItemIndex}-{endItemIndex} <span>from</span>{" "}
        {totalItem} <span>data</span>
      </p>
      <div className="pagination">
        <div className="pagination-arrow-container" onClick={onLeftArrowClick}>
          <i
            className="fas fa-chevron-left pagination-arrow-icon"
            aria-hidden="true"
          ></i>
        </div>
        {pages.map((page, index) => (
          <button
            onClick={() => onClickHandler(page)}
            className={page === currentPage ? "active" : ""}
            key={index}
          >
            {page}
          </button>
        ))}
        <div className="pagination-arrow-container" onClick={onRightArrowClick}>
          <i
            className="fas fa-chevron-right pagination-arrow-icon"
            aria-hidden="true"
          ></i>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
