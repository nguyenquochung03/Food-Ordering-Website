import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import './MonthlyOrderLineChart.css'

const MonthlyOrderLineChart = ({ setIsLoading, selectedMonth, url }) => {
    // Biến trạng thái để lưu tổng số đơn hàng
    const [totalSuccessful, setTotalSuccessful] = useState(0);
    const [totalDelivered, setTotalDelivered] = useState(0);

    const [successfulChartData, setSuccessfulChartData] = useState({
        series: [],
        options: {
            chart: {
                type: 'line',
                height: 100,
                toolbar: { show: false },
                zoom: { enabled: false }
            },
            colors: ['#FFA500'],
            grid: { show: false },
            xaxis: {
                labels: { show: false },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                labels: { show: false },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            fill: { opacity: 1 },
            stroke: { curve: 'smooth', width: 2 },
            background: { enabled: false }
        }
    });

    const [deliveredChartData, setDeliveredChartData] = useState({
        series: [],
        options: {
            chart: {
                type: 'line',
                height: 100,
                toolbar: { show: false },
                zoom: { enabled: false }
            },
            colors: ['#FF0000'],
            grid: { show: false },
            xaxis: {
                labels: { show: false },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                labels: { show: false },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            fill: { opacity: 1 },
            stroke: { curve: 'smooth', width: 2 },
            background: { enabled: false }
        }
    });

    useEffect(() => {
        fetchData();
    }, [selectedMonth]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            if (selectedMonth) {
                const [year] = selectedMonth.split('-');
                const response = await axios.get(`${url}/api/order/getMonthlyOrderTotals?year=${year}`);

                const data = response.data.data;

                const months = data.map(item => item.month);
                const successfulCounts = data.map(item => item.successfulCount);
                const deliveredCounts = data.map(item => item.deliveredCount);

                const totalSuccessfulOrders = successfulCounts.reduce((acc, count) => acc + count, 0);
                const totalDeliveredOrders = deliveredCounts.reduce((acc, count) => acc + count, 0);

                setTotalSuccessful(totalSuccessfulOrders);
                setTotalDelivered(totalDeliveredOrders);

                setSuccessfulChartData({
                    series: [
                        {
                            name: 'Successful',
                            data: successfulCounts
                        }
                    ],
                    options: {
                        ...successfulChartData.options,
                        xaxis: {
                            categories: months
                        }
                    }
                });

                setDeliveredChartData({
                    series: [
                        {
                            name: 'Delivered',
                            data: deliveredCounts
                        }
                    ],
                    options: {
                        ...deliveredChartData.options,
                        xaxis: {
                            categories: months
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='monthly-order-line-chart-container'>
            <div className="monthly-order-completed-line-chart-container">
                <p>Completed Orders</p>
                <p><span>{totalSuccessful} Task</span></p>
                <div className="monthly-order-completed-line-chart">
                    <Chart
                        options={successfulChartData.options}
                        series={successfulChartData.series}
                        type='line'
                        height={100}
                    />
                </div>
            </div>
            <div className="monthly-order-delivered-line-chart-container">
                <p>Delivered Orders</p>
                <p><span>{totalDelivered}</span></p>
                <div className="monthly-order-delivered-line-chart">
                    <Chart
                        options={deliveredChartData.options}
                        series={deliveredChartData.series}
                        type='line'
                        height={100}
                    />
                </div>
            </div>
        </div>
    );
};

export default MonthlyOrderLineChart;
