import React, { useContext, useEffect, useState } from "react";
import "./OrderPagination.css";

const OrderPagination = ({
  orderStatus,
  postsPerPage,
  orderPagination,
  updateOrderPagination,
  indexOrderPagination,
  setIsLoading,
}) => {
  const [pages, setPages] = useState([]);
  const [totalItem, setTotalItem] = useState(0);
  const [startItemIndex, setStartItemIndex] = useState(0);
  const [endItemIndex, setEndItemIndex] = useState(0);

  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const chunkSize = postsPerPage * 3;

  useEffect(() => {
    fetchData();
  }, [orderStatus, orderPagination]);

  useEffect(() => {
    const currentData = orderPagination.find(
      (item) => item.name === indexOrderPagination
    );

    if (currentData) {
      const newCurrentPosts = currentData.orderList.slice(
        postsPerPage * (currentPage - 1),
        postsPerPage * currentPage
      );
      updateOrderPagination(
        indexOrderPagination,
        currentData.orderList,
        currentPage,
        newCurrentPosts
      );
    }
  }, [totalItem]);

  const fetchData = () => {
    try {
      setIsLoading(true);
      const currentData = orderPagination.find(
        (item) => item.name === indexOrderPagination
      );

      if (currentData) {
        setCurrentPage(currentData.currentPage);

        setTotalItem(currentData.orderList.length);
        const startIndex = currentChunkIndex * chunkSize;
        const endIndex = Math.min(startIndex + chunkSize, totalItem);

        const currentChunk = currentData.orderList.slice(startIndex, endIndex);

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

      const currentData = orderPagination.find(
        (item) => item.name === indexOrderPagination
      );
      if (currentData) {
        const newCurrentPosts = currentData.orderList.slice(
          postsPerPage * (newPage - 1),
          postsPerPage * newPage
        );
        updateOrderPagination(
          indexOrderPagination,
          currentData.orderList,
          newPage,
          newCurrentPosts
        );
      }
    }
  };

  const onRightArrowClick = () => {
    const currentData = orderPagination.find(
      (item) => item.name === indexOrderPagination
    );
    const totalChunks = Math.ceil(currentData.orderList.length / chunkSize);

    if (currentChunkIndex < totalChunks - 1) {
      setCurrentChunkIndex((prevIndex) => prevIndex + 1);
      const newPage = 1 + (currentChunkIndex + 1) * 3;
      setCurrentPage(newPage);

      if (currentData) {
        const newCurrentPosts = currentData.orderList.slice(
          postsPerPage * (newPage - 1),
          postsPerPage * newPage
        );
        updateOrderPagination(
          indexOrderPagination,
          currentData.orderList,
          newPage,
          newCurrentPosts
        );
      }
    }
  };

  const onClickHandler = async (page) => {
    setCurrentPage(page);

    const currentData = orderPagination.find(
      (item) => item.name === indexOrderPagination
    );
    if (currentData) {
      const newCurrentPosts = currentData.orderList.slice(
        postsPerPage * (page - 1),
        postsPerPage * page
      );
      await updateOrderPagination(
        indexOrderPagination,
        currentData.orderList,
        page,
        newCurrentPosts
      );
    }
  };

  return (
    <div className="order-pagination-container">
      <p className="order-pagination-show-page">
        <span>Showing</span> {startItemIndex}-{endItemIndex} <span>from</span>{" "}
        {totalItem} <span>data</span>
      </p>
      <div className="order-pagination">
        <div
          className="order-pagination-arrow-container"
          onClick={onLeftArrowClick}
        >
          <i
            className="fas fa-chevron-left order-pagination-arrow-icon"
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
          className="order-pagination-arrow-container"
          onClick={onRightArrowClick}
        >
          <i
            className="fas fa-chevron-right order-pagination-arrow-icon"
            aria-hidden="true"
          ></i>
        </div>
      </div>
    </div>
  );
};

export default OrderPagination;
