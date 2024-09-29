import React from "react";
import "./Slidebar.css";
import { images } from "../../constants/data";
import { NavLink } from "react-router-dom";

const Slidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-options">
        <NavLink
          to={"/operating"}
          className="sidebar-option"
          title="Manage your Operating"
        >
          <img
            className="sidebar-option_order-flavor"
            src={images.operating}
            alt="operating icon"
          />
          <p>Operating</p>
        </NavLink>
        <NavLink
          to={"/list"}
          className="sidebar-option"
          title="Manage your Food"
        >
          <img src={images.order_icon} alt="list icon" />
          <p>List Items</p>
        </NavLink>
        <NavLink
          to={"/deliveryStaff"}
          className="sidebar-option"
          title="Manage your Delivery Staff"
        >
          <img
            className="sidebar-option_order-flavor"
            src={images.delivery}
            alt="delivery icon"
          />
          <p>Delivery Staff</p>
        </NavLink>
        <NavLink to={"/order"} className="sidebar-option" title="Watch Orders">
          <img
            className="sidebar-option_order-flavor"
            src={images.order_flavor}
            alt="order icon"
          />
          <p>Orders</p>
        </NavLink>
        <NavLink
          to={"/account"}
          className="sidebar-option"
          title="Manage your Account"
        >
          <img
            className="sidebar-option_order-flavor"
            src={images.account}
            alt="account icon"
          />
          <p>Accounts</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Slidebar;
