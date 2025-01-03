import React from "react";
import "./Navbar.css";
import { images } from "../../constants/data";
import { useNavigate } from "react-router-dom";

const Navbar = ({
  url,
  setToken,
  setIsLogin,
  setIsUpdateProfileImage,
  userName,
  userImage,
  isStatistic,
  setIsStatistic,
  selectedMonth,
  setSelectedMonth,
}) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setIsLogin(true);
  };

  const onStatisticHandler = () => {
    navigate("/");
    setIsStatistic(true);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div
          onClick={onStatisticHandler}
          className="navbar-logo"
          title="Back to Dashboard"
        >
          <p className="logo">Orange.</p>
          <p className="navbar-sub-title">Admin Panel</p>
        </div>
        {isStatistic && (
          <div className="input-container">
            <div className="triangle"></div>
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
            />
          </div>
        )}
      </div>
      <div className="navbar-profile">
        <img
          className="profile"
          src={`${url}/images/${userImage}`}
          alt="profile"
        />
        <ul className="navbar-profile-dropdown">
          <li className="navbar-profile-dropdown-username">{userName}</li>
          <hr />
          <li className="navbar-profile-dropdown-li" onClick={logout}>
            <i className="fas fa-sign-out-alt"></i>
            <span className="navbar-profile-dropdown-title">
              <p>Logout</p>
            </span>
          </li>
          <li
            className="navbar-profile-dropdown-li"
            onClick={() => setIsUpdateProfileImage((prev) => !prev)}
          >
            <i className="fas fa-user"></i>
            <span className="navbar-profile-dropdown-title">
              <p>Image</p>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
