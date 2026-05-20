import { Modal } from "../../../components/ui/modal";
import Badge from "../../../components/ui/badge/Badge";

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

export function BookingDetailModal({ isOpen, onClose, booking }: BookingDetailModalProps) {
  if (!booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Chi tiết đơn đặt vé</h2>
          <p className="text-sm text-gray-500 mt-1">Mã đơn: #{booking.bookingCode || booking._id?.slice(-8).toUpperCase()}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-2">Thông tin khách hàng</h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-sm">
                <p className="text-gray-800 dark:text-white/90"><span className="text-gray-500 dark:text-gray-400">Họ tên:</span> {booking.user?.fullName || "N/A"}</p>
                <p className="text-gray-800 dark:text-white/90"><span className="text-gray-500 dark:text-gray-400">Email:</span> {booking.user?.email || "N/A"}</p>
                <p className="text-gray-800 dark:text-white/90"><span className="text-gray-500 dark:text-gray-400">SĐT:</span> {booking.user?.phone || "N/A"}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-2">Thông tin thanh toán</h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-sm space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Trạng thái:</span>
                  <Badge color={booking.paymentStatus === "success" ? "success" : booking.paymentStatus === "pending" ? "warning" : "error"}>
                    {booking.paymentStatus === "success" ? "Đã thanh toán" : booking.paymentStatus === "pending" ? "Chờ thanh toán" : "Thất bại"}
                  </Badge>
                </div>
                <p className="text-gray-800 dark:text-white/90"><span className="text-gray-500 dark:text-gray-400">Phương thức:</span> {booking.paymentMethod || "N/A"}</p>
                <p className="text-gray-800 dark:text-white/90"><span className="text-gray-500 dark:text-gray-400">Tổng tiền:</span> <span className="font-bold text-brand-500">{booking.totalAmount?.toLocaleString("vi-VN")}đ</span></p>
                {booking.paidAt && <p className="text-gray-800 dark:text-white/90"><span className="text-gray-500 dark:text-gray-400">Ngày TT:</span> {new Date(booking.paidAt).toLocaleString("vi-VN")}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-2">Thông tin suất chiếu</h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-sm space-y-1">
                <p className="font-medium text-gray-800 dark:text-white/90">{booking.movie?.title}</p>
                <p className="text-gray-800 dark:text-white/90"><span className="text-gray-500 dark:text-gray-400">Rạp:</span> {booking.cinema?.name} ({booking.room?.name})</p>
                <p className="text-gray-800 dark:text-white/90"><span className="text-gray-500 dark:text-gray-400">Thời gian:</span> {booking.showtime?.startTime ? new Date(booking.showtime.startTime).toLocaleString("vi-VN") : "N/A"}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-2">Danh sách ghế ({booking.ticketCount})</h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-sm">
                <div className="flex flex-wrap gap-2">
                  {booking.seats?.map((seat: any, i: number) => (
                    <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium shadow-sm dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white/90">
                      {seat.seatLabel} - {seat.price?.toLocaleString("vi-VN")}đ
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
