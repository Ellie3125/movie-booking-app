import { useEffect, useState } from "react";
import { Table, Tag, message, Typography, Button, Modal, Form, Input, Space, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { cinemaBrandService } from "../../services/cinemaBrandService";

const { Text } = Typography;

export default function CinemaBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const loadBrands = async () => {
    setLoading(true);
    try {
      const response = await cinemaBrandService.getBrands();
      setBrands(response.data?.items || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tải danh sách thương hiệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingId(record._id);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await cinemaBrandService.deleteBrand(id);
      message.success("Xoá thương hiệu thành công");
      loadBrands();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi xoá thương hiệu");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await cinemaBrandService.updateBrand(editingId, values);
        message.success("Cập nhật thương hiệu thành công");
      } else {
        await cinemaBrandService.createBrand(values);
        message.success("Thêm thương hiệu thành công");
      }
      setIsModalOpen(false);
      loadBrands();
    } catch (error: any) {
      if (error.errorFields) return; // Form validation error
      message.error(error.response?.data?.message || "Lỗi khi lưu thương hiệu");
    }
  };

  const columns = [
    {
      title: "Thương hiệu",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Logo URL",
      dataIndex: "logo",
      key: "logo",
      render: (url: string) => url ? <img src={url} alt="Logo" className="h-8 object-contain" /> : <Text type="secondary">N/A</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "success" : "error"}>
          {status === "active" ? "Đang hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm
            title="Xác nhận xoá?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xoá"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Quản lý Thương hiệu Rạp" description="Danh sách các chuỗi rạp chiếu phim" />
      <PageBreadCrumb pageTitle="Quản lý Thương hiệu Rạp" />

      <div className="mb-4 flex justify-end">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm Thương hiệu
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <Table
          columns={columns}
          dataSource={brands}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title={editingId ? "Cập nhật Thương hiệu" : "Thêm Thương hiệu mới"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText={editingId ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" initialValues={{ status: "active" }}>
          <Form.Item
            name="name"
            label="Tên thương hiệu"
            rules={[{ required: true, message: "Vui lòng nhập tên thương hiệu" }]}
          >
            <Input placeholder="Ví dụ: Galaxy Cinema, CGV..." />
          </Form.Item>
          <Form.Item name="logo" label="Logo URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả về thương hiệu..." />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Input.Group compact>
              <Form.Item name="status" noStyle>
                 <select className="w-full h-10 border border-gray-300 rounded-md px-3 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Tạm dừng</option>
                 </select>
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
