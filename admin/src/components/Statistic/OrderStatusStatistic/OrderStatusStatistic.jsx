import React, { useState, useEffect } from 'react';
import './OrderStatusStatistic.css';
import { images } from '../../../constants/data';
import axios from 'axios';

const OrderStatusStatistic = ({ url }) => {
    const [orderStatus, setOrderStatus] = useState({});

    useEffect(() => {
        const fetchOrderStatus = async () => {
            try {
                const response = await axios.get(`${url}/api/order/getOrderCountByStatuses`);
                if (response.data.success) {
                    setOrderStatus(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching order status statistics:", error);
            }
        };

        fetchOrderStatus();
    }, [url]);

    return (
        <React.Fragment>
            <div className="order-status-statistic-container">
                <div className='order-status-statistic-double_check-img-container'>
                    <img src={images.double_check} alt="" />
                </div>
                <div className="order-status-statistic-parameter">
                    <p>Total Order Complete</p>
                    <p><span>{orderStatus["Successful"] || 0}</span></p>
                </div>
            </div>
            <div className="order-status-statistic-container">
                <div className="order-status-statistic-container-img">
                    <img src={images.check} alt="" />
                </div>
                <div className="order-status-statistic-parameter">
                    <p>Total Order Delivered</p>
                    <p><span>{orderStatus["Delivered"] || 0}</span></p>
                </div>
            </div>
            <div className="order-status-statistic-container">
                <div className="order-status-statistic-container-exclamation-img">
                    <img src={images.exclamation} alt="" />
                    <span className='order-status-statistic-container-exclamation-img-circle'></span>
                </div>
                <div className="order-status-statistic-parameter">
                    <p>Total Order Cancelled</p>
                    <p><span>{orderStatus["Cancelled"] || 0}</span></p>
                </div>
            </div>
            <div className="order-status-statistic-container">
                <div className="order-status-statistic-container-img">
                    <img src={images.question} alt="" />
                </div>
                <div className="order-status-statistic-parameter">
                    <p>Order Pending</p>
                    <p><span>{orderStatus["Food Processing"] + orderStatus["Out for delivery"] + orderStatus["Wait for Confirmation"] || 0}</span></p>
                </div>
            </div>
        </React.Fragment>
    );
};

export default OrderStatusStatistic;
