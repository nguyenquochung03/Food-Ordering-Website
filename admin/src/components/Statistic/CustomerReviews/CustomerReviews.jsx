import React, { useEffect, useState } from 'react'
import './CustomerReviews.css'
import moment from 'moment'
import { images } from '../../../constants/data';
import axios from 'axios';

const CustomerReviews = ({ setIsLoading, url, selectedMonth }) => {

    const [currentTime, setCurrentTime] = useState('');
    const [positiveTotal, setPositiveTotal] = useState(0);
    const [positivePercentage, setPositivePercentage] = useState(0);
    const [negativeTotal, setNegativeTotal] = useState(0);
    const [negativePercentage, setNegativePercentage] = useState(0);
    const [weeklyHighRatingComment, setWeeklyHighRatingComment] = useState(Array(7).fill(0));
    const [weeklyLowRatingComment, setWeeklyLowRatingComment] = useState(Array(7).fill(0));

    const [hoverIndex, setHoverIndex] = useState(null);
    const [currentPositiveClickDay, setCurrentPositiveClickDay] = useState(0)
    const [currentNagativeClickDay, setCurrentNagativeClickDay] = useState(0)

    useEffect(() => {
        const formattedTime = moment().format('MMMM D, YYYY, hh:mmA');
        setCurrentTime(formattedTime);

        const dayOfWeek = moment().isoWeekday() - 1;
        setCurrentPositiveClickDay(dayOfWeek);
        setCurrentNagativeClickDay(dayOfWeek);
    }, []);

    useEffect(() => {
        if (selectedMonth) {
            fetchPositiveTotal();
            fetchNegativeTotal();
            fetchWeeklyHighRatingComment();
            fetchWeeklyLowRatingComment();
        }
    }, [selectedMonth]);

    const fetchPositiveTotal = async () => {
        try {
            setIsLoading(true);

            const [year, month] = selectedMonth.split('-');
            const response = await axios.get(`${url}/api/comment/getHighRatingCommentTotals`, {
                params: { month, year }
            });

            if (response.data.success) {
                const currentMonthHighRatingCount = response.data.data.currentMonthHighRatingCount;
                const previousMonthHighRatingCount = response.data.data.previousMonthHighRatingCount;

                setPositiveTotal(currentMonthHighRatingCount);
                setPositivePercentage(calculatePercentageChange(currentMonthHighRatingCount, previousMonthHighRatingCount));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const fetchNegativeTotal = async () => {
        try {
            setIsLoading(true);

            const [year, month] = selectedMonth.split('-');
            const response = await axios.get(`${url}/api/comment/getLowRatingCommentTotals`, {
                params: { month, year }
            });

            if (response.data.success) {
                const currentMonthLowRatingCount = response.data.data.currentMonthLowRatingCount;
                const previousMonthLowRatingCount = response.data.data.previousMonthLowRatingCount;

                setNegativeTotal(currentMonthLowRatingCount);
                setNegativePercentage(calculatePercentageChange(currentMonthLowRatingCount, previousMonthLowRatingCount));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const fetchWeeklyHighRatingComment = async () => {
        try {
            setIsLoading(true)
            if (selectedMonth) {
                const [year, month] = selectedMonth.split('-');
                const response = await axios.get(`${url}/api/comment/getWeeklyHighRatingCommentTotals`, {
                    params: { month, year }
                });

                if (response.data.success) {
                    setWeeklyHighRatingComment(response.data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching weekly comment:', error);
        } finally {
            setIsLoading(false)
        }
    };

    const fetchWeeklyLowRatingComment = async () => {
        try {
            setIsLoading(true)
            if (selectedMonth) {
                const [year, month] = selectedMonth.split('-');
                const response = await axios.get(`${url}/api/comment/getWeeklyLowRatingCommentTotals`, {
                    params: { month, year }
                });

                if (response.data.success) {
                    setWeeklyLowRatingComment(response.data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching weekly comment:', error);
        } finally {
            setIsLoading(false)
        }
    };

    const calculatePercentageChange = (current, previous) => {
        if (current > 0 && previous > 0) {
            return ((current - previous) / previous) * 100;
        } else if (current > 0 && previous <= 0) {
            return current * 100;
        } else if (current <= 0 && previous > 0) {
            return -previous * 100;
        }
        return 0;
    }

    return (
        <React.Fragment>
            <p className="customer-reviews-title">Customer Reviews</p>
            <div className='customer-reviews-container'>
                <div className="customer-reviews">
                    <div className="customer-reviews-total">
                        <p className='customer-reviews-total-title'>Positive Review</p>
                        <p className='customer-reviews-total-date'>{currentTime}</p>
                        <p className="customer-reviews-total-this-month">This Month</p>
                        <p className='customer-reviews-total-this-month-value'>{positiveTotal} <span>Reviews</span></p>
                        <div className="customer-reviews-total-percentage">
                            <img src={positivePercentage > 0 ? images.arrow_up : images.arrow_down} alt="" />
                            <p
                                style={{
                                    color: positivePercentage > 0 ? "#5ca832" : "#c73241"
                                }}
                            >
                                {positivePercentage > 0 && "+"}{positivePercentage.toFixed(0)}%
                            </p>
                        </div>
                    </div>
                    <div className="customer-reviews-statistic">
                        {weeklyHighRatingComment.map((count, index) => (
                            <div
                                key={index}
                                className="customer-reviews-statistic-container"
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => setHoverIndex(null)}
                            >
                                {
                                    currentPositiveClickDay === index &&
                                    <div className="customer-reviews-statistic-count-reviews">
                                        <p>{count.total}</p>
                                        <p><span>Reviews</span></p>
                                    </div>
                                }
                                <div
                                    className="customer-reviews-statistic-bar"
                                    onClick={() => setCurrentPositiveClickDay(index)}
                                    style={{
                                        height: `${(1 + count.total * 3 > 80) ? 80 : 1 + count.total * 3}px`,
                                        backgroundColor: hoverIndex === index
                                            ? (index % 2 === 0 ? "var(--color-button)" : "rgb(249, 142, 142)")
                                            : (index % 2 === 0 ? "var(--color-main)" : "rgb(223, 5, 5)")
                                    }}
                                    title={`Day ${index + 1}: ${count.total} comment`}
                                />
                                <p className='customer-reviews-statistic-day'>{count.day}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="customer-reviews">
                    <div className="customer-reviews-total">
                        <p className='customer-reviews-total-title'>Negative Review</p>
                        <p className='customer-reviews-total-date'>{currentTime}</p>
                        <p className="customer-reviews-total-this-month">This Month</p>
                        <p className='customer-reviews-total-this-month-value'>{negativeTotal} <span>Reviews</span></p>
                        <div className="customer-reviews-total-percentage">
                            <img src={negativePercentage > 0 ? images.arrow_up : images.arrow_down} alt="" />
                            <p
                                style={{
                                    color: negativePercentage > 0 ? "#5ca832" : "#c73241"
                                }}
                            >
                                {negativePercentage > 0 && "+"}{negativePercentage.toFixed(0)}%
                            </p>
                        </div>
                    </div>
                    <div className="customer-reviews-statistic">
                        {weeklyLowRatingComment.map((count, index) => (
                            <div
                                key={index}
                                className="customer-reviews-statistic-container"
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => setHoverIndex(null)}
                            >
                                {
                                    currentNagativeClickDay === index &&
                                    <div className="customer-reviews-statistic-count-reviews">
                                        <p>{count.total}</p>
                                        <p><span>Reviews</span></p>
                                    </div>
                                }
                                <div
                                    className="customer-reviews-statistic-bar"
                                    onClick={() => setCurrentNagativeClickDay(index)}
                                    style={{
                                        height: `${(1 + count.total * 3 > 80) ? 80 : 1 + count.total * 3}px`,
                                        backgroundColor: hoverIndex === index
                                            ? (index % 2 === 0 ? "var(--color-button)" : "rgb(249, 142, 142)")
                                            : (index % 2 === 0 ? "var(--color-main)" : "rgb(223, 5, 5)")
                                    }}
                                    title={`Day ${index + 1}: ${count.total} comment`}
                                />
                                <p className='customer-reviews-statistic-day'>{count.day}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default CustomerReviews;
