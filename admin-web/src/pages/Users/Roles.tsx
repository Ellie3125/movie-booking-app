import { Table, Tag, Typography } from "antd";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const { Text } = Typography;

export default function Roles() {
  const rolesData = [
    {
      key: "admin",
      role: "admin",
      name: "Quản trị viên hệ thống",
      description: "Toàn quyền quản lý phim, rạp, lịch chiếu, người dùng và hệ thống.",
      permissions: ["TẤT CẢ QUYỀN"],
    },
    {
      key: "user",
      role: "user",
      name: "Người dùng (Khách hàng)",
      description: "Tài khoản khách hàng có thể xem thông tin phim và đặt vé.",
      permissions: ["Xem phim", "Đặt vé", "Quản lý hồ sơ cá nhân"],
    },
  ];

  const columns = [
    {
      title: "Mã vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag color="blue">{role.toUpperCase()}</Tag>,
    },
    {
      title: "Tên hiển thị",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Mô tả chi tiết",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Quyền hạn chính",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions: string[]) => (
        <div className="flex flex-wrap gap-1">
          {permissions.map((p) => (
            <Tag key={p} color={p === "TẤT CẢ QUYỀN" ? "gold" : "cyan"}>
              {p}
            </Tag>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Quản lý Vai trò" description="Danh sách vai trò và quyền hạn" />
      <PageBreadCrumb pageTitle="Quản lý Vai trò" />

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="mb-4">
          <Text type="secondary">Lưu ý: Hệ thống vai trò hiện đang được cấu hình cố định. Bạn không thể thêm hoặc sửa đổi vai trò trong phiên bản này.</Text>
        </div>
        <Table
          columns={columns}
          dataSource={rolesData}
          pagination={false}
        />
      </div>
    </>
  );
}
