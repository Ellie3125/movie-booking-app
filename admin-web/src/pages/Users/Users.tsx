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
import { userService } from "../../services/userService";
import toast from "react-hot-toast";
import { ConfirmationModal } from "../../components/ui/modal/ConfirmationModal";
import { buildImageUrl } from "../../utils/imageUrl";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Confirmation states
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: "warning" | "error" | "info" | "success";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "warning",
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers();
      setUsers(response.data?.items || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChangeRole = (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    setConfirmState({
      isOpen: true,
      title: "Cập nhật vai trò",
      message: `Bạn có chắc muốn đổi vai trò sang ${newRole}?`,
      variant: "warning",
      onConfirm: async () => {
        try {
          await userService.changeRole(id, newRole);
          toast.success("Cập nhật vai trò thành công");
          loadUsers();
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Lỗi khi cập nhật vai trò");
        }
      }
    });
  };

  const handleChangeStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    setConfirmState({
      isOpen: true,
      title: newStatus === "active" ? "Kích hoạt tài khoản" : "Khóa tài khoản",
      message: `Bạn có chắc muốn ${newStatus === "active" ? "kích hoạt" : "vô hiệu hóa"} người dùng này?`,
      variant: newStatus === "active" ? "success" : "error",
      onConfirm: async () => {
        try {
          await userService.changeStatus(id, newStatus);
          toast.success("Cập nhật trạng thái thành công");
          loadUsers();
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
        }
      }
    });
  };

  return (
    <>
      <PageMeta title="Quản lý Người dùng" description="Danh sách người dùng trong hệ thống" />
      <PageBreadCrumb pageTitle="Quản lý Người dùng" />
      
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Người dùng</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Vai trò</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Trạng thái</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Thao tác</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-gray-500">Đang tải...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-gray-500">Không có dữ liệu</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <div className="w-10 h-10 overflow-hidden rounded-full">
                            <img src={buildImageUrl(user.avatar)} alt={user.name} className="object-cover w-full h-full" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full dark:bg-gray-800">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {user.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge color={user.role === "admin" ? "success" : "warning"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge color={user.status === "active" ? "success" : "error"}>
                        {user.status === "active" ? "Hoạt động" : "Bị khóa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleChangeRole(user._id, user.role)}>
                          Đổi quyền
                        </Button>
                        <Button 
                          variant={user.status === "active" ? "outline" : "primary"} 
                          size="sm" 
                          onClick={() => handleChangeStatus(user._id, user.status)}
                          className={user.status === "active" ? "text-error-500 hover:bg-error-50" : ""}
                        >
                          {user.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"}
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
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
      />
    </>
  );
}
