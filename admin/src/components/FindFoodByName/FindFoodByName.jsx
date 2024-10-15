import React, { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import axios from "axios";
import { toast } from "react-toastify";
import "./FindFoodByName.css";
import { images } from "../../constants/data";
import Update from "../FoodItems/Update/Update";

const FindFoodByName = ({ url, setIsSearch, setIsLoading }) => {
  const [value, setValue] = useState("");
  const [isUpdateInSearch, setIsUpdateInSearch] = useState(false);
  const [filterList, setFilterList] = useState([]);
  const [data, setData] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [dataUpdate, setDataUpdate] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });
  const searchInputRef = useRef(null);

  useEffect(() => {
    searchInputRef.current.focus();
  }, []);

  useEffect(() => {
    const debouncedSearch = debounce(onSearchHandler, 300);
    if (value.trim().length > 0) {
      debouncedSearch();
    } else {
      setFilterList([]);
      setData({});
      setIsSuccess(false);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [value]);

  const removeFood = async (foodId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        setIsLoading(true);
        await axios.post(`${url}/api/food/remove/`, { id: foodId });
        fetchList();
        toast.success("Food deleted successfully.");
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while deleting.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updateFood = (item) => {
    setDataUpdate({
      id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
    });
    setIsUpdateInSearch(true);
  };

  const fetchList = async () => {
    await onSearchHandler();
  };

  const onSearchHandler = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${url}/api/food/getFoodByName?name=${value}`
      );
      if (response.data.success) {
        const { data: foodData } = response.data;
        if (foodData.length > 0) {
          setFilterList(foodData);
          setData(foodData[0]);
          setIsSuccess(true);
        } else {
          setIsSuccess(false);
        }
      } else {
        setIsSuccess(false);
      }
    } catch (error) {
      setIsSuccess(false);
      console.error(error);
      toast.error("An error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (foodId, status) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${url}/api/food/updateStatus`, {
        id: foodId,
        status,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error("Error updating status");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating status.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-food-by-name-container">
      {isUpdateInSearch ? (
        <Update
          url={url}
          dataUp={dataUpdate}
          isUpdateInSearch={isUpdateInSearch}
          setIsUpdateInSearch={setIsUpdateInSearch}
          fetchList={fetchList}
          setIsLoading={setIsLoading}
        />
      ) : (
        <div className="search-food-by-name-container">
          <div className="search">
            <i
              className="fas fa-arrow-left search-food-by-name-img"
              onClick={() => setIsSearch(false)}
              aria-label="Back"
            ></i>
            <div className="search-food-by-name">
              <div className="search-food-by-name-input">
                <input
                  onChange={(e) => setValue(e.target.value)}
                  type="text"
                  value={value}
                  ref={searchInputRef}
                  placeholder="Food name"
                />
                <i className="fas fa-search"></i>
              </div>
            </div>
          </div>
          <div className="search-food-by-name-list-table-container">
            {isSuccess ? (
              <div className="list-table">
                <div className="list-table-format title">
                  <b>Image</b>
                  <b>Name</b>
                  <b>Category</b>
                  <b>Price</b>
                  <b>Action</b>
                  <b>Status</b>
                </div>
                {filterList.length > 0 ? (
                  filterList.map((item) => (
                    <div key={item._id} className="list-table-format">
                      <img
                        src={`${url}/images/${item.image}`}
                        alt={item.name}
                      />
                      <p>{item.name}</p>
                      <p>{item.category}</p>
                      <p>{item.price}</p>
                      <div className="list-table-format-action">
                        <button
                          onClick={() => updateFood(item)}
                          className="edit"
                          type="button"
                        >
                          <i className="fas fa-edit"></i>
                          Edit
                        </button>
                        <button
                          onClick={() => removeFood(item._id)}
                          className="remove"
                        >
                          <i className="fas fa-trash-alt"></i>
                          Remove
                        </button>
                      </div>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(item._id, e.target.value)
                        }
                        className="list-table-status"
                      >
                        <option value="serving">Serving</option>
                        <option value="paused">Paused</option>
                      </select>
                    </div>
                  ))
                ) : (
                  <p className="search-food-by-name-list-table-not-found">
                    Food not found
                  </p>
                )}
              </div>
            ) : (
              <p className="search-food-by-name-list-table-not-found">
                Food not found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FindFoodByName;
