import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ViewDetailDeliveryStaff.css";
import NormalPagination from "../../Pagination/NormalPagination/NormalPagination";

function OrderListOfDeliveryStaff({
  title,
  orders,
  filteredOrders,
  setFilteredOrders,
  setIsLoading,
}) {
  return (
    <div className="order-section">
      <h5 className="order-section-title">{title}</h5>
      {orders.length === 0 ? (
        <p className="order-empty">No order found</p>
      ) : (
        filteredOrders.map((order, index) => (
          <div key={index} className="order-item">
            <div className="order-item-details">
              <div className="order-item-foods">
                {order.items.map(
                  (item, idx) =>
                    `${item.name} x ${item.quantity}${
                      idx === order.items.length - 1 ? "" : ", "
                    }`
                )}
              </div>
              <div className="order-item-name">
                {order.address.firstName} {order.address.lastName}
              </div>
              <div className="order-item-address">
                <p>{order.address.street},</p>
                <p>
                  {order.address.ward}, {order.address.district},{" "}
                  {order.address.province}, {order.address.country}
                </p>
              </div>
              <div className="order-item-phone">
                <span>{order.address.phone}</span>
              </div>
            </div>
            <div className="order-item-price">
              <p>${order.amount}</p>
            </div>
          </div>
        ))
      )}
      <NormalPagination
        food_list={orders}
        setList={setFilteredOrders}
        setIsLoading={setIsLoading}
      />
    </div>
  );
}

function ViewDetailDeliveryStaff({
  url,
  setIsLoading,
  setIsViewDetail,
  dataDetail,
}) {
  const { id, name, phone, email, vehicleType, workingAreas, status } =
    dataDetail;

  const [orders, setOrders] = useState(null);
  const [listFilterInProcessing, setListFilterInProcessing] = useState([]);
  const [listFilterDelivered, setListFilterDelivered] = useState([]);
  const [listFilterCancelled, setListFilterCancelled] = useState([]);

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

      <div className="view-detail-container-order-details">
        <h4>Order Details</h4>
        <div className="order-lists-container">
          {orders ? (
            <>
              <OrderListOfDeliveryStaff
                title="In Processing"
                orders={orders["In processing"]}
                filteredOrders={listFilterInProcessing}
                setFilteredOrders={setListFilterInProcessing}
                setIsLoading={setIsLoading}
              />

              <OrderListOfDeliveryStaff
                title="Delivered"
                orders={orders["Delivered"]}
                filteredOrders={listFilterDelivered}
                setFilteredOrders={setListFilterDelivered}
                setIsLoading={setIsLoading}
              />

              <OrderListOfDeliveryStaff
                title="Cancelled"
                orders={orders["Cancelled"]}
                filteredOrders={listFilterCancelled}
                setFilteredOrders={setListFilterCancelled}
                setIsLoading={setIsLoading}
              />
            </>
          ) : (
            <p className="no-order-text">
              No orders found for this delivery staff.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewDetailDeliveryStaff;
