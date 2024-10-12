import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ViewDetailDeliveryStaff.css";

function ViewDetailDeliveryStaff({
  url,
  setIsLoading,
  setIsViewDetail,
  staffData,
}) {
  const { id, name, phone, email, vehicleType, workingAreas, status } =
    staffData;

  const [orders, setOrders] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${url}/api/deliveryStaffOrder/getOrdersByStaff?deliveryStaffId=${id}`
        );
        setOrders(response.data.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [id]);

  return (
    <div className="view-detail-container">
      <div className="header">
        <i
          className="fas fa-arrow-left back-icon"
          onClick={() => setIsViewDetail(false)}
        ></i>
        <h2>Delivery Staff Details</h2>
      </div>

      <div className="staff-info">
        <div className="staff-field">
          <strong>Name:</strong> <span>{name}</span>
        </div>
        <div className="staff-field">
          <strong>Phone Number:</strong> <span>{phone}</span>
        </div>
        <div className="staff-field">
          <strong>Email:</strong> <span>{email}</span>
        </div>
        <div className="staff-field">
          <strong>Vehicle Type:</strong> <span>{vehicleType}</span>
        </div>

        <div className="working-areas">
          <h4>Working Areas</h4>
          {workingAreas.map((area, index) => (
            <div key={index} className="working-area-item">
              <p>
                <strong>Province:</strong> {area.province || "Not specified"}
              </p>
              <p>
                <strong>District:</strong> {area.district || "Not specified"}
              </p>
            </div>
          ))}
        </div>

        <div className="staff-field">
          <strong>Status:</strong> <span>{status}</span>
        </div>
      </div>

      {/* Hiển thị đơn hàng nếu có */}
      <div className="order-details">
        <h4>Order Details</h4>
        <div>
          {orders ? (
            <>
              <h5>In Processing</h5>
              {orders["In processing"].map((order, index) => (
                <div key={index}>
                  <p>Order ID: {order._id}</p>
                  <p>Status: {order.status}</p>
                </div>
              ))}

              <h5>Delivered</h5>
              {orders["Delivered"].map((order, index) => (
                <div key={index}>
                  <p>Order ID: {order._id}</p>
                  <p>Status: {order.status}</p>
                </div>
              ))}

              <h5>Cancelled</h5>
              {orders["Cancelled"].map((order, index) => (
                <div key={index}>
                  <p>Order ID: {order._id}</p>
                  <p>Status: {order.status}</p>
                </div>
              ))}
            </>
          ) : (
            <p>No orders found for this delivery staff.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewDetailDeliveryStaff;
