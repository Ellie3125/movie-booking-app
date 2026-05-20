import { useEffect, useState } from "react";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { bookingService } from "../../services/bookingService";
import toast from "react-hot-toast";
import { ConfirmationModal } from "../../components/ui/modal/ConfirmationModal";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Label from "../../components/form/Label";

import { BookingDetailModal } from "./components/BookingDetailModal";

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [targetBookingId, setTargetBookingId] = useState<string | null>(null);

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getBookings();
      setBookings(response.data?.items || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi tải danh sách đặt vé");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = (id: string) => {
    setTargetBookingId(id);
    setIsConfirmOpen(true);
  };

  const executeCancel = async () => {
    if (!targetBookingId) return;
    try {
      await bookingService.cancelBooking(targetBookingId);
      toast.success("Hủy đơn đặt vé thành công");
      loadBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi hủy đơn");
    } finally {
      setIsConfirmOpen(false);
      setTargetBookingId(null);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      (booking.bookingCode || booking.bookingId || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking.user?.fullName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking.movie?.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageMeta title="Quản lý Đặt vé" description="Danh sách đơn đặt vé trong hệ thống" />
      <PageBreadCrumb pageTitle="Quản lý Đặt vé" />

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white p-5 rounded-2xl border border-gray-200 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 max-w-md">
            <Label>Tìm kiếm</Label>
            <Input
              placeholder="Tìm mã đơn, tên khách, tên phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Label>Trạng thái</Label>
            <Select
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "pending_payment", label: "Chờ thanh toán" },
                { value: "confirmed", label: "Đã xác nhận" },
                { value: "cancelled", label: "Đã hủy" },
              ]}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Mã đơn</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Khách hàng</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Phim / Suất chiếu</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tổng tiền</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Trạng thái</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Thao tác</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-gray-500">Đang tải...</TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-gray-500">Không có dữ liệu</TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking._id || booking.bookingId}>
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      #{booking.bookingCode || (booking.bookingId ? booking.bookingId.slice(-8).toUpperCase() : "N/A")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div>{booking.user?.fullName || "N/A"}</div>
                      <div className="text-xs">{booking.user?.email || "N/A"}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div>{booking.movie?.title || "N/A"}</div>
                      <div className="text-xs">
                        {booking.showtime?.startTime ? new Date(booking.showtime.startTime).toLocaleString("vi-VN") : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 font-bold">
                      {booking.totalAmount?.toLocaleString("vi-VN")}đ
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge color={booking.status === "confirmed" ? "success" : booking.status === "pending" ? "warning" : "error"}>
                        {booking.status === "confirmed" ? "Đã xác nhận" : booking.status === "pending_payment" || booking.status === "pending" ? "Chờ thanh toán" : booking.status === "cancelled" ? "Đã hủy" : booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status !== "cancelled" && booking.status !== "expired" && (
                          <Button
                            variant="error-soft"
                            size="sm"
                            onClick={() => handleCancel(booking.bookingId)}
                            className="px-3 py-1.5 text-xs font-medium"
                          >
                            Hủy
                          </Button>
                        )}
                        <Button
                          variant="primary-soft"
                          size="sm"
                          className="px-3 py-1.5 text-xs font-medium"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          Xem
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeCancel}
        title="Xác nhận hủy đơn"
        message="Bạn có chắc muốn hủy đơn đặt vé này?"
        confirmText="Hủy đơn"
        variant="error"
      />
      <BookingDetailModal 
        isOpen={!!selectedBooking} 
        onClose={() => setSelectedBooking(null)} 
        booking={selectedBooking} 
      />
    </>
  );
}
