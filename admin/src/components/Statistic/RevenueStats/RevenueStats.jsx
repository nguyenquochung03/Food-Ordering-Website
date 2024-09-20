import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RevenueStats.css';
import { images } from '../../../constants/data';

const RevenueStats = ({ setIsLoading, url, selectedMonth }) => {
    const [revenueData, setRevenueData] = useState({ currentRevenue: 0, previousRevenue: 0, percentageChange: 0 });

    useEffect(() => {
        fetchRevenueStats();
    }, [selectedMonth]);

    const fetchRevenueStats = async () => {
        try {
            setIsLoading(true)
            if (selectedMonth) {
                const [year, month] = selectedMonth.split('-');
                const response = await axios.get(`${url}/api/order/getRevenueStats`, {
                    params: { month, year }
                });
                setRevenueData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching revenue stats:', error);
        } finally {
            setIsLoading(false)
        }
    };

    const rotation = Math.abs(revenueData.percentageChange);

    const borderColor = revenueData.percentageChange > 0 ? 'var(--color-main)' : 'rgb(223, 5, 5)';

    return (
        <React.Fragment>
            <p className='revenue-stats-title'>Performance</p>
            <div className="revenue-stats-container">
                <div className="revenue-stats-left">
                    <div className="semi-donut" style={{ '--rotation': `${rotation <= 0 ? -40 : rotation < 101 ? rotation + 40 : 140}deg`, '--borderColor': borderColor }}
                        title={`This month:  $${revenueData.currentRevenue} \nLast month $${revenueData.previousRevenue}`}
                    >
                        <span>
                            <img src={revenueData.percentageChange > 0 ? images.up_arrow : images.arrow_down} alt="" />
                            <p>{revenueData.percentageChange > 0 && "+"} {revenueData.percentageChange}%</p>
                        </span>
                    </div>
                </div>
                <div className="revenue-stats-right">
                    <p>Lorem ipsum dolor sit. Eum, mollitia! Neque deserunt ipsam ea odio aspernatur eaque esse?</p>
                </div>
            </div>
        </React.Fragment>
    );
};

export default RevenueStats;
