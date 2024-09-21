import React, { useCallback, useContext, useEffect, useState } from "react";
import { Range, getTrackBackground } from "react-range";
import "./PriceSlider.css";
import axios from "axios";
import { StoreContext } from "../../../context/StoreContext";

const PriceSlider = ({
  setIsLoading,
  minPrice,
  maxPrice,
  url,
  categoryData,
  values,
  setValues,
}) => {
  const [priceData, setPriceData] = useState([]);
  const { updatePagination, setIndexPagination, postPerPage, selectedFilter } =
    useContext(StoreContext);

  const onFilterFoodByPrice = useCallback(async () => {
    if (selectedFilter === "price") {
      try {
        setIsLoading(true);
        const foodListParam = categoryData.length
          ? categoryData.map((item) => item._id)
          : [];

        const response = await axios.get(`${url}/api/food/filterFoodByPrice`, {
          params: {
            minPrice: values[0],
            maxPrice: values[1],
            foodList: foodListParam,
          },
        });

        if (response.data.success) {
          setPriceData(response.data.data);
        } else {
          setPriceData([]);
        }
      } catch (error) {
        console.error("Error fetching food by price:", error);
        setPriceData([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [values, categoryData, selectedFilter]);

  useEffect(() => {
    if (selectedFilter === "price") {
      onFilterFoodByPrice();
    }
  }, [values, categoryData, onFilterFoodByPrice]);

  useEffect(() => {
    if (selectedFilter === "price") {
      updatePagination("price", priceData, 1, priceData.slice(0, postPerPage));
      setIndexPagination("price");
    }
  }, [priceData]);

  return (
    <div className="price-slider">
      <div className="slider-values">
        <span>${values[0]}</span>
        <span>${values[1]}</span>
      </div>
      <Range
        values={values}
        step={1}
        min={minPrice}
        max={maxPrice}
        onChange={(values) => setValues(values)}
        renderTrack={({ props, children }) => {
          const { key, ...restProps } = props;
          return (
            <div
              {...restProps}
              style={{
                ...restProps.style,
                height: "6px",
                width: "100%",
                background: getTrackBackground({
                  values,
                  colors: ["#ccc", "#000000", "#ccc"],
                  min: minPrice,
                  max: maxPrice,
                }),
                borderRadius: "4px",
              }}
              key={key}
            >
              {children}
            </div>
          );
        }}
        renderThumb={({ props, isDragged }) => {
          const { key, ...restProps } = props;
          return (
            <div
              {...restProps}
              style={{
                ...restProps.style,
                height: "15px",
                width: "15px",
                borderRadius: "50%",
                backgroundColor: "var(--color-main)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0px 2px 6px #AAA",
              }}
              key={key}
            ></div>
          );
        }}
      />
    </div>
  );
};

export default PriceSlider;
