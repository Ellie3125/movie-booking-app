import { useEffect, useState } from "react";
import { Table, Modal, Form, Input, Button, Tag, message, Typography, Image } from "antd";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { movieService } from "../../services/movieService";
import dayjs from "dayjs";

const { Text } = Typography;

export default function Trailers() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<any>(null);
  const [form] = Form.useForm();

  const loadMovies = async () => {
    setLoading(true);
    try {
      const response = await movieService.getMovies();
      setMovies(response.data?.items || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tải danh sách phim");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const handleEdit = (movie: any) => {
    setEditingMovie(movie);
    form.setFieldsValue({
      trailer: movie.trailer,
      trailerThumbnail: movie.trailerThumbnail,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      // Merge values with existing movie data because updateMovie might expect full payload
      const updatedData = { ...editingMovie, ...values };
      await movieService.updateMovie(editingMovie._id, updatedData);
      message.success("Cập nhật trailer thành công");
      setIsModalOpen(false);
      loadMovies();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi cập nhật trailer");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Poster",
      dataIndex: "poster",
      key: "poster",
      render: (poster: string) => (
        <Image
          src={poster}
          alt="Poster"
          width={50}
          height={75}
          className="rounded object-cover"
          fallback="/images/placeholder-movie.png"
        />
      ),
    },
    {
      title: "Tên phim",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "blue";
        let text = status;
        if (status === "now_showing") { color = "green"; text = "Đang chiếu"; }
        else if (status === "coming_soon") { color = "orange"; text = "Sắp chiếu"; }
        else if (status === "ended") { color = "gray"; text = "Đã kết thúc"; }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Trailer URL",
      dataIndex: "trailer",
      key: "trailer",
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 truncate max-w-[200px] block">
          {url || "Chưa có"}
        </a>
      ),
    },
    {
      title: "Cập nhật lúc",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => handleEdit(record)}>
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Quản lý Trailers" description="Danh sách trailer phim" />
      <PageBreadCrumb pageTitle="Quản lý Trailers" />

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <Table
          columns={columns}
          dataSource={movies}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title={`Chỉnh sửa Trailer: ${editingMovie?.title}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            trailer: editingMovie?.trailer,
            trailerThumbnail: editingMovie?.trailerThumbnail,
          }}
        >
          <Form.Item
            name="trailer"
            label="Trailer URL (YouTube link)"
            rules={[{ required: true, message: "Vui lòng nhập URL trailer" }]}
          >
            <Input placeholder="https://www.youtube.com/watch?v=..." />
          </Form.Item>

          <Form.Item
            name="trailerThumbnail"
            label="Trailer Thumbnail URL"
          >
            <Input placeholder="https://..." />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
