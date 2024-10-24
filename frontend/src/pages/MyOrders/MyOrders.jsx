import React, { useContext, useEffect, useRef, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { images } from "../../constants/data";
import { toast } from "react-toastify";
import ReactToPrint from "react-to-print";
import Invoice from "../../components/Invoice/Invoice";
import PageTracker from "../../components/PageTracker/PageTracker";

const MyOrders = ({ setIsLoading }) => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const orderStatuses = [
    { status: "Wait for Confirmation", icon: "fas fa-hourglass-start" },
    { status: "Food Processing", icon: "fas fa-utensils" },
    { status: "Out for delivery", icon: "fas fa-truck" },
    { status: "Delivered", icon: "fas fa-box-open" },
    { status: "Successful", icon: "fas fa-check-circle" },
    { status: "Cancelled", icon: "fas fa-times-circle" },
  ];

  const [currentStatus, setCurrentStatus] = useState("Wait for Confirmation");
  const [orderStatus, setOrderStatus] = useState([]);
  const printRefs = useRef({});

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  useEffect(() => {
    loadOrderStatus();
  }, [data, currentStatus]);

  useEffect(() => {
    if (data.length > 0) {
      const filteredOrders = data.filter(
        (order) => order.status !== "Successful" && order.status !== "Cancelled"
      );

      if (filteredOrders.length > 0) {
        const latestOrder = filteredOrders.reduce((latest, order) => {
          return new Date(order.date) > new Date(latest.date) ? order : latest;
        }, filteredOrders[0]);

        setCurrentStatus(latestOrder.status);
      }
    }
  }, [data]);

  const onChangeStatus = (status) => {
    setCurrentStatus(status);
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      const sortedData = response.data.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setData(sortedData);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrderStatus = () => {
    let filteredOrders = [];
    setIsLoading(true);
    if (currentStatus === "Wait for Confirmation") {
      filteredOrders = data.filter(
        (order) => order.status === "Wait for Confirmation"
      );
    } else if (currentStatus === "Food Processing") {
      filteredOrders = data.filter(
        (order) => order.status === "Food Processing"
      );
    } else if (currentStatus === "Out for delivery") {
      filteredOrders = data.filter(
        (order) => order.status === "Out for delivery"
      );
    } else if (currentStatus === "Delivered") {
      filteredOrders = data.filter((order) => order.status === "Delivered");
    } else if (currentStatus === "Successful") {
      filteredOrders = data.filter((order) => order.status === "Successful");
    } else if (currentStatus === "Cancelled") {
      filteredOrders = data.filter((order) => order.status === "Cancelled");
    }
    setOrderStatus(filteredOrders);
    setIsLoading(false);
  };

  const statusHandler = async (event, orderId) => {
    try {
      setIsLoading(true);
      const response = await axios.post(url + "/api/order/status", {
        orderId,
        status: event.target.value,
      });
      if (response.data.success) {
        await fetchOrders();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (order) => {
    try {
      const updatedOrderResponse = await axios.get(`${url}/api/order/get`, {
        params: { orderId: order._id },
      });
      const updatedOrder = updatedOrderResponse.data.data;
      if (updatedOrder.status === order.status) {
        const result = window.confirm(
          "Are you sure you want to cancel this order?"
        );
        if (result) {
          setIsLoading(true);
          const updateSuccess = await statusHandler(
            { target: { value: "Cancelled" } },
            order._id
          );
          if (updateSuccess) {
            toast.success("Order Cancelled");
            await fetchOrders();
          } else {
            toast.error("Failed to cancel order");
          }
          setIsLoading(false);
        }
      } else {
        toast.info(
          `The order status has already been updated to ${updatedOrder.status}.`
        );
        await fetchOrders();
      }
    } catch (error) {
      console.error("Error handling order cancellation: ", error);
      toast.error("An error occurred while trying to cancel the order.");
    }
  };

  return (
    <React.Fragment>
      <div className="my-orders">
        <div onClick={fetchOrders} className="order-fetch-data">
          <button>
            <i className="fas fa-sync-alt"></i>
            Fetch Data
          </button>
        </div>
        <div className="order-status">
          {orderStatuses.map((statusObj, index) => (
            <button
              onClick={() => onChangeStatus(statusObj.status)}
              key={index}
              className={currentStatus === statusObj.status ? "active" : ""}
            >
              <i className={statusObj.icon}></i>
              {statusObj.status === "Wait for Confirmation"
                ? "Comfirmation"
                : statusObj.status}
            </button>
          ))}
        </div>
        <div className="container">
          {orderStatus.map((order) => (
            <div
              key={order._id}
              className="my-orders-order"
              style={{
                gridTemplateColumns:
                  currentStatus === "Wait for Confirmation" ||
                  currentStatus === "Delivered" ||
                  currentStatus === "Successful"
                    ? "0.5fr 2fr 1fr 1fr 1.5fr 1fr"
                    : "0.5fr 2fr 1fr 1fr 1fr",
              }}
            >
              <i className="fas fa-box"></i>
              <p>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " x " + item.quantity;
                  } else {
                    return item.name + " x " + item.quantity + ", ";
                  }
                })}
              </p>
              <p>${order.amount}.00</p>
              <p>Items: {order.items.length}</p>
              <p>
                <span>&#x25cf;</span>
                <b>{order.status}</b>
              </p>
              {currentStatus === "Wait for Confirmation" &&
                order.paymentType === "Cash" && (
                  <button onClick={async () => await handleCancelOrder(order)}>
                    Cancel
                  </button>
                )}
              {currentStatus === "Delivered" && (
                <button
                  onClick={async () => {
                    const updateSuccess = await statusHandler(
                      { target: { value: "Successful" } },
                      order._id
                    );
                    if (updateSuccess) {
                      toast.success("Order Delivery Successful");
                    } else {
                      toast.error("Failed to receive order");
                    }
                  }}
                  className="my-order-received-button"
                >
                  <i className="fas fa-check-circle"></i> Received
                </button>
              )}
              {currentStatus === "Successful" && (
                <ReactToPrint
                  trigger={() => (
                    <button className="my-order-print-button">
                      <i className="fas fa-print"></i> Print Invoice
                    </button>
                  )}
                  content={() => printRefs.current[order._id]}
                />
              )}
              <div style={{ display: "none" }}>
                <Invoice
                  ref={(el) => (printRefs.current[order._id] = el)}
                  order={order}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <PageTracker pageUrl={`${url}/myorders`} />
    </React.Fragment>
  );
};

export default MyOrders;
