import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import SearchIcon from "../Icons/SearchIcon";
import PriceSlider from "./PriceSlider/PriceSlider";
import RatingFood from "./RatingFood/RatingFood";
import CloseIcon from "../Icons/CloseIcon";

const FoodDisplay = ({ setIsShowPagination, category, setIsLoading }) => {
  const {
    url,
    food_list,
    postPerPage,
    pagination,
    updatePagination,
    indexPagination,
    setIndexPagination,
    selectedFilter,
    setSelectedFilter,
  } = useContext(StoreContext);
  const [filterFood, setFilterFood] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("");
  const fullText = "Search your food . . .";
  const typingSpeed = 100;
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [categoryData, setCategoryData] = useState([]);

  const suggest = useMemo(() => {
    if (searchValue.length === 0) return [];
    return food_list
      .filter((food) =>
        food.name.toLowerCase().includes(searchValue.toLowerCase())
      )
      .map((food) => food.name);
  }, [food_list, searchValue]);

  const [isUseTool, setIsUseTool] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1);
  const [values, setValues] = useState([minPrice, maxPrice]);
  const [currentStarLevel, setCurrentStarLevel] = useState(0);
  const [priceAndRatingData, setPriceAndRatingData] = useState([]);

  useEffect(() => {
    setValues([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    let currentText = "";
    let index = 0;
    let intervalId;

    if (!searchValue) {
      const typingEffect = () => {
        if (index < fullText.length) {
          currentText += fullText[index];
          setPlaceholderText(currentText);
          index++;
        } else {
          currentText = "";
          index = 0;
        }
      };

      intervalId = setInterval(typingEffect, typingSpeed);
    } else {
      setPlaceholderText("");
    }

    return () => clearInterval(intervalId);
  }, [searchValue]);

  useEffect(() => {
    if (selectedFilter !== "none") {
      const filteredData =
        category !== "All"
          ? food_list.filter((item) => item.category === category)
          : [];

      setCategoryData(filteredData);
    }
  }, [category, food_list, selectedFilter]);

  useEffect(() => {
    try {
      setIsLoading(true);
      getMinMaxPrice();
      const currentData = pagination.find(
        (item) => item.name === indexPagination
      );
      if (currentData) {
        const currentPages = currentData.currentPage;
        updatePagination(
          indexPagination,
          food_list,
          currentPages,
          food_list.slice(0, 12)
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [food_list]);

  useEffect(() => {
    try {
      setIsLoading(true);
      if (selectedFilter === "none") {
        if (category === "All") {
          setIndexPagination("list");
          const currentData = pagination.find(
            (item) => item.name === indexPagination
          );
          if (currentData) {
            const currPage = currentData.currentPage;
            updatePagination(
              indexPagination,
              food_list,
              currPage,
              food_list.slice(
                currPage * postPerPage - postPerPage,
                currPage * postPerPage
              )
            );
          } else {
            updatePagination(
              "list",
              food_list,
              1,
              food_list.slice(0, postPerPage)
            );
          }
        } else {
          const currentData = pagination.find(
            (item) => item.name === indexPagination
          );
          const categoryData = food_list.filter(
            (item) => item.category === category
          );
          if (currentData) {
            const currPage = currentData.currentPage;
            updatePagination(
              indexPagination,
              categoryData,
              currPage,
              categoryData.slice(
                postPerPage * currPage - postPerPage,
                postPerPage * currPage
              )
            );
          } else {
            updatePagination(
              indexPagination,
              categoryData,
              1,
              categoryData.slice(0, postPerPage)
            );
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [category, selectedFilter]);

  useEffect(() => {
    setIsLoading(true);
    const currentData = pagination.find(
      (item) => item.name === indexPagination
    );
    if (currentData) {
      setFilterFood(currentData.currentPosts);
    }
    setIsLoading(false);
  }, [pagination]);

  useEffect(() => {
    if (searchValue.length > 0 && isSuccess) {
      setIsShowPagination(false);
    } else {
      setIsShowPagination(true);
    }
  }, [searchValue, isSuccess]);

  const onFilterFoodByPriceAndRating = useCallback(async () => {
    if (selectedFilter === "both") {
      try {
        setIsLoading(true);
        const foodListParam = categoryData.length
          ? categoryData.map((item) => item._id)
          : [];

        const response = await axios.get(
          `${url}/api/food/filterFoodByPriceAndRating`,
          {
            params: {
              minPrice: values[0],
              maxPrice: values[1],
              values: values,
              rating: currentStarLevel,
              foodList: foodListParam,
            },
          }
        );

        if (response.data.success) {
          setPriceAndRatingData(response.data.data);
        } else {
          setPriceAndRatingData([]);
        }
      } catch (error) {
        console.error("Error fetching food by price and rating:", error);
        setPriceAndRatingData([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [values, currentStarLevel, categoryData, selectedFilter]);

  useEffect(() => {
    if (selectedFilter === "both") {
      onFilterFoodByPriceAndRating();
    }
  }, [values, currentStarLevel, categoryData, onFilterFoodByPriceAndRating]);

  useEffect(() => {
    if (selectedFilter === "both") {
      updatePagination(
        "both",
        priceAndRatingData,
        1,
        priceAndRatingData.slice(0, postPerPage)
      );
      setIndexPagination("both");
    }
  }, [priceAndRatingData]);

  const getMinMaxPrice = async () => {
    if (food_list.length > 0) {
      const prices = food_list.map((food) => food.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      setMinPrice(min);
      setMaxPrice(max);
    } else {
      setMinPrice(0);
      setMaxPrice(1);
    }
  };

  const onSearchChangeHandler = (value) => {
    setSearchValue(value);
    onSearchHandler(value, false);
    setSelectedIndex(-1);
  };

  const onSearchHandler = async (value, isExplicitSearch) => {
    try {
      setIsLoading(true);
      let searchUrl;

      if (isExplicitSearch) {
        searchUrl = `${url}/api/food/getFoodByNameForUserCanNull?name=${value}`;
      } else {
        searchUrl = `${url}/api/food/getFoodByNameForUser?name=${value}`;
      }

      const response = await axios.get(searchUrl);

      if (response.data.success) {
        if (response.data.data !== null) {
          setSearchData(response.data.data || []);
          setIsSuccess(true);
        } else {
          setSearchData([]);
          setIsSuccess(true);
        }
      } else {
        setSearchData([]);
        setIsSuccess(false);
      }
    } catch (error) {
      setSearchData([]);
      setIsSuccess(false);
      console.error(error);
      toast.error("An error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchClick = () => {
    if (searchValue.length > 0) {
      onSearchHandler(searchValue, true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % suggest.length;
        scrollToSuggestion(newIndex);
        return newIndex;
      });
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prevIndex) => {
        const newIndex =
          prevIndex === -1
            ? suggest.length - 1
            : (prevIndex - 1 + suggest.length) % suggest.length;
        scrollToSuggestion(newIndex);
        return newIndex;
      });
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      onSearchChangeHandler(suggest[selectedIndex]);
    } else if (e.key === "Enter" && searchValue.length > 0) {
      onSearchHandler(searchValue, true);
    }
  };

  const scrollToSuggestion = (index) => {
    const element = document.getElementById(`suggestion-${index}`);
    if (element) {
      element.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  };

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
  };

  const onCloseTool = () => {
    setIsUseTool((prev) => !prev);
    setSelectedFilter("none");
  };

  return (
    <div className="food-display" id="food-display">
      <div className="food-display_title_search">
        <div className="food-display_tools-container">
          <h2>Top dishes near you</h2>
          {!isUseTool ? (
            <div
              className="food-display_tools"
              onClick={() => setIsUseTool((prev) => !prev)}
              title="Filter to find your food"
            >
              <span>. . .</span>
              <div className="tooltip">Click here to filter</div>
            </div>
          ) : (
            <div className="food-display_tools-control">
              <span className="food-display_tools-filter-with">
                Filter With
              </span>
              <div className="food-display-tools-close">
                <div className="food-display_tools-control-filter-type">
                  <label>
                    <input
                      type="radio"
                      name="filter"
                      value="none"
                      checked={selectedFilter === "none"}
                      onChange={handleFilterChange}
                    />
                    None
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="filter"
                      value="price"
                      checked={selectedFilter === "price"}
                      onChange={handleFilterChange}
                    />
                    Price
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="filter"
                      value="rating"
                      checked={selectedFilter === "rating"}
                      onChange={handleFilterChange}
                    />
                    Rating
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="filter"
                      value="both"
                      checked={selectedFilter === "both"}
                      onChange={handleFilterChange}
                    />
                    Both
                  </label>
                </div>
                <div
                  className="close-icon"
                  onClick={() => onCloseTool()}
                  title="Stop Filter"
                >
                  <CloseIcon color={"black"} size={"1rem"} />
                </div>
              </div>
              <p className="food-display_tools-price-slider">Price</p>
              <div className="food-display_tools-control-filter-price-slider">
                <PriceSlider
                  setIsLoading={setIsLoading}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  url={url}
                  categoryData={categoryData}
                  values={values}
                  setValues={setValues}
                />
              </div>
              <p className="food-display_tools-filter-rating">Rating</p>
              <div className="food-display_tools-control-filter-rating">
                <RatingFood
                  setIsLoading={setIsLoading}
                  url={url}
                  categoryData={categoryData}
                  currentStarLevel={currentStarLevel}
                  setCurrentStarLevel={setCurrentStarLevel}
                />
              </div>
            </div>
          )}
        </div>
        <div className="food-display_search-container">
          <div className="food-display_search">
            <input
              onChange={(e) => onSearchChangeHandler(e.target.value)}
              onKeyDown={handleKeyDown}
              type="text"
              value={searchValue}
              placeholder={placeholderText}
            />
            <div className="search_img" onClick={handleSearchClick}>
              <SearchIcon color={"rgb(145, 145, 145)"} size={15} />
            </div>
          </div>
          {searchValue.length > 0 && suggest.length > 0 && (
            <div className="food-display_search-suggest">
              <div className="food-display_search-suggest-container">
                {suggest.map((name, index) => (
                  <div
                    key={index}
                    id={`suggestion-${index}`}
                    className={`food-display_search-suggest_data ${
                      index === selectedIndex
                        ? "food-display_search-suggest_data-selected"
                        : ""
                    }`}
                    onClick={() => onSearchChangeHandler(name)}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="food-display-list">
        {searchValue.length > 0 && isSuccess
          ? searchData.map((item, index) => (
              <FoodItem
                key={index}
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
                setIsLoading={setIsLoading}
              />
            ))
          : filterFood.map((item, index) => (
              <FoodItem
                key={index}
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
                setIsLoading={setIsLoading}
              />
            ))}
      </div>
    </div>
  );
};

export default FoodDisplay;
