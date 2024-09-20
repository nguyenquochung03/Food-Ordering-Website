import React, { useState, useEffect } from 'react';
import ApexCharts from 'react-apexcharts';
import axios from 'axios';
import './MonthlyOrderChart.css'

const MonthlyOrderChart = ({ setIsLoading, url, selectedMonth }) => {
    const [chartData, setChartData] = useState({ series: [], categories: [] });

    useEffect(() => {
        if (selectedMonth) {
            fetchData();
        }
    }, [selectedMonth]);

    async function fetchData() {
        setIsLoading(true);
        try {
            const [year] = selectedMonth.split('-');
            const response = await axios.get(`${url}/api/order/getMonthlyOrderTotals?year=${year}`);
            if (response.data.success) {
                const data = response.data.data;

                const categories = data.map(item => item.month);
                const successfulCounts = data.map(item => item.successfulCount);
                const deliveredCounts = data.map(item => item.deliveredCount);

                setChartData({
                    series: [
                        {
                            name: 'Successful',
                            data: successfulCounts
                        },
                        {
                            name: 'Delivered',
                            data: deliveredCounts
                        }
                    ],
                    categories: categories
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const options = {
        chart: {
            type: 'bar',
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '50%',
                endingShape: 'rounded'
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 1,
            colors: ['transparent']
        },
        colors: ['#ffa500', '#ff0000'],
        legend: {
            show: false
        },
        xaxis: {
            categories: chartData.categories,
            labels: {
                show: true,
                offsetY: 5,
                style: {
                    colors: 'rgb(156, 155, 155)',
                    cssClass: 'apexcharts-bar-xaxis-label'
                }
            }
        },
        yaxis: {
            labels: {
                show: true,
                offsetX: -10,
                style: {
                    colors: 'rgb(156, 155, 155)',
                    cssClass: 'apexcharts-bar-yaxis-label'
                }
            }
        },
        grid: {
            show: true,
            borderColor: '#e0e0e0'
        },
        tooltip: {
            theme: 'light'
        }
    };

    return (
        <div className='monthly-order-chart'>
            <p>Activity</p>
            <ApexCharts
                options={options}
                series={chartData.series}
                type="bar"
                height={350}
            />
        </div>
    );
};

export default MonthlyOrderChart;
