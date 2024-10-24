import React, { useState } from "react";
import "./Home.css";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import Pagination from "../../components/Pagination/Pagination";
import AppDownload from "../../components/AppDownload/AppDownload";
import PageTracker from "../../components/PageTracker/PageTracker";

const Home = ({ url, setIsLoading }) => {
  const [category, setCategory] = useState("All");
  const [isShowPagination, setIsShowPagination] = useState(true);

  return (
    <div>
      <Header url={url} setIsLoading={setIsLoading} />
      <ExploreMenu
        category={category}
        setCategory={setCategory}
        setIsLoading={setIsLoading}
      />
      <FoodDisplay
        category={category}
        setIsLoading={setIsLoading}
        setIsShowPagination={setIsShowPagination}
      />
      {isShowPagination && <Pagination setIsLoading={setIsLoading} />}
      <AppDownload />
      <PageTracker pageUrl={`${url}/`} />
    </div>
  );
};

export default Home;
