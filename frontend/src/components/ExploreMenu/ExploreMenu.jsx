import React, { useContext, useEffect } from "react";
import "./ExploreMenu.css";
import { StoreContext } from "../../context/StoreContext";

import { menu_list } from "../../constants/data";

const ExploreMenu = ({ category, setCategory, setIsLoading }) => {
  const { setIndexPagination, selectedFilter } = useContext(StoreContext);

  const onClickHandler = (name) => {
    setIsLoading(true);
    setIndexPagination(selectedFilter === "none" ? name : selectedFilter);
    setCategory((prev) => (prev === name ? "All" : name));
    setIsLoading(false);
  };

  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore our menu</h1>
      <p className="explore-menu-text">
        Choose from a diverse menu featuring a delectable array of dishes
        crafted with the finest ingredients and culinary expertise. Our mission
        is to satisfy your cravings and elevate your dining experience, one
        delicious meal at the time.
      </p>
      <div className="explore-menu-list">
        {menu_list.map((item, index) => {
          return (
            <div
              onClick={() => onClickHandler(item.menu_name)}
              key={index}
              className="explore-menu-list-item"
            >
              <img
                className={category === item.menu_name ? "active" : ""}
                src={item.menu_image}
                alt="menu image"
              />
              <p>{item.menu_name}</p>
            </div>
          );
        })}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;
