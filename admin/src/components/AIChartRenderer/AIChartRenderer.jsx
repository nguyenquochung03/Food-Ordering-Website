import React from "react";
import Chart from "react-apexcharts";

export default function AIChartRenderer({ chartType, chartData, chartTitle }) {
  if (!chartData || !chartType) return null;

  const series = chartData.datasets.map((d) => ({ name: d.label || "Series", data: d.data }));
  const options = {
    chart: { id: "ai-chart", toolbar: { show: false } },
    xaxis: { categories: chartData.labels },
    title: { text: chartTitle || "", align: "center" },
  };

  if (chartType === "pie") {
    return <Chart options={{ labels: chartData.labels }} series={chartData.datasets?.[0]?.data || []} type="pie" width="100%" />;
  }

  const type = chartType === "line" ? "line" : "bar";

  return <Chart options={options} series={series} type={type} width="100%" height={260} />;
}
