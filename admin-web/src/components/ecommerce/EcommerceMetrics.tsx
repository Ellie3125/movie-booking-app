import { BoxIconLine, GroupIcon } from "../../icons";
import { DashboardSummary } from "../../services/dashboardService";

// ── Icons cho 2 card mới ─────────────────────────────────────────────────────
function FilmIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 5V19M17 5V19M2 9H7M17 9H22M2 15H7M17 15H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CurrencyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 6V18M9 9.5C9 8.12 10.34 7 12 7C13.66 7 15 8.12 15 9.5C15 10.88 13.66 12 12 12C10.34 12 9 13.12 9 14.5C9 15.88 10.34 17 12 17C13.66 17 15 15.88 15 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

import { formatCurrencyAbbreviation, formatNumberAbbreviation } from "../../utils/formatNumber";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatRevenue(value: number): string {
  return formatCurrencyAbbreviation(value);
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse"
        >
          <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700" />
          <div className="mt-5 space-y-2">
            <div className="h-3 w-24 bg-gray-200 rounded dark:bg-gray-700" />
            <div className="h-7 w-20 bg-gray-200 rounded dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface EcommerceMetricsProps {
  summary: DashboardSummary | null;
  loading: boolean;
}

export default function EcommerceMetrics({ summary, loading }: EcommerceMetricsProps) {
  if (loading) return <LoadingSkeleton />;

  const cards = [
    {
      label: "Khách hàng",
      value: summary?.totalUsers ?? 0,
      icon: <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />,
      badge: null,
    },
    {
      label: "Đơn đặt vé",
      value: summary?.totalBookings ?? 0,
      icon: <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />,
      badge: null,
    },
    {
      label: "Phim",
      value: summary?.totalMovies ?? 0,
      icon: <FilmIcon className="text-gray-800 size-6 dark:text-white/90" />,
      badge: null,
    },
    {
      label: "Doanh thu",
      value: formatRevenue(summary?.totalRevenue ?? 0),
      icon: <CurrencyIcon className="text-gray-800 size-6 dark:text-white/90" />,
      badge: null,
      isString: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            {card.icon}
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {card.label}
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {card.isString ? card.value : formatNumberAbbreviation(card.value as number)}
              </h4>
            </div>
            {card.badge}
          </div>
        </div>
      ))}
    </div>
  );
}
