import React, { useState, useEffect } from 'react';
import ApexCharts from 'react-apexcharts';
import axios from 'axios';
import './OrderRate.css';
import { images } from '../../../constants/data';

const OrderRate = ({ setIsLoading, url, selectedMonth }) => {

    const [orderStistic, setOrderStatistic] = useState({
        totalOrders: 0,
        ordersThisYear: 0,
        ordersLastYear: 0
    })
    const [chartData, setChartData] = useState({
        options: {
            chart: {
                id: 'monthly-orders',
                type: 'bar',
                toolbar: {
                    show: false
                }
            },
            xaxis: {
                categories: [],
                labels: {
                    show: true,
                    offsetY: 5,
                    style: {
                        colors: 'rgb(156, 155, 155)',
                        cssClass: 'apexcharts-area-xaxis-label'
                    }
                }
            },
            yaxis: {
                labels: {
                    show: true,
                    offsetX: -10,
                    style: {
                        colors: 'rgb(156, 155, 155)',
                        cssClass: 'apexcharts-area-yaxis-label'
                    }
                }
            },
            grid: {
                show: true,
                xaxis: {
                    lines: {
                        show: true
                    }
                },
                yaxis: {
                    lines: {
                        show: false
                    }
                }
            },
            fill: {
                type: 'solid',
                colors: ['#f7e1b7', '#f7b7b7']
            },
            colors: ['orange', 'red'],
            stroke: {
                curve: 'smooth'
            },
            legend: {
                show: false
            },
            dataLabels: {
                enabled: false
            },
        },
        series: [
            {
                data: []
            },
            {
                data: []
            }
        ]
    });

    useEffect(() => {
        fetchData();
        fetchTotalOrders();
        fetchTotalOrdersByYear();
    }, [selectedMonth]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            if (selectedMonth) {
                const [year] = selectedMonth.split('-');
                const response = await axios.get(`${url}/api/order/getTotalOrdersByMonth?year=${year}`);
                if (response.data.success) {
                    const [currentYearData, previousYearData] = response.data.data;
                    const months = currentYearData.map(item => item.month);
                    const currentYearOrders = currentYearData.map(item => item.totalOrders);
                    const previousYearOrders = previousYearData.map(item => item.totalOrders);

                    setChartData(prevState => ({
                        ...prevState,
                        options: {
                            ...prevState.options,
                            xaxis: {
                                categories: months
                            }
                        },
                        series: [
                            {
                                name: 'Total Orders (Current Year)',
                                data: currentYearOrders
                            },
                            {
                                name: 'Total Orders (Previous Year)',
                                data: previousYearOrders
                            }
                        ]
                    }));
                }
            }
        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTotalOrders = async () => {
        try {
            setIsLoading(true)
            const response = await axios.get(`${url}/api/order/getTotalOrders`)
            if (response.data.success) {
                setOrderStatistic(prev => ({
                    ...prev,
                    totalOrders: response.data.data
                }));
            }
        } catch (error) {
            console.log("Error fetching data: ", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchTotalOrdersByYear = async () => {
        try {
            setIsLoading(true)
            if (selectedMonth) {
                const [year] = selectedMonth.split('-');
                const response = await axios.get(`${url}/api/order/getTotalOrdersByYear?year=${year}`)
                if (response.data.success) {
                    setOrderStatistic(prev => ({
                        ...prev,
                        ordersThisYear: response.data.ordersThisYear,
                        ordersLastYear: response.data.ordersLastYear
                    }));
                }
            }
        } catch (error) {
            console.log("Error fetching data: ", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <React.Fragment>
            <p className="order-rate-title">Order Rate</p>
            <div className="order-rate-header">
                <div className="order-rate-header-left">
                    <img src={images.order_rate_person} alt="" />
                    <div className="order-rate-header-left-order-total">
                        <p>Order Total</p>
                        <p><span>{orderStistic.totalOrders}</span></p>
                    </div>
                </div>
                <div className="order-rate-header-right">
                    <div className="order-rate-header-right-year">
                        <div className="order-rate-header-right-year-title">
                            <span className="order-rate-header-right-this-year-title-circle"></span>
                            <p>This Year</p>
                        </div>
                        <p>{orderStistic.ordersThisYear}</p>
                    </div>
                    <div className="order-rate-header-right-year">
                        <div className="order-rate-header-right-year-title">
                            <span className="order-rate-header-right-last-year-title-circle"></span>
                            <p>Last Year</p>
                        </div>
                        <p>{orderStistic.ordersLastYear}</p>
                    </div>
                </div>
            </div>
            <ApexCharts
                options={chartData.options}
                series={chartData.series}
                type="area"
                height={300}
            />
        </React.Fragment>
    );
};

export default OrderRate;
