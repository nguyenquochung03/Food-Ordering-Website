import React, { useContext, useEffect, useState } from "react";
import "./FoodItem.css";
import { Navigate, useNavigate } from "react-router-dom";

import { images } from "../../constants/data";
import { StoreContext } from "../../context/StoreContext";

import axios from "axios";

const FoodItem = ({ id, name, price, description, image, setIsLoading }) => {
  const { cartItems, addToCart, removeFromCart, url } =
    useContext(StoreContext);
  const navigate = useNavigate();
  const [averageRating, setAverageRating] = useState(5);

  useEffect(() => {
    fetchRatingComments();
  }, [id]);

  const fetchRatingComments = async () => {
    try {
      setIsLoading(true);

      const response = await axios.get(
        `${url}/api/comment/getAll?foodId=${id}`
      );

      if (response.data.success) {
        const realComment = response.data.data.filter(
          (comment) => comment.parentId === "none"
        );
        const averageRating =
          realComment.length > 0
            ? realComment.reduce(
                (total, comment) => total + comment.rating,
                0
              ) / realComment.length
            : 5;
        setAverageRating(averageRating);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const truncateDescription = (text, length) => {
    return text.length > length ? text.slice(0, length) + "..." : text;
  };

  return (
    <div className="food-item">
      <div
        className="food-item-detail-category"
        onClick={() => navigate(`/detailCategory/${id}`)}
      >
        <p className="view-more-text">View More</p>
      </div>
      <div className="food-item-img-container">
        <img
          className="food-item-img"
          src={url + "/images/" + image}
          alt="food item image"
        />
        {!cartItems || !cartItems[id] ? (
          <img
            className="add"
            src={images.add_icon_white}
            onClick={() => addToCart(id)}
            alt=""
          />
        ) : (
          <div className="food-item-counter">
            <img
              onClick={() => removeFromCart(id)}
              src={images.remove_icon_red}
              alt=""
            />
            <p>{cartItems[id]}</p>
            <img
              onClick={() => addToCart(id)}
              src={images.add_icon_green}
              alt=""
            />
          </div>
        )}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <div className="food-item-rating">
            {[...Array(5)].map((_, i) => {
              const isHalfStar = averageRating > i && averageRating < i + 1;

              return (
                <span key={i} className="food-item-rating-star">
                  {isHalfStar ? (
                    <span className="food-item-rating-half-star">
                      <span className="full-star">★</span>
                      <span className="empty-star">☆</span>
                    </span>
                  ) : i < averageRating ? (
                    "★"
                  ) : (
                    "☆"
                  )}
                </span>
              );
            })}
          </div>
        </div>
        <p className="food-item-desc">{truncateDescription(description, 70)}</p>
        <p className="food-item-price">${price}</p>
      </div>
    </div>
  );
};

export default FoodItem;
