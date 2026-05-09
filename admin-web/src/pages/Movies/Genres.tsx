import { useEffect, useState } from "react";
import { Table, Tag, message, Typography } from "antd";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { movieService } from "../../services/movieService";

const { Text } = Typography;

export default function Genres() {
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadGenres = async () => {
    setLoading(true);
    try {
      const response = await movieService.getMovies();
      const movies = response.data?.items || [];
      
      // Aggregate genres from all movies
      const genreMap: Record<string, number> = {};
      movies.forEach((movie: any) => {
        if (Array.isArray(movie.genre)) {
          movie.genre.forEach((g: string) => {
            genreMap[g] = (genreMap[g] || 0) + 1;
          });
        }
      });

      const genreData = Object.entries(genreMap).map(([name, count]) => ({
        name,
        count,
        status: "active", // Default status for existing genres
      }));

      setGenres(genreData);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tải danh sách thể loại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGenres();
  }, []);

  const columns = [
    {
      title: "Tên thể loại",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Số lượng phim",
      dataIndex: "count",
      key: "count",
      render: (count: number) => <Tag color="blue">{count} phim</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color="success">
          {status === "active" ? "Đang sử dụng" : "Không sử dụng"}
        </Tag>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Quản lý Thể loại" description="Danh sách thể loại phim" />
      <PageBreadCrumb pageTitle="Quản lý Thể loại" />

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="mb-4">
          <Text type="secondary">Lưu ý: Trang này đang ở chế độ chỉ xem. Các thể loại được tổng hợp từ danh sách phim hiện có.</Text>
        </div>
        <Table
          columns={columns}
          dataSource={genres}
          rowKey="name"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "Chưa có thể loại nào được định nghĩa trong danh sách phim" }}
        />
      </div>
    </>
  );
}
