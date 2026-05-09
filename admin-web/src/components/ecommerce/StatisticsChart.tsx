import { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import { RevenueChartPoint } from "../../services/dashboardService";
import { formatCurrencyAbbreviation, formatNumberAbbreviation } from "../../utils/formatNumber";

interface StatisticsChartProps {
  revenueChart: RevenueChartPoint[];
  loading: boolean;
}

export default function StatisticsChart({ revenueChart, loading }: StatisticsChartProps) {
  const [period, setPeriod] = useState<"Monthly" | "Quarterly" | "Annually">("Monthly");

  let displayData = revenueChart;

  if (period === "Quarterly") {
    // Group 12 months into 4 quarters
    const quarters = [];
    for (let i = 0; i < displayData.length; i += 3) {
      const chunk = displayData.slice(i, i + 3);
      const revenue = chunk.reduce((sum, item) => sum + item.revenue, 0);
      const bookings = chunk.reduce((sum, item) => sum + item.bookings, 0);
      const label = `Q${Math.floor(i / 3) + 1} ${chunk[0].year}`;
      quarters.push({ month: label, revenue, bookings, year: chunk[0].year });
    }
    displayData = quarters;
  } else if (period === "Annually") {
    // Group all data into years
    const yearsMap: Record<number, { revenue: number; bookings: number }> = {};
    displayData.forEach((item) => {
      if (!yearsMap[item.year]) yearsMap[item.year] = { revenue: 0, bookings: 0 };
      yearsMap[item.year].revenue += item.revenue;
      yearsMap[item.year].bookings += item.bookings;
    });
    displayData = Object.entries(yearsMap).map(([year, data]) => ({
      month: year,
      revenue: data.revenue,
      bookings: data.bookings,
      year: parseInt(year),
    }));
  }

  const categories = displayData.map((p) => p.month);
  const revenueSeries = displayData.map((p) => p.revenue);
  const bookingsSeries = displayData.map((p) => p.bookings);

  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: { show: false },
    },
    stroke: {
      curve: "straight",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      x: { format: "dd MMM yyyy" },
      y: [
        {
          formatter: (val: number) => formatCurrencyAbbreviation(val),
        },
        {
          formatter: (val: number) => `${formatNumberAbbreviation(val)} đơn đặt`,
        },
      ],
    },
    xaxis: {
      type: "category",
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
        formatter: (val: number) => formatNumberAbbreviation(val),
      },
      title: { text: "", style: { fontSize: "0px" } },
    },
  };

  const series = [
    { name: "Doanh thu", data: revenueSeries },
    { name: "Đơn đặt", data: bookingsSeries },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Thống kê
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            {period === "Monthly" && "Doanh thu & Đơn đặt — 12 tháng qua"}
            {period === "Quarterly" && "Doanh thu & Đơn đặt — 4 quý qua"}
            {period === "Annually" && "Doanh thu & Đơn đặt — Theo năm"}
          </p>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          <ChartTab selected={period} onChange={setPeriod} />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          {loading ? (
            <div className="flex items-center justify-center h-[310px]">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Chart options={options} series={series} type="area" height={310} />
          )}
        </div>
      </div>
    </div>
  );
}
