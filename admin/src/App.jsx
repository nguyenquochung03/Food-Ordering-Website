import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Slidebar from "./components/Slidebar/Slidebar";
import List from "./pages/List/List";
import Order from "./pages/Order/Order";
import Account from "./pages/Account/Account";
import StaffDelivery from "./pages/StaffDelivery/StaffDelivery";

import axios from "axios";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/Login/Login";
import { useEffect } from "react";
import ShowSpinnerLoader from "./components/ShowSpinnerLoader/ShowSpinnerLoader";
import { OrderPaginationProvider } from "./context/OrderPaginationContext";
import { PaginationProvider } from "./context/PaginationContext";
import UpdateProfilePicture from "./components/UpdateProfilePicture/UpdateProfilePicture";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import Operating from "./pages/Operating/Operating";

const App = () => {
  const url = "http://localhost:4000";
  const [isLogin, setIsLogin] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [userName, setUserName] = useState("");
  const [token, setToken] = useState("");
  const [tokenExpires, setTokenExpires] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateProfileImage, setIsUpdateProfileImage] = useState(false);
  const [userImage, setUserImage] = useState("");
  const [isStatistic, setIsStatistic] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const location = useLocation();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  useEffect(() => {
    loadUserImage(token);
  }, [userImage]);

  useEffect(() => {
    if (location.pathname === "/") {
      setIsStatistic(true);
    } else {
      setIsStatistic(false);
    }
  }, [location]);

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

  const checkTokenExpires = async (token) => {
    try {
      const response = await axios.post(
        url + "/api/user/verifyToken",
        {},
        { headers: { token } }
      );
      return response.data.success;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  async function loadData() {
    const token = localStorage.getItem("token");
    if (token) {
      const isValidToken = await checkTokenExpires(token);
      if (isValidToken) {
        setToken(token);
        setIsLogin(false);
        await loadUserName(token);
        await loadUserImage(token);
      } else {
        localStorage.removeItem("token");
        setTokenExpires(true);
        setIsLogin(true);
      }
    }
  }

  return (
    <React.Fragment>
      {isLoading && <ShowSpinnerLoader />}
      {isLogin ? (
        <>
          <ToastContainer />
          <Login
            url={url}
            setIsLogin={setIsLogin}
            setToken={setToken}
            setShowResetPassword={setShowResetPassword}
            setIsLoading={setIsLoading}
          />
        </>
      ) : showResetPassword ? (
        <ResetPassword
          url={url}
          setIsLogin={setIsLogin}
          setShowResetPassword={setShowResetPassword}
          setIsLoading={setIsLoading}
        />
      ) : (
        <div>
          {isUpdateProfileImage && (
            <UpdateProfilePicture
              setIsUpdateProfileImage={setIsUpdateProfileImage}
              setIsLoading={setIsLoading}
              token={token}
              setUserImage={setUserImage}
            />
          )}
          <ToastContainer />
          <div className="app">
            <Slidebar />
            <div className="app-content">
              <Navbar
                isStatistic={isStatistic}
                setIsStatistic={setIsStatistic}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                url={url}
                setIsLogin={setIsLogin}
                setToken={setToken}
                userName={userName}
                userImage={userImage}
                setIsUpdateProfileImage={setIsUpdateProfileImage}
              />
              <div className="app-content-pages">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Dashboard
                        url={url}
                        isStatistic={isStatistic}
                        setIsLoading={setIsLoading}
                        selectedMonth={selectedMonth}
                        setSelectedMonth={setSelectedMonth}
                      />
                    }
                  />
                  <Route
                    path="/operating"
                    element={
                      <Operating url={url} setIsLoading={setIsLoading} />
                    }
                  />
                  <Route
                    path="/list"
                    element={
                      <PaginationProvider>
                        <List url={url} setIsLoading={setIsLoading} />
                      </PaginationProvider>
                    }
                  />
                  <Route
                    path="/order"
                    element={
                      <OrderPaginationProvider>
                        <Order url={url} setIsLoading={setIsLoading} />
                      </OrderPaginationProvider>
                    }
                  />
                  <Route
                    path="/deliveryStaff"
                    element={
                      <StaffDelivery url={url} setIsLoading={setIsLoading} />
                    }
                  />
                  <Route
                    path="/account"
                    element={<Account url={url} setIsLoading={setIsLoading} />}
                  />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default App;
