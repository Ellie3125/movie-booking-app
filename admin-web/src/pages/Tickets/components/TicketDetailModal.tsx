import { Modal } from "../../../components/ui/modal";
import Badge from "../../../components/ui/badge/Badge";

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
}

export function TicketDetailModal({ isOpen, onClose, ticket }: TicketDetailModalProps) {
  if (!ticket) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Vé Điện Tử</h2>
          <p className="text-sm text-gray-500 mt-1">Mã vé: <span className="font-bold text-gray-800 dark:text-white/90">#{ticket.ticketCode || ticket.ticketId?.slice(-8).toUpperCase()}</span></p>
        </div>

        <div className="flex justify-center my-2">
          {/* Mock QR Code area */}
          <div className="w-40 h-40 bg-white border border-gray-200 p-2 rounded-lg flex items-center justify-center">
             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.ticketCode || ticket.ticketId}`} alt="QR Code" />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-4">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white/90">{ticket.movie?.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {ticket.showtime?.startTime ? new Date(ticket.showtime.startTime).toLocaleString("vi-VN") : "N/A"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Rạp chiếu</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{ticket.cinema?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Phòng chiếu</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{ticket.room?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Ghế ngồi</p>
              <p className="font-medium text-brand-500 text-lg">{ticket.seat?.seatLabel || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Loại ghế</p>
              <p className="font-medium text-gray-800 dark:text-white/90 capitalize">{ticket.seat?.seatType || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-sm">
          <span className="text-gray-500 dark:text-gray-400">Khách hàng:</span>
          <span className="font-medium text-gray-800 dark:text-white/90">{ticket.user?.fullName || "N/A"}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-gray-400 text-sm">Trạng thái:</span>
          <Badge color={ticket.status === "valid" ? "success" : ticket.status === "used" ? "warning" : "error"}>
            {ticket.status === "valid" ? "Chưa sử dụng" : ticket.status === "used" ? "Đã sử dụng" : ticket.status}
          </Badge>
        </div>
      </div>
    </Modal>
  );
}
