import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './VisitStatistics.css';

const VisitStatistics = ({ setIsLoading, url, selectedMonth }) => {
    const [visitStats, setVisitStats] = useState(Array(24).fill(0));

    useEffect(() => {
        fetchVisitStatistics();
    }, [selectedMonth])

    const fetchVisitStatistics = async () => {
        try {
            setIsLoading(true)
            if (selectedMonth) {
                const [year, month] = selectedMonth.split('-');
                const response = await axios.get(`${url}/api/visit/visitStatistics`, {
                    params: { month, year }
                });

                if (response.data.success) {
                    setVisitStats(response.data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching visit statistics:', error);
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <React.Fragment>
            <div className="visit-statistics-container">
                {visitStats.map((count, index) => (
                    <div
                        key={index}
                        className="visit-statistics-bar"
                        style={{ height: `${(1 + count * 2 > 80) ? 80 : 1 + count * 2}px` }}
                        title={`Hour ${index}: ${count} visits`}
                    />
                ))}
            </div>
            <div className="visit-statistics-footer">
                <p>00:00</p>
                <p>23:59</p>
            </div>
        </React.Fragment>
    );
};

export default VisitStatistics;
