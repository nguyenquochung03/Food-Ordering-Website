import React, { useEffect, useState } from "react";
import "./RecentReviews.css";
import axios from "axios";
import moment from "moment";
import NormalPagination from "../../Pagination/NormalPagination/NormalPagination";

const RecentReviews = ({ setIsLoading, selectedMonth, url }) => {
  const [recentReviews, setResentReview] = useState([]);
  const [positiveReviews, setPositiveReviews] = useState([]);
  const [negativeReviews, setNegativeReviews] = useState([]);
  const [filteredPositiveReviews, setFilteredPositiveReviews] = useState([]);
  const [filteredNegativeReviews, setFilteredNegativeReviews] = useState([]);

  useEffect(() => {
    if (selectedMonth) {
      fetchRecentReview();
    }
  }, [selectedMonth]);

  useEffect(() => {
    const posReviews = recentReviews.filter((data) => data.rating > 3);
    const negReviews = recentReviews.filter(
      (data) => data.rating <= 3 && data.parentId === "none"
    );
    setPositiveReviews(posReviews);
    setNegativeReviews(negReviews);
  }, [recentReviews]);

  async function fetchRecentReview() {
    try {
      setIsLoading(true);
      if (selectedMonth) {
        const [year, month] = selectedMonth.split("-");
        const response = await axios.get(
          `${url}/api/comment/getCommentsSorted/`,
          {
            params: { month, year },
          }
        );

        if (response.data.success) {
          setResentReview(response.data.data);
        } else {
          console.log("Failed to fetch review data");
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="recent-reviews-container">
      <p className="recent-reviews-container-title">Recent Reviews</p>
      <div className="recent-reviews-pagination">
        <div className="recent-reviews">
          <p className="recent-reviews-title">Positive Reviews</p>
          <div className="recent-reviews-list">
            {filteredPositiveReviews.map((data) => (
              <div className="recent-reviews-item" key={data._id}>
                <div className="recent-reviews-item-top">
                  <img src={`${url}/images/${data.user.image}`} alt="" />
                  <div className="recent-reviews-item-top-right">
                    <p>{data.user.name}</p>
                    <p>
                      <span>User since {moment(data.user.date).year()}</span>
                    </p>
                    <span className="recent-reviews-item-top-right-role">
                      {data.user.role}
                    </span>
                  </div>
                </div>
                <hr />
                <div className="recent-reviews-item-bottom">
                  <div className="recent-reviews-item-bottom-top">
                    <img src={`${url}/images/${data.food.image}`} alt="" />
                    <div className="recent-reviews-item-bottom-top-right">
                      <p>{data.food.name}</p>
                      <div className="recent-reviews-food-item-rating">
                        {[...Array(5)].map((_, i) => {
                          const isHalfStar =
                            data.rating > i && data.rating < i + 1;

                          return (
                            <span
                              key={i}
                              className="recent-reviews-food-item-rating-star"
                            >
                              {isHalfStar ? (
                                <span className="recent-reviews-food-item-rating-half-star">
                                  <span className="recent-reviews-full-star">
                                    ★
                                  </span>
                                  <span className="recent-reviews-empty-star">
                                    ☆
                                  </span>
                                </span>
                              ) : i < data.rating ? (
                                "★"
                              ) : (
                                "☆"
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <p className="recent-reviews-item-bottom-describe">
                    {data.describe}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <NormalPagination
          food_list={positiveReviews}
          setList={setFilteredPositiveReviews}
          setIsLoading={setIsLoading}
        />
      </div>
      <div className="recent-reviews-pagination">
        <div className="recent-reviews">
          <p className="recent-reviews-title">Negative Reviews</p>
          <div className="recent-reviews-list">
            {filteredNegativeReviews.map((data) => (
              <div className="recent-reviews-item" key={data._id}>
                <div className="recent-reviews-item-top">
                  <img src={`${url}/images/${data.user.image}`} alt="" />
                  <div className="recent-reviews-item-top-right">
                    <p>{data.user.name}</p>
                    <p>
                      <span>User since {moment(data.user.date).year()}</span>
                    </p>
                    <span className="recent-reviews-item-top-right-role">
                      {data.user.role}
                    </span>
                  </div>
                </div>
                <hr />
                <div className="recent-reviews-item-bottom">
                  <div className="recent-reviews-item-bottom-top">
                    <img src={`${url}/images/${data.food.image}`} alt="" />
                    <div className="recent-reviews-item-bottom-top-right">
                      <p>{data.food.name}</p>
                      <div className="recent-reviews-food-item-rating">
                        {[...Array(5)].map((_, i) => {
                          const isHalfStar =
                            data.rating > i && data.rating < i + 1;

                          return (
                            <span
                              key={i}
                              className="recent-reviews-food-item-rating-star"
                            >
                              {isHalfStar ? (
                                <span className="recent-reviews-food-item-rating-half-star">
                                  <span className="recent-reviews-full-star">
                                    ★
                                  </span>
                                  <span className="recent-reviews-empty-star">
                                    ☆
                                  </span>
                                </span>
                              ) : i < data.rating ? (
                                "★"
                              ) : (
                                "☆"
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <p className="recent-reviews-item-bottom-describe">
                    {data.describe}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <NormalPagination
          food_list={negativeReviews}
          setList={setFilteredNegativeReviews}
          setIsLoading={setIsLoading}
        />
      </div>
    </div>
  );
};

export default RecentReviews;
