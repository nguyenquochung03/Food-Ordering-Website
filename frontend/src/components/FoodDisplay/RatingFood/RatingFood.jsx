import React, { useCallback, useContext, useEffect, useState } from "react";
import "./RatingFood.css";
import { StoreContext } from "../../../context/StoreContext";
import axios from "axios";

const RatingFood = ({
  setIsLoading,
  url,
  categoryData,
  currentStarLevel,
  setCurrentStarLevel,
}) => {
  const [ratingData, setRatingData] = useState([]);
  const { updatePagination, setIndexPagination, postPerPage, selectedFilter } =
    useContext(StoreContext);

  const handleStarClick = (starIndex) => {
    setCurrentStarLevel(starIndex + 1);
  };

  const onFilterFoodByRating = useCallback(async () => {
    if (selectedFilter === "rating") {
      try {
        setIsLoading(true);
        const foodListParam = categoryData.length
          ? categoryData.map((item) => item._id)
          : [];

        const response = await axios.get(`${url}/api/food/filterFoodByRating`, {
          params: {
            rating: currentStarLevel,
            foodList: foodListParam,
          },
        });

        if (response.data.success) {
          setRatingData(response.data.data);
        } else {
          setRatingData([]);
        }
      } catch (error) {
        console.error("Error fetching food by rating:", error);
        setRatingData([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentStarLevel, categoryData, selectedFilter]);

  useEffect(() => {
    if (selectedFilter === "rating") {
      onFilterFoodByRating();
    }
  }, [currentStarLevel, categoryData, onFilterFoodByRating]);

  useEffect(() => {
    if (selectedFilter === "rating") {
      updatePagination(
        "rating",
        ratingData,
        1,
        ratingData.slice(0, postPerPage)
      );
      setIndexPagination("rating");
    }
  }, [ratingData]);

  return (
    <div className="rating-food">
      {[...Array(5)].map((_, i) => (
        <button
          key={i}
          className="rating-food-star"
          onClick={() => handleStarClick(i)}
          style={{ color: "var(--color-main)" }}
        >
          {i < currentStarLevel ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
};

export default RatingFood;
