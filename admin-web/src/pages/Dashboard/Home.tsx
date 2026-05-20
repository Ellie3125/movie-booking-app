import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import { useDashboardStats } from "../../hooks/useDashboardStats";

export default function Home() {
  const { data, loading, error } = useDashboardStats();

  const emptyChart = [] as import("../../services/dashboardService").RevenueChartPoint[];

  return (
    <>
      <PageMeta
        title="DashBoard"
        description="Movie Booking Admin Dashboard — realtime statistics from MongoDB"
      />

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-6 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-800 dark:bg-error-500/10 dark:text-error-400 flex items-center gap-2">
          <svg
            className="size-4 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v3a1 1 0 11-2 0V9zm1-5a1 1 0 110 2 1 1 0 010-2z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            <strong>Không thể tải dữ liệu Dashboard:</strong> {error}
          </span>
        </div>
      )}

      {/* ── Dashboard grid — giữ nguyên layout TailAdmin ──────────────────── */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics
            summary={data?.summary ?? null}
            loading={loading}
          />

          <MonthlySalesChart
            revenueChart={data?.revenueChart ?? emptyChart}
            loading={loading}
          />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget
            summary={data?.summary ?? null}
            loading={loading}
          />
        </div>

        <div className="col-span-12">
          <StatisticsChart
            revenueChart={data?.revenueChart ?? emptyChart}
            loading={loading}
          />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard
            topCinemas={data?.topCinemas ?? []}
            loading={loading}
          />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders
            topMovies={data?.topMovies ?? []}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
}
