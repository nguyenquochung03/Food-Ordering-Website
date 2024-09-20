import React, { useEffect, useState } from 'react';
import './CategoryStatistic.css';
import ApexCharts from 'react-apexcharts';
import axios from 'axios';

const CategoryStatistic = ({ setIsLoading, url }) => {

    const [chartData, setChartData] = useState({
        options: {
            chart: {
                id: 'category',
                type: 'donut',
                toolbar: {
                    show: false
                }
            },
            stroke: {
                width: 0
            },
            legend: {
                position: 'bottom',
                fontSize: "14px",
                fontWeight: 500,
                fontFamily: 'Verdana, sans-serif',
                colors: 'black',
                markers: {
                    width: 15,
                    height: 15,
                    radius: 0
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 5
                },
                itemPadding: {
                    horizontal: 10,
                    vertical: 5
                },
                showForSingleSeries: false,
                floating: false
            },
            dataLabels: {
                enabled: false
            },
            labels: [],
            colors: []
        },
        series: []
    });

    useEffect(() => {
        fetchCategoryCounts();
    }, []);

    const fetchCategoryCounts = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${url}/api/food/getCategoryCounts`);
            const data = response.data.data;

            const categories = data.map(item => item.category);
            const counts = data.map(item => item.count);

            const colors = generateUniqueColors(categories.length);

            setChartData(prevData => ({
                ...prevData,
                options: {
                    ...prevData.options,
                    labels: categories,
                    colors: colors
                },
                series: counts
            }));
        } catch (error) {
            console.error('Error fetching category counts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateUniqueColors = (numColors) => {
        const colors = [];
        for (let i = 0; i < numColors; i++) {
            const hue = (i * (360 / numColors)) % 360;
            const color = `hsl(${hue}, 90%, 50%)`;
            colors.push(color);
        }
        return colors;
    };

    return (
        <div className="category-statistic">
            <ApexCharts
                options={chartData.options}
                series={chartData.series}
                type="donut"
                height={350}
            />
        </div>
    );
};

export default CategoryStatistic;
