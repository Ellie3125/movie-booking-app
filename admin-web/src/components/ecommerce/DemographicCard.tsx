import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { TopCinema } from "../../services/dashboardService";
import { formatNumberAbbreviation } from "../../utils/formatNumber";

interface DemographicCardProps {
  topCinemas: TopCinema[];
  loading: boolean;
}


export default function DemographicCard({ topCinemas, loading }: DemographicCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Compute max bookings for relative progress bar
  const maxBookings = Math.max(...topCinemas.map((c) => c.totalBookings), 1);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Top Rạp Chiếu
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Top rạp theo số lượng đặt vé
          </p>
        </div>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
              <DropdownItem
                onItemClick={() => setIsOpen(false)}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Xem thêm
              </DropdownItem>
              <DropdownItem
                onItemClick={() => setIsOpen(false)}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Xóa
              </DropdownItem>
            </Dropdown>
        </div>
      </div>


      {/* Top Cinemas list — replaces the old country stats */}
      <div className="space-y-5">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full dark:bg-gray-700" />
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-gray-200 rounded dark:bg-gray-700" />
                  <div className="h-3 w-16 bg-gray-200 rounded dark:bg-gray-700" />
                </div>
              </div>
              <div className="flex w-full max-w-[140px] items-center gap-3">
                <div className="h-2 w-full max-w-[100px] bg-gray-200 rounded dark:bg-gray-700" />
                <div className="h-4 w-8 bg-gray-200 rounded dark:bg-gray-700" />
              </div>
            </div>
          ))
        ) : topCinemas.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-4">
            Chưa có dữ liệu rạp.
          </p>
        ) : (
          topCinemas.map((cinema) => {
            const pct = Math.round((cinema.totalBookings / maxBookings) * 100);
            return (
              <div key={cinema.cinemaId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Cinema avatar — initials */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300 text-xs font-bold flex-shrink-0">
                    {cinema.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                      {cinema.name}
                    </p>
                    <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                      {cinema.city} · {formatNumberAbbreviation(cinema.totalBookings)} bookings
                    </span>
                  </div>
                </div>

                <div className="flex w-full max-w-[140px] items-center gap-3">
                  <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                    <div
                      className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {pct}%
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
