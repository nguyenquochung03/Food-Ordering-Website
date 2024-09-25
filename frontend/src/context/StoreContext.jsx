import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "http://localhost:4000";
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [tokenExpires, setTokenExpires] = useState(false);
  const [food_list, setFoodList] = useState([]);
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("none");

  // //// Pagination
  const [postPerPage, setPostPerPage] = useState(12);
  const [pagination, setPagination] = useState([]);
  const [indexPagination, setIndexPagination] = useState("list");

  const updatePagination = (name, foodCategory, currentPage, currentPosts) => {
    const exists = pagination.some((item) => item.name === name);

    if (exists) {
      setPagination((prevState) => {
        const updatedPagination = prevState.map((item) =>
          item.name === name
            ? { ...item, name, foodCategory, currentPage, currentPosts }
            : item
        );
        return updatedPagination;
      });
    } else {
      setPagination((prevState) => [
        ...prevState,
        { name, foodCategory, currentPage, currentPosts },
      ]);
    }
  };

  //// End pagination

  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }

    if (token) {
      await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token } }
      );
    }
  };

  const addToCartWithAmount = async (itemId, amount) => {
    setCartItems((prev) => ({ ...prev, [itemId]: amount }));

    if (token) {
      await axios.post(
        url + "/api/cart/addToCartWithAmount",
        { itemId, amount },
        { headers: { token } }
      );
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;

    if (cartItems) {
      const isCartEmpty = Object.keys(cartItems).length === 0;

      if (!isCartEmpty) {
        for (const item in cartItems) {
          if (cartItems[item] > 0) {
            let itemInfo = food_list.find((product) => product._id === item);
            if (itemInfo) {
              totalAmount += itemInfo.price * cartItems[item];
            }
          }
        }
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    try {
      const userRole = "user";
      const response = await axios.get(`${url}/api/food/list`, {
        params: { userRole },
      });
      setFoodList(response.data.data);
    } catch (error) {
      console.error("Failed to fetch food list:", error);
    }
  };

  const loadCartData = async (token) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get/",
        {},
        { headers: { token } }
      );
      setCartItems(response.data.cartData);
    } catch (error) {
      console.log("Failed to load cart data:", error);
    }
  };

  const loadUserName = async (token) => {
    try {
      const response = await axios.post(
        url + "/api/user/userName",
        {},
        { headers: { token } }
      );
      setUserName(response.data.data);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const loadUserImage = async (token) => {
    try {
      const response = await axios.post(
        url + "/api/user/userImage",
        {},
        { headers: { token } }
      );
      setUserImage(response.data.data);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      if (localStorage.getItem("token")) {
        if (!tokenExpires) {
          setToken(localStorage.getItem("token"));
          await loadCartData(localStorage.getItem("token"));
          await loadUserName(localStorage.getItem("token"));
          await loadUserImage(localStorage.getItem("token"));
        }
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadCartAfterLogin() {
      if (localStorage.getItem("token")) {
        if (!tokenExpires) {
          await loadCartData(localStorage.getItem("token"));
          await loadUserName(localStorage.getItem("token"));
          await loadUserImage(localStorage.getItem("token"));
        }
      }
    }
    loadCartAfterLogin();
  }, [token]);

  useEffect(() => {
    async function load() {
      if (localStorage.getItem("token")) {
        if (!tokenExpires) {
          await loadUserImage(localStorage.getItem("token"));
        }
      }
    }
    load();
  }, [userImage]);

  const updateToken = async () => {
    if (localStorage.getItem("token")) {
      await loadCartData(localStorage.getItem("token"));
    }
    console.log("update token");
  };

  const contextValue = {
    food_list,
    postPerPage,
    pagination,
    updatePagination,
    indexPagination,
    setIndexPagination,
    cartItems,
    setCartItems,
    addToCart,
    addToCartWithAmount,
    loadCartData,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    updateToken,
    tokenExpires,
    setTokenExpires,
    userName,
    setUserName,
    userImage,
    setUserImage,
    selectedFilter,
    setSelectedFilter,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
