import React, { useEffect, useState } from "react";
import axios from "axios";

import "./Dashboard.css";
import { images } from "../../constants/data";
import VisitStatistics from "../../components/Statistic/VisitStatistics/VisitStatistics";
import RevenueStats from "../../components/Statistic/RevenueStats/RevenueStats";
import OrderStatusStatistic from "../../components/Statistic/OrderStatusStatistic/OrderStatusStatistic";
import OrderRate from "../../components/Statistic/OrderRate/OrderRate";
import CategoryStatistic from "../../components/Statistic/CategoryStatistic/CategoryStatistic";
import MonthlyOrderChart from "../../components/Statistic/MonthlyOrderChart/MonthlyOrderChart";
import MonthlyOrderLineChart from "../../components/Statistic/MonthlyOrderLineChart/MonthlyOrderLineChart";
import CustomerReviews from "../../components/Statistic/CustomerReviews/CustomerReviews";
import RecentReviews from "../../components/Statistic/RecentReviews/RecentReviews";

const Dashboard = ({
  url,
  setIsLoading,
  selectedMonth,
  setSelectedMonth,
  isStatistic,
}) => {
  // Bar Chart
  // Line Chart
  // Area Chart
  // Radar Chart
  // Histogram Chart
  // Scatter Chart
  // Heatmap Chart

  const [incomeData, setIncomeData] = useState({
    totalIncome: 0,
    currentMonthIncome: 0,
    previousMonthIncome: 0,
    percentageDifference: 0,
  });

  useEffect(() => {
    if (isStatistic) {
      const currentDate = new Date();
      const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
      const currentYear = currentDate.getFullYear();
      setSelectedMonth(`${currentYear}-${currentMonth}`);
    }
  }, [isStatistic]);

  useEffect(() => {
    fetchIncomeData();
  }, [selectedMonth]);

  const fetchIncomeData = async () => {
    try {
      setIsLoading(true);
      if (selectedMonth) {
        const [year, month] = selectedMonth.split("-");
        const response = await axios.get(`${url}/api/order/calculateIncome`, {
          params: { month, year },
        });
        if (response.data.success) {
          setIncomeData({
            totalIncome: response.data.totalIncome,
            currentMonthIncome: response.data.currentMonthIncome,
            previousMonthIncome: response.data.previousMonthIncome,
            percentageDifference: response.data.percentageDifference,
          });
        } else {
          console.log("Failed to fetch income data");
        }
      }
    } catch (err) {
      console.log("Error fetching data: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(number);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="dashboard-header-left-top">
            <div className="dashboard-header-left-top-total-income">
              <span>Total Income</span>
              <p>{formatCurrency(incomeData.totalIncome)}</p>
            </div>
            <div className="dashboard-header-left-top-income">
              <div className="dashboard-header-left-top-this-month">
                <span>This month</span>
                <p>{formatCurrency(incomeData.currentMonthIncome)}</p>
                <div className="dashboard-header-left-top-img-container">
                  <img
                    src={
                      incomeData.percentageDifference > 0
                        ? images.arrow_up
                        : images.arrow_down
                    }
                    alt=""
                  />
                  <p
                    className="dashboard-header-arrow-up"
                    style={{
                      color:
                        incomeData.percentageDifference > 0
                          ? "#5ca832"
                          : "#c73241",
                    }}
                  >
                    {incomeData.percentageDifference > 0 && "+"}
                    {incomeData.percentageDifference}%
                  </p>
                </div>
              </div>
              <div className="dashboard-header-left-top-last-month">
                <span>Last month</span>
                <p>{formatCurrency(incomeData.previousMonthIncome)}</p>
                <div className="dashboard-header-left-top-img-container">
                  <img
                    src={
                      -1 * incomeData.percentageDifference > 0
                        ? images.arrow_up
                        : images.arrow_down
                    }
                    alt=""
                  />
                  <p
                    className="dashboard-header-arrow-down"
                    style={{
                      color:
                        -1 * incomeData.percentageDifference > 0
                          ? "#5ca832"
                          : "#c73241",
                    }}
                  >
                    {-1 * incomeData.percentageDifference}%
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-header-left-bottom">
            <div className="dashboard-header-left-bottom-left">
              <VisitStatistics
                setIsLoading={setIsLoading}
                url={url}
                selectedMonth={selectedMonth}
              />
            </div>
            <div className="dashboard-header-left-bottom-right">
              <RevenueStats
                setIsLoading={setIsLoading}
                url={url}
                selectedMonth={selectedMonth}
              />
            </div>
          </div>
        </div>
        <div className="dashboard-header-right">
          <OrderStatusStatistic url={url} selectedMonth={selectedMonth} />
        </div>
      </div>
      <div className="dashboard-order-rate-category-stistic">
        <div className="dashboard-order-rate-category-stistic-left">
          <OrderRate
            setIsLoading={setIsLoading}
            url={url}
            selectedMonth={selectedMonth}
          />
        </div>
        <div className="dashboard-order-rate-category-stistic-right">
          <p>Categories</p>
          <CategoryStatistic setIsLoading={setIsLoading} url={url} />
        </div>
      </div>
      <div className="dashboard-order-completed-delivered">
        <MonthlyOrderChart
          setIsLoading={setIsLoading}
          url={url}
          selectedMonth={selectedMonth}
        />
        <MonthlyOrderLineChart
          setIsLoading={setIsLoading}
          url={url}
          selectedMonth={selectedMonth}
        />
      </div>
      <CustomerReviews
        setIsLoading={setIsLoading}
        url={url}
        selectedMonth={selectedMonth}
      />
      <RecentReviews
        setIsLoading={setIsLoading}
        url={url}
        selectedMonth={selectedMonth}
      />
    </div>
  );
};

export default Dashboard;
