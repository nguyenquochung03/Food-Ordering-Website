import React, { useContext, useEffect, useRef, useState } from "react";
import "./DetailCategory.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { images } from "../../constants/data";
import Comments from "../../components/Comments/Comments";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import PageTracker from "../../components/PageTracker/PageTracker";

const DetailCategory = ({ setIsLoading, setShowLogin }) => {
  const { url, token, cartItems, addToCartWithAmount, userImage } =
    useContext(StoreContext);
  const detailCategoryRef = useRef(null);
  const inputWriteCommentRef = useRef(null);

  const { id } = useParams();
  const [searchData, setSearchData] = useState({});
  const [numberInCart, setNumberInCart] = useState(1);
  const [currentStarLevel, setCurrentStarLevel] = useState(0);
  const [inputComment, setInputComment] = useState("");
  const navigate = useNavigate();
  const [commentsData, setCommentData] = useState([
    {
      idComment: "",
      nameUser: "",
      avatarUser: "",
      timeCreated: "",
      contentComment: "",
      likes: 0,
      rating: 0,
      parentId: "",
      isLike: false,
      isUser: false,
    },
  ]);
  const [numComment, setNumComment] = useState(0);
  const [countRootComments, setCountRootComments] = useState(0);
  const [averageRating, setAverageRating] = useState(5);
  const [ratingPercentages, setRatingPercentages] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);

  useEffect(() => {
    if (detailCategoryRef.current) {
      detailCategoryRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    onSearchHandler(id);
  }, [id]);

  useEffect(() => {
    if (cartItems[id]) {
      setNumberInCart(cartItems[id]);
    }
    fetchComments();
    hasOrderedFood();
  }, [searchData, token]);

  useEffect(() => {
    setIsLoading(true);
    setNumComment(commentsData.length);
    if (!Array.isArray(commentsData)) {
      return;
    } else {
      const count = commentsData.filter(
        (comment) => comment.parentId === "none"
      ).length;
      setCountRootComments(count);
    }
    {
      /* Get comment has rating */
    }
    const realComment = commentsData.filter(
      (comment) => comment.parentId === "none"
    );

    {
      /* Start get rating */
    }

    {
      /* Start count average rating */
    }
    const averageRating =
      realComment.length > 0
        ? realComment.reduce((total, comment) => total + comment.rating, 0) /
          realComment.length
        : 5;
    setAverageRating(averageRating);
    {
      /* End count average rating */
    }

    {
      /* START get percentage rating for each rating from 1 to 5 */
    }
    const ratingCounts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    realComment.forEach((comment) => {
      const roundedRating = Math.floor(comment.rating);
      if (roundedRating >= 1 && roundedRating <= 5) {
        ratingCounts[roundedRating]++;
      }
    });

    const totalRatings = realComment.length;

    const ratingPercentages = {
      5: (ratingCounts[5] / totalRatings) * 100 || 0,
      4: (ratingCounts[4] / totalRatings) * 100 || 0,
      3: (ratingCounts[3] / totalRatings) * 100 || 0,
      2: (ratingCounts[2] / totalRatings) * 100 || 0,
      1: (ratingCounts[1] / totalRatings) * 100 || 0,
    };

    setRatingPercentages(ratingPercentages);
    {
      /* END get percentage rating for each rating from 1 to 5 */
    }

    {
      /* End get rating */
    }
    setIsLoading(false);
  }, [commentsData]);

  useEffect(() => {
    if (cartItems && cartItems[id]) {
      setNumberInCart(cartItems[id]);
    } else {
      setNumberInCart(1);
    }
  }, [cartItems, id]);

  const hasOrderedFood = async (value) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${url}/api/order/hasOrderedFood`,
        { foodId: searchData._id },
        { headers: { token } }
      );

      if (response.data.success) {
        setIsOrdered(true);
      } else {
        setIsOrdered(false);
      }
    } catch (error) {
      setIsOrdered(false);
      console.error("Error:", error);
      toast.error("An error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSearchHandler = async (value) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${url}/api/food/getFoodById?id=${value}`
      );
      if (response.data.success) {
        setSearchData(response.data.data);
      } else {
        setSearchData({});
      }
    } catch (error) {
      setSearchData({});
      console.error("Error:", error);
      toast.error("An error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  };

  const onAddToCartHandler = async (amount) => {
    setIsLoading(true);
    await addToCartWithAmount(id, amount);
    navigate("/cart");
    setIsLoading(false);
  };

  const handleStarClick = (starIndex) => {
    setCurrentStarLevel(starIndex + 1);
  };

  const onCancelCommentHanlder = () => {
    setCurrentStarLevel(0);
    setInputComment("");
  };

  const formatTimeAgo = (createdAt) => {
    const now = new Date();
    const timeDiff = now - new Date(createdAt);
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / now.getMonth());

    if (minutes < 5) {
      return "few minutes ago";
    } else if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      if (hours > 1) {
        return `${hours} hours ago`;
      } else {
        return `${hours} hour ago`;
      }
    } else if (days < now.getMonth()) {
      if (days > 1) {
        return `${days} days ago`;
      } else {
        return `${days} day ago`;
      }
    } else {
      if (months > 1) {
        return `${months} months ago`;
      } else {
        return `${months} month ago`;
      }
    }
  };

  const fetchComments = async () => {
    try {
      setIsLoading(true);

      if (searchData._id) {
        const response = await axios.get(
          `${url}/api/comment/getAll?foodId=${searchData._id}`
        );
        if (response.data.success) {
          const comments = response.data.data;
          let isLike = {};
          let isUser = {};

          if (token) {
            await Promise.all(
              comments.map(async (comment) => {
                const [likeResponse, ownershipResponse] = await Promise.all([
                  axios.post(
                    `${url}/api/comment/isUserLikeComment`,
                    { commentId: comment._id },
                    { headers: { token } }
                  ),
                  axios.post(
                    `${url}/api/comment/checkCommentOwnership`,
                    { commentId: comment._id },
                    { headers: { token } }
                  ),
                ]);

                isLike[comment._id] = likeResponse.data.isLiked;
                isUser[comment._id] = ownershipResponse.data.isOwner;
              })
            );
          }

          const sortedComments = await sortComments(comments, token, url);

          const formattedComments = sortedComments.map((comment) => ({
            idComment: comment._id,
            nameUser: comment.user.name,
            avatarUser: comment.user.image,
            timeCreated: formatTimeAgo(comment.createdAt),
            contentComment: comment.describe,
            likes: comment.likes.length,
            rating: comment.rating,
            parentId: comment.parentId,
            isLike: comment._id in isLike ? isLike[comment._id] : false,
            isUser: comment._id in isUser ? isUser[comment._id] : false,
            isAdmin: comment.user.role === "Admin",
          }));

          setCommentData(formattedComments);
        } else {
          setCommentData([]);
        }
      } else {
        setCommentData([]);
      }
    } catch (error) {
      setCommentData([]);
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  async function sortComments(comments, token, url) {
    if (!comments || !Array.isArray(comments)) {
      throw new Error("Invalid comments data");
    }

    const ownershipResponse = await Promise.all(
      comments.map((comment) =>
        axios.post(
          `${url}/api/comment/checkCommentOwnership`,
          { commentId: comment._id },
          { headers: { token } }
        )
      )
    );

    const ownershipStatus = {};

    ownershipResponse.forEach((response, index) => {
      const commentId = comments[index]._id;
      ownershipStatus[commentId] = response.data.isOwner;
    });

    return comments.sort((a, b) => {
      const isAUserComment = ownershipStatus[a._id];
      const isBUserComment = ownershipStatus[b._id];

      if (isBUserComment && !isAUserComment) return 1;
      if (isAUserComment && !isBUserComment) return -1;

      const likesDifference = b.likes.length - a.likes.length;
      if (likesDifference === 0) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return likesDifference;
    });
  }

  const onLoginToCommentHandler = () => {
    setShowLogin(true);
  };

  const onPostCommentHandler = async () => {
    if (currentStarLevel === 0 || inputComment.trim().length === 0) {
      alert("Please fill in comments/ratings before posting comments");
      if (inputWriteCommentRef && inputWriteCommentRef.current) {
        inputWriteCommentRef.current.focus();
      }
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        url + "/api/comment/add",
        { describe: inputComment.trim(), rating: currentStarLevel, foodId: id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Comments have been submitted");
        fetchComments();
        setCurrentStarLevel(0);
        setInputComment("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div
        ref={detailCategoryRef}
        className="detail-category"
        id="detail-category"
      >
        <div className="detail-category_left">
          <img
            src={
              searchData.image
                ? url + "/images/" + searchData.image
                : images.upload_area
            }
            alt=""
          />
        </div>
        <div className="detail-category_right">
          <p className="detail-category_right-title">
            {searchData.name || "Loading..."}
          </p>
          <hr />
          <p className="detail-category_right-price">
            $ <span> {searchData.price || "0.00"} </span>{" "}
          </p>
          <div
            className="detail-category_rating"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <p>{averageRating.toFixed(1)}</p>
            <div className="detail-category-show-comment-rating">
              <div className="detail-category-food-rating">
                {[...Array(5)].map((_, i) => {
                  const isHalfStar = averageRating > i && averageRating < i + 1;

                  return (
                    <span key={i} className="detail-category-star">
                      {isHalfStar ? (
                        <span className="detail-category-half-star">
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
              <img
                src="https://rvs-comment-module.vercel.app/Assets/Down.svg"
                alt="Downvote"
              />
            </div>
            <p>({countRootComments})</p>

            {/* Detail Rating Section */}
            <div className="detail-category-detail-rating">
              <div className="detail-category-food-rating-container">
                <div className="detail-category-food-rating">
                  {[...Array(5)].map((_, i) => {
                    const isHalfStar =
                      averageRating > i && averageRating < i + 1;

                    return (
                      <span key={i} className="detail-category-star">
                        {isHalfStar ? (
                          <span className="detail-category-half-star">
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
                <p>{averageRating.toFixed(1)} out of 5</p>
              </div>
              <p className="detail-category-detail-rating-global">
                {countRootComments} global ratings
              </p>
              <ul>
                {Object.keys(ratingPercentages)
                  .sort((a, b) => b - a)
                  .map((rating) => (
                    <li key={rating}>
                      <div
                        className={`detail-category-detail-rating-rating-star ${
                          ratingPercentages[rating] !== 0
                            ? "detail-category-detail-rating-rated"
                            : "detail-category-detail-rating-not-rated"
                        }`}
                      >
                        <p>{rating}</p>
                        <p>star</p>
                      </div>
                      <div className="progress-bar-container">
                        <ProgressBar
                          percentage={
                            isHovered ? ratingPercentages[rating].toFixed(0) : 0
                          }
                        />
                      </div>
                      <span
                        className={`detail-category-detail-rating-percentage ${
                          ratingPercentages[rating] !== 0
                            ? "detail-category-detail-rating-rated"
                            : "detail-category-detail-rating-not-rated"
                        }`}
                      >
                        {isHovered ? ratingPercentages[rating].toFixed(0) : 0}%
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <p className="detail-category_right-description">
            {searchData.description || "No description available."}
          </p>
          <div className="detail-category_cart">
            <div className="detail-category_add-to-cart-quantity">
              <p>Quantity</p>
              <input
                type="number"
                value={numberInCart ?? 1}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setNumberInCart(value >= 1 ? value : 1);
                }}
              />
            </div>
            {!cartItems[id] ? (
              <div className="detail-category_add-to-cart-add">
                <button onClick={() => onAddToCartHandler(numberInCart)}>
                  <img src={images.shopping_cart} alt="" />
                  <p>Add To Cart</p>
                </button>
              </div>
            ) : (
              <div className="detail-category_checkout">
                <button onClick={() => onAddToCartHandler(numberInCart)}>
                  Proceed to checkout
                </button>
              </div>
            )}
          </div>
          <p className="detail-category_category">
            <span>Category:</span> {searchData.category}
          </p>
        </div>
      </div>
      <div className="comment-write">
        <div className="comment-title">
          <p className="comment-title-number-comment">{numComment} COMMENTS</p>
          <p>
            Sort by:{" "}
            <span>
              Newest{" "}
              <img
                src="https://rvs-comment-module.vercel.app/Assets/Down.svg"
                alt="Downvote"
              />
            </span>
          </p>
        </div>
        <hr />
        {token ? (
          isOrdered ? (
            <div className="comment-write-comment">
              <img
                className="comment-write-comment-avatar"
                src={`${url}/images/${userImage}`}
                alt=""
              />
              <div className="comment-write-comment-container">
                <input
                  ref={inputWriteCommentRef}
                  value={inputComment}
                  onChange={(e) => setInputComment(e.target.value)}
                  type="text"
                  placeholder="Write a comment..."
                />
                <div className="comment-write-comment-footer">
                  <div className="comment-write-comment-footer-star-rating">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        className="comment-write-comment-footer-star"
                        onClick={() => handleStarClick(i)}
                        style={{ color: "var(--color-main)" }}
                      >
                        {i < currentStarLevel ? "★" : "☆"}
                      </button>
                    ))}
                  </div>
                  <div className="comment-write-comment-btn">
                    <button
                      onClick={() => onCancelCommentHanlder()}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => onPostCommentHandler()}
                      className="btn-publish"
                    >
                      Publish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="comment-write-btn">
              <button onClick={() => onAddToCartHandler(numberInCart)}>
                Order to comment
              </button>
            </div>
          )
        ) : (
          <div className="comment-write-btn">
            <button onClick={() => onLoginToCommentHandler()}>
              Login to comment
            </button>
          </div>
        )}
      </div>
      <Comments
        foodId={id}
        setShowLogin={setShowLogin}
        comments={commentsData}
        fetchComments={fetchComments}
        setIsLoading={setIsLoading}
      />
      <PageTracker pageUrl={`${url}/detailCategory/${id}`} />
    </React.Fragment>
  );
};

export default DetailCategory;
