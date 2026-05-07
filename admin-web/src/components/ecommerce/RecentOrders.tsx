import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { TopMovie } from "../../services/dashboardService";

function formatVND(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} Tỷ ₫`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} Tr ₫`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K ₫`;
  return `${value} ₫`;
}

interface RecentOrdersProps {
  topMovies: TopMovie[];
  loading: boolean;
}

function LoadingRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i}>
          <TableCell className="py-3">
            <div className="flex items-center gap-3 animate-pulse">
              <div className="h-[50px] w-[50px] bg-gray-200 rounded-md dark:bg-gray-700 flex-shrink-0" />
              <div className="h-4 w-32 bg-gray-200 rounded dark:bg-gray-700" />
            </div>
          </TableCell>
          <TableCell className="py-3">
            <div className="h-4 w-16 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
          </TableCell>
          <TableCell className="py-3">
            <div className="h-4 w-20 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
          </TableCell>
          <TableCell className="py-3">
            <div className="h-5 w-14 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function RecentOrders({ topMovies, loading }: RecentOrdersProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Phim Bán Chạy
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <svg
              className="stroke-current fill-white dark:fill-gray-800"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2.29004 5.90393H17.7067" stroke="" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17.7075 14.0961H2.29085" stroke="" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z" fill="" stroke="" strokeWidth="1.5" />
              <path d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z" fill="" stroke="" strokeWidth="1.5" />
            </svg>
            Lọc
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Xem tất cả
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Phim
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Đơn đặt
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Doanh thu
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Trạng thái
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <LoadingRows />
            ) : topMovies.length === 0 ? (
              <TableRow>
                <TableCell className="py-8 text-center text-gray-400 dark:text-gray-500" colSpan={4}>
                  Chưa có dữ liệu phim.
                </TableCell>
              </TableRow>
            ) : (
              topMovies.map((movie, idx) => (
                <TableRow key={movie.movieId} className="">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[50px] w-[50px] overflow-hidden rounded-md flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                        {movie.poster ? (
                          <img
                            src={movie.poster}
                            className="h-[50px] w-[50px] object-cover"
                            alt={movie.title}
                          />
                        ) : (
                          <div className="h-[50px] w-[50px] flex items-center justify-center text-gray-400 text-xs">
                            🎬
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {movie.title}
                        </p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          #{idx + 1} Top Movie
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {movie.totalBookings.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatVND(movie.revenue)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge size="sm" color="success">
                      Đang chiếu
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
