import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { PaginationContext } from "../../context/PaginationContext.jsx";
import Pagination from "../../components/Pagination/Pagination.jsx";
import Update from "../../components/FoodItems/Update/Update.jsx";
import "./List.css";
import { images } from "../../constants/data";
import FindFoodByName from "../../components/FindFoodByName/FindFoodByName.jsx";
import SkeletonLoadingList from "../../components/SkeletonLoading/SkeletonLoadingList/SkeletonLoadingList.jsx";
import Add from "../../components/FoodItems/AddFood/Add.jsx";

const List = ({ url, setIsLoading }) => {
  const {
    postsPerPage,
    pagination,
    updatePagination,
    indexPagination,
    setIndexPagination,
  } = useContext(PaginationContext);
  const [list, setList] = useState([]);
  const [filterList, setFilterList] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [dataUpdate, setDataUpdate] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdd, setIsAdd] = useState(false);

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    try {
      setIsLoading(true);
      const currentData = pagination.find(
        (item) => item.name === indexPagination
      );
      if (currentData) {
        const currentPages = currentData.currentPage;
        if (indexPagination === "All food list") {
          updatePagination(
            indexPagination,
            list,
            currentPages,
            list.slice(0, 12)
          );
        } else {
          const categoryData = list.filter(
            (item) => item.category === indexPagination
          );
          updatePagination(
            indexPagination,
            categoryData,
            currentPages,
            categoryData.slice(0, 12)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [list]);

  useEffect(() => {
    try {
      setIsLoading(true);
      if (indexPagination === "All food list") {
        setIndexPagination("All food list");
        const currentData = pagination.find(
          (item) => item.name === indexPagination
        );
        if (currentData) {
          const currPage = currentData.currentPage;
          updatePagination(
            indexPagination,
            list,
            currPage,
            list.slice(
              currPage * postsPerPage - postsPerPage,
              currPage * postsPerPage
            )
          );
        } else {
          updatePagination(
            "All food list",
            list,
            1,
            list.slice(0, postsPerPage)
          );
        }
      } else {
        const currentData = pagination.find(
          (item) => item.name === indexPagination
        );
        const categoryData = list.filter(
          (item) => item.category === indexPagination
        );
        if (currentData) {
          const currPage = currentData.currentPage;
          updatePagination(
            indexPagination,
            categoryData,
            currPage,
            categoryData.slice(
              postsPerPage * currPage - postsPerPage,
              postsPerPage * currPage
            )
          );
        } else {
          updatePagination(
            indexPagination,
            categoryData,
            1,
            categoryData.slice(0, postsPerPage)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [indexPagination]);

  useEffect(() => {
    const currentData = pagination.find(
      (item) => item.name === indexPagination
    );
    if (currentData && currentData.currentPosts !== filterList) {
      setFilterList(currentData.currentPosts);
    }
  }, [pagination]);

  const fetchList = async () => {
    try {
      setIsLoading(true);
      const userRole = "admin";
      const response = await axios.get(`${url}/api/food/list`, {
        params: { userRole },
      });
      if (response.data.success) {
        setList(response.data.data);
        setLoading(false);
      } else {
        toast.error("Error");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching the list.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFood = async (foodId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        setIsLoading(true);
        const response = await axios.post(`${url}/api/food/remove/`, {
          id: foodId,
        });
        await fetchList();

        if (response.data.success) {
          toast.success(response.data.message);
        } else {
          toast.error("Error");
        }
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
    setIsUpdate(true);
  };

  const onChangeHandler = (event) => {
    setIsLoading(true);
    const { value } = event.target;
    setIndexPagination(value);
    setIsLoading(false);
  };

  const onSearchHandler = () => {
    setIsSearch(true);
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

  return isAdd ? (
    <Add
      fetchList={fetchList}
      setIsAdd={setIsAdd}
      url={url}
      setIsLoading={setIsLoading}
    />
  ) : (
    <div className="list-food">
      {loading ? (
        <SkeletonLoadingList />
      ) : isSearch ? (
        <FindFoodByName
          url={url}
          setIsSearch={setIsSearch}
          setIsLoading={setIsLoading}
        />
      ) : (
        <div>
          {isUpdate ? (
            <Update
              url={url}
              dataUp={dataUpdate}
              setIsUpdate={setIsUpdate}
              fetchList={fetchList}
              setIsLoading={setIsLoading}
            />
          ) : (
            <div className="flex-col">
              <div className="list-food-type">
                <div className="list-food-add">
                  <button
                    onClick={() => setIsAdd(true)}
                    type="button"
                    title="Add your food"
                  >
                    <img src={images.add_icon} alt="add icon" />
                    Add
                  </button>
                </div>
                <div className="list-food-type-search">
                  <div className="img-container" title="Search your food">
                    <img
                      onClick={onSearchHandler}
                      src={images.search_1}
                      alt="search icon"
                    />
                  </div>
                  <select
                    onChange={onChangeHandler}
                    value={indexPagination}
                    name="category"
                    title="Filter your food"
                  >
                    <option value="All food list">All food list</option>
                    <option value="Salad">Salad</option>
                    <option value="Rolls">Rolls</option>
                    <option value="Deserts">Deserts</option>
                    <option value="Sandwich">Sandwich</option>
                    <option value="Cake">Cake</option>
                    <option value="Pure Veg">Pure Veg</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Noodles">Noodles</option>
                  </select>
                </div>
              </div>
              <div className="list-table">
                <div className="list-table-format title">
                  <b>Image</b>
                  <b>Name</b>
                  <b>Category</b>
                  <b>Price</b>
                  <b>Action</b>
                  <b>Status</b>
                </div>
                {filterList.map((item, index) => (
                  <div key={index} className="list-table-format">
                    <img src={`${url}/images/` + item.image} alt="" />
                    <p>{item.name}</p>
                    <p>{item.category}</p>
                    <p>{item.price}</p>
                    <div className="list-table-format-action">
                      <button
                        onClick={() => updateFood(item)}
                        className="edit"
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeFood(item._id)}
                        className="remove"
                      >
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
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                currentChunkIndex={currentChunkIndex}
                setCurrentChunkIndex={setCurrentChunkIndex}
                setIsLoading={setIsLoading}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default List;
