import React from "react";
import "./Slidebar.css";
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
          <i className="fas fa-cogs sidebar-icon"></i>
          <div className="sidebar-option-title">
            <p>Operating</p>{" "}
          </div>
        </NavLink>
        <NavLink
          to={"/list"}
          className="sidebar-option"
          title="Manage your Food"
        >
          <i className="fas fa-utensils sidebar-icon"></i>
          <div className="sidebar-option-title">
            <p>List Items</p>{" "}
          </div>
        </NavLink>
        <NavLink
          to={"/deliveryStaff"}
          className="sidebar-option"
          title="Manage your Delivery Staff"
        >
          <i className="fas fa-shipping-fast sidebar-icon"></i>
          <div className="sidebar-option-title">
            <p>Delivery Staff</p>{" "}
          </div>
        </NavLink>
        <NavLink to={"/order"} className="sidebar-option" title="Watch Orders">
          <i className="fas fa-receipt sidebar-icon"></i>
          <div className="sidebar-option-title">
            <p>Orders</p>{" "}
          </div>
        </NavLink>
        <NavLink
          to={"/account"}
          className="sidebar-option"
          title="Manage your Account"
        >
          <i className="fas fa-user-circle sidebar-icon"></i>
          <div className="sidebar-option-title">
            <p>Accounts</p>{" "}
          </div>
        </NavLink>
      </div>
    </div>
  );
};

export default Slidebar;
