import React, { useEffect, useState } from "react";
import "./NormalPagination.css";
import { images } from "../../../constants/data";

const NormalPagination = ({ food_list, setList, setIsLoading }) => {
  const [data, setData] = useState([]);
  const [postsPerPage] = useState(5);
  const [pages, setPages] = useState([]);
  const [totalItem, setTotalItem] = useState(0);
  const [startItemIndex, setStartItemIndex] = useState(0);
  const [endItemIndex, setEndItemIndex] = useState(0);

  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const chunkSize = postsPerPage * 3;

  useEffect(() => {
    setTotalItem(food_list.length);
    setData(food_list);
  }, [food_list]);

  useEffect(() => {
    fetchData();
  }, [data, currentPage, currentChunkIndex]);

  const fetchData = () => {
    try {
      setIsLoading(true);
      const startIndex = (currentPage - 1) * postsPerPage;
      const endIndex = Math.min(startIndex + postsPerPage, totalItem);

      if (data.length != 0) {
        setStartItemIndex(startIndex + 1);
      } else {
        setStartItemIndex(startIndex);
      }
      setEndItemIndex(endIndex);

      setList(data.slice(startIndex, endIndex));

      const currentChunk = data.slice(
        currentChunkIndex * chunkSize,
        Math.min((currentChunkIndex + 1) * chunkSize, totalItem)
      );

      const pageNumbers = [];
      for (let i = 1; i <= Math.ceil(currentChunk.length / postsPerPage); i++) {
        pageNumbers.push(i + currentChunkIndex * 3);
      }

      setPages(pageNumbers.length ? pageNumbers : [1]);
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
    }
  };

  const onRightArrowClick = () => {
    const totalChunks = Math.ceil(totalItem / chunkSize);
    if (currentChunkIndex < totalChunks - 1) {
      setCurrentChunkIndex((prevIndex) => prevIndex + 1);
      const newPage = 1 + (currentChunkIndex + 1) * 3;
      setCurrentPage(newPage);
    }
  };

  const onClickHandler = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="normal-pagination-container">
      <p className="normal-pagination-show-page">
        <span>Showing</span> {startItemIndex}-{endItemIndex} <span>from</span>{" "}
        {totalItem} <span>data</span>
      </p>
      <div className="normal-pagination">
        <div
          className="normal-pagination-arrow-container"
          onClick={onLeftArrowClick}
        >
          <i
            className="fas fa-chevron-left normal-pagination-arrow-icon"
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
        <div
          className="normal-pagination-arrow-container"
          onClick={onRightArrowClick}
        >
          <i
            className="fas fa-chevron-right normal-pagination-arrow-icon"
            aria-hidden="true"
          ></i>
        </div>
      </div>
    </div>
  );
};

export default NormalPagination;
