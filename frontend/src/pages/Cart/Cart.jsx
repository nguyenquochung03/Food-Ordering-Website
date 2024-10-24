import React, { useContext, useEffect, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import PageTracker from "../../components/PageTracker/PageTracker";
import moment from "moment";
import axios from "axios";

const Cart = ({ setIsLoading }) => {
  const {
    token,
    cartItems,
    food_list,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
  } = useContext(StoreContext);
  const navigate = useNavigate();

  const [timeOperate, setTimeOperate] = useState("non-fixed");
  const [nonFixedTime, setNonFixedTime] = useState({
    start: "",
    end: "",
  });
  const [customTimes, setCustomTimes] = useState({
    morning: { start: "", end: "" },
    afternoon: { start: "", end: "" },
    evening: { start: "", end: "" },
  });
  const [closedPeriods, setClosedPeriods] = useState({
    morning: false,
    afternoon: false,
    evening: false,
  });

  useEffect(() => {
    fetchOperatingData();
  }, []);

  const fetchOperatingData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${url}/api/operating/getOperatingData`);
      const data = response.data;

      if (data.success) {
        setTimeOperate(data.data.timeOperate || "non-fixed");
        setNonFixedTime(data.data.nonFixedTime || { start: "", end: "" });
        setCustomTimes(
          data.data.customTimes || {
            morning: { start: "", end: "" },
            afternoon: { start: "", end: "" },
            evening: { start: "", end: "" },
          }
        );
        setClosedPeriods(
          data.data.closedPeriods || {
            morning: false,
            afternoon: false,
            evening: false,
          }
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onProceedHandler = () => {
    setIsLoading(true);
    let isCartEmpty = true;
    for (const [key, value] of Object.entries(cartItems)) {
      if (value > 0) {
        isCartEmpty = false;
        break;
      }
    }
    setIsLoading(false);

    if (!token) {
      alert("Please log in before paying");
    } else if (isCartEmpty) {
      alert("Please add products to cart before payment");
    } else if (isOperatingNow()) {
      navigate("/order");
    }
  };

  const isOperatingNow = () => {
    const currentTime = moment();

    if (timeOperate === "non-fixed") {
      const nonFixedStart = moment(nonFixedTime.start, "HH:mm");
      const nonFixedEnd = moment(nonFixedTime.end, "HH:mm");

      if (currentTime.isBetween(nonFixedStart, nonFixedEnd)) {
        return true;
      } else {
        alert("Currently the shop is not open");
        return false;
      }
    } else if (timeOperate === "custom-morning-afternoon-evening") {
      const morningStart = moment(customTimes.morning.start, "HH:mm");
      const morningEnd = moment(customTimes.morning.end, "HH:mm");
      const afternoonStart = moment(customTimes.afternoon.start, "HH:mm");
      const afternoonEnd = moment(customTimes.afternoon.end, "HH:mm");
      const eveningStart = moment(customTimes.evening.start, "HH:mm");
      const eveningEnd = moment(customTimes.evening.end, "HH:mm");

      if (
        closedPeriods.morning === true &&
        currentTime.isBetween(morningStart, morningEnd)
      ) {
        alert("Currently the shop is not open in the morning");
        return false;
      } else if (
        closedPeriods.afternoon === true &&
        currentTime.isBetween(afternoonStart, afternoonEnd)
      ) {
        alert("Currently the shop is not open in the afternoon");
        return false;
      } else if (
        closedPeriods.evening === true &&
        currentTime.isBetween(eveningStart, eveningEnd)
      ) {
        alert("Currently the shop is not open in the evening");
        return false;
      }

      if (
        currentTime.isBetween(morningStart, morningEnd) ||
        currentTime.isBetween(afternoonStart, afternoonEnd) ||
        currentTime.isBetween(eveningStart, eveningEnd)
      ) {
        return true;
      } else {
        alert("Currently the shop is not open");
        return false;
      }
    }

    return false;
  };

  return (
    <React.Fragment>
      <div className="cart">
        <div className="cart-items">
          <div className="cart-items-title">
            <p>Items</p>
            <p>Title</p>
            <p>Price</p>
            <p>Quantity</p>
            <p>Total</p>
            <p>Add</p>
            <p>Remove</p>
          </div>
          <br />
          <hr />
          {food_list.map((item, index) => {
            if (cartItems[item._id] > 0) {
              return (
                <div key={index}>
                  <div className="cart-items-title cart-items-item">
                    <img src={url + "/images/" + item.image} alt="" />
                    <p>{item.name}</p>
                    <p>${item.price}</p>
                    <p>{cartItems[item._id]}</p>
                    <p>${item.price * cartItems[item._id]}</p>
                    <p
                      onClick={() => addToCart(item._id)}
                      className="cross-add"
                    >
                      +
                    </p>
                    <p
                      onClick={() => removeFromCart(item._id)}
                      className="cross-delete"
                    >
                      x
                    </p>
                  </div>
                  <hr />
                </div>
              );
            }
          })}
        </div>
        <div className="cart-bottom">
          <div className="cart-total">
            <h2>Cart Totals</h2>
            <div>
              <div className="cart-total-details">
                <p>Subtotal</p>
                <p>${getTotalCartAmount()}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <b>Total</b>
                <b>
                  ${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}
                </b>
              </div>
            </div>
            <button onClick={() => onProceedHandler()}>
              PROCEED TO CHECKOUT
            </button>
          </div>
          <div className="cart-promocodes">
            <div>
              <p>If you have promo code, Enter it here</p>
              <div className="cart-promocodes-input">
                <input type="text" placeholder="promo code" />
                <button>Submit</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PageTracker pageUrl={`${url}/cart`} />
    </React.Fragment>
  );
};

export default Cart;
