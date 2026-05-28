import { useEffect, useState } from "react";
import { Table, Tag, Space, message, Typography, Avatar } from "antd";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { userService } from "../../services/userService";
import dayjs from "dayjs";
import { buildImageUrl } from "../../utils/imageUrl";
import type { User } from "../../types/profile";

const { Text } = Typography;

export default function Admins() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers();
      // Filter for roles supported by the backend enum
      const filtered = (response.data?.items || []).filter((user: User) =>
        user.role === "admin"
      );
      setAdmins(filtered);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tải danh sách quản trị viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const columns = [
    {
      title: "Quản trị viên",
      key: "user",
      render: (_: unknown, record: User) => (
        <Space>
          <Avatar src={buildImageUrl(record.avatarUrl)} size="large">
            {record.fullName?.charAt(0).toUpperCase()}
          </Avatar>
          <div className="flex flex-col">
            <Text strong>{record.fullName}</Text>
            <Text type="secondary">{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        let color = "blue";
        if (role === "admin") color = "gold";
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive === false ? "error" : "success"}>
          {isActive === false ? "Bị chặn" : "Hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày tham gia",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
  ];

  return (
    <>
      <PageMeta title="Quản lý Admin / Quản lý" description="Danh sách tài khoản quản trị" />
      <PageBreadCrumb pageTitle="Quản lý Admin / Quản lý" />

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <Table
          columns={columns}
          dataSource={admins}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "Không có quản trị viên nào" }}
        />
      </div>
    </>
  );
}
