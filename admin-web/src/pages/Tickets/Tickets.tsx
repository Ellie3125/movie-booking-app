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
import { ticketService } from "../../services/ticketService";
import toast from "react-hot-toast";
import { ConfirmationModal } from "../../components/ui/modal/ConfirmationModal";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Label from "../../components/form/Label";

import { TicketDetailModal } from "./components/TicketDetailModal";

export default function Tickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [targetTicketId, setTargetTicketId] = useState<string | null>(null);

  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketService.getTickets();
      setTickets(response.data?.items || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi tải danh sách vé");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleMarkAsUsed = (id: string) => {
    setTargetTicketId(id);
    setIsConfirmOpen(true);
  };

  const executeMarkAsUsed = async () => {
    if (!targetTicketId) return;
    try {
      await ticketService.markTicketAsUsed(targetTicketId);
      toast.success("Cập nhật vé thành công");
      loadTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật vé");
    } finally {
      setIsConfirmOpen(false);
      setTargetTicketId(null);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      (ticket.ticketCode || ticket.ticketId || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (ticket.user?.fullName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (ticket.movie?.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageMeta title="Quản lý Vé" description="Danh sách vé xem phim trong hệ thống" />
      <PageBreadCrumb pageTitle="Quản lý Vé" />

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white p-5 rounded-2xl border border-gray-200 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 max-w-md">
            <Label>Tìm kiếm</Label>
            <Input
              placeholder="Tìm mã vé, tên người mua, tên phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Label>Trạng thái</Label>
            <Select
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "valid", label: "Chưa dùng" },
                { value: "used", label: "Đã dùng" },
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
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Mã vé</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Người mua</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Suất chiếu / Ghế</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Trạng thái</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Thao tác</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-gray-500">Đang tải...</TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-gray-500">Không có dữ liệu</TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket._id || ticket.ticketId}>
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      #{ticket.ticketCode || (ticket.ticketId ? ticket.ticketId.slice(-8).toUpperCase() : "N/A")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div>{ticket.user?.fullName || "N/A"}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div>{ticket.movie?.title}</div>
                      <div className="text-xs">Ghế: <span className="font-bold">{ticket.seat?.seatLabel}</span></div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge color={ticket.status === "valid" ? "success" : ticket.status === "used" ? "warning" : "error"}>
                        {ticket.status === "valid" ? "Chưa dùng" : ticket.status === "used" ? "Đã dùng" : ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        {ticket.status === "valid" && (
                          <Button variant="outline" size="sm" onClick={() => handleMarkAsUsed(ticket.ticketId)}>
                            Dùng vé
                          </Button>
                        )}
                        <Button
                          variant="primary-soft"
                          size="sm"
                          className="px-3 py-1.5 text-xs font-medium"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          Chi tiết
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
        onConfirm={executeMarkAsUsed}
        title="Xác nhận dùng vé"
        message="Bạn có chắc muốn đánh dấu vé này đã sử dụng?"
        confirmText="Xác nhận"
        variant="warning"
      />
      <TicketDetailModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
      />
    </>
  );
}
