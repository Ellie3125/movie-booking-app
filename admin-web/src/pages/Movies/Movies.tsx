import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { movieService } from "../../services/movieService";
import { metaService } from "../../services/metaService";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Label from "../../components/form/Label";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/modal";
import { ConfirmationModal } from "../../components/ui/modal/ConfirmationModal";
import { MovieDetailModal } from "../../components/ui/modal/MovieDetailModal";

type MovieFormData = {
  title: string;
  duration: number;
  status: string;
  releaseDate: string;
  endDate: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  genres: string[];
};

const defaultFormValues: MovieFormData = {
  title: "",
  duration: 120,
  status: "now_showing",
  releaseDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split("T")[0],
  posterUrl: "",
  backdropUrl: "",
  trailerUrl: "",
  genres: [],
};

export default function Movies() {
  const [movies, setMovies] = useState<any[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<MovieFormData>({
    defaultValues: defaultFormValues,
  });

  const watchedGenres = watch("genres");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [viewingMovie, setViewingMovie] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [moviesRes, metaRes] = await Promise.all([
        movieService.getMovies(),
        metaService.getMovieOptions()
      ]);
      setMovies(moviesRes.data?.items || []);
      setGenres(metaRes.data?.genres || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (movie: any) => {
    reset({
      title: movie.title,
      duration: movie.duration,
      status: movie.status || "active",
      releaseDate: movie.releaseDate ? movie.releaseDate.split("T")[0] : "",
      endDate: movie.endDate ? movie.endDate.split("T")[0] : "",
      posterUrl: movie.posterUrl || "",
      backdropUrl: movie.backdropUrl || "",
      trailerUrl: movie.trailerUrl || "",
      genres: Array.isArray(movie.genres) ? movie.genres : [],
    });
    setEditingId(movie._id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!deletingId) return;
    try {
      await movieService.deleteMovie(deletingId);
      toast.success("Xoá phim thành công");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xoá phim");
    } finally {
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const onSubmit = async (formData: MovieFormData) => {
    try {
      if (editingId) {
        await movieService.updateMovie(editingId, formData);
        toast.success("Cập nhật phim thành công");
      } else {
        await movieService.createMovie(formData);
        toast.success("Thêm phim mới thành công");
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu phim");
    }
  };

  const toggleGenre = (g: string) => {
    const current = watchedGenres || [];
    const updated = current.includes(g)
      ? current.filter(item => item !== g)
      : [...current, g];
    setValue("genres", updated);
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || movie.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageMeta title="Quản lý Phim" description="Danh sách phim trong hệ thống" />
      <PageBreadCrumb pageTitle="Quản lý Phim" />
      
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4 max-w-md">
          <Input
            placeholder="Tìm tên phim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Select
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "now_showing", label: "Đang chiếu" },
              { value: "coming_soon", label: "Sắp chiếu" },
              { value: "ended", label: "Đã kết thúc" },
            ]}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            className="w-48"
          />
        </div>
        <Button onClick={() => {
          setEditingId(null);
          reset(defaultFormValues);
          setIsModalOpen(true);
        }}>
          + Thêm phim
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tên phim</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Thể loại</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Trạng thái</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Công chiếu</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Thao tác</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-gray-500">Đang tải...</TableCell>
                </TableRow>
              ) : filteredMovies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-gray-500">Không có dữ liệu</TableCell>
                </TableRow>
              ) : (
                filteredMovies.map((movie) => (
                  <TableRow key={movie._id}>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-3">
                        {movie.posterUrl && (
                          <div className="w-10 h-14 overflow-hidden rounded shadow-sm">
                            <img 
                              src={movie.posterUrl} 
                              alt={movie.title} 
                              className="object-cover w-full h-full" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {movie.title}
                          </span>
                          <span className="text-xs text-gray-500">{movie.duration} phút</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 max-w-[150px] truncate">
                      {Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge color={movie.status === "now_showing" ? "success" : movie.status === "coming_soon" ? "warning" : "error"}>
                        {movie.status === "now_showing" ? "Đang chiếu" : movie.status === "coming_soon" ? "Sắp chiếu" : "Đã kết thúc"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="primary-soft"
                          size="sm"
                          onClick={() => {
                            setViewingMovie(movie);
                            setIsViewModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400"
                        >
                          Xem
                        </Button>
                        <Button
                          variant="primary-soft"
                          size="sm"
                          onClick={() => handleEdit(movie)}
                          className="px-3 py-1.5 text-xs font-medium"
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="error-soft"
                          size="sm"
                          onClick={() => handleDelete(movie._id)}
                          className="px-3 py-1.5 text-xs font-medium"
                        >
                          Xoá
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[700px] p-8">
        <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">{editingId ? "Cập nhật phim" : "Thêm phim mới"}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <Label>Tên phim</Label>
              <Controller
                name="title"
                control={control}
                rules={{ required: "Tên phim là bắt buộc" }}
                render={({ field }) => (
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.title}
                    hint={errors.title?.message}
                  />
                )}
              />
            </div>
          </div>
          
          <div>
            <Label>Thể loại (Chọn nhiều)</Label>
            <div className="flex flex-wrap gap-2 p-3 border border-gray-100 rounded-lg dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 max-h-[120px] overflow-y-auto custom-scrollbar">
              {genres.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    (watchedGenres || []).includes(g)
                      ? "bg-brand-500 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label>Thời lượng (phút)</Label>
              <Controller
                name="duration"
                control={control}
                rules={{ required: "Thời lượng là bắt buộc", min: { value: 1, message: "Tối thiểu 1 phút" } }}
                render={({ field }) => (
                  <Input
                    type="number"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!errors.duration}
                    hint={errors.duration?.message}
                  />
                )}
              />
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    options={[
                      { value: "now_showing", label: "Đang chiếu" },
                      { value: "coming_soon", label: "Sắp chiếu" },
                      { value: "ended", label: "Đã kết thúc" },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label>Ngày công chiếu</Label>
              <Controller
                name="releaseDate"
                control={control}
                rules={{ required: "Ngày công chiếu là bắt buộc" }}
                render={({ field }) => (
                  <Input
                    type="date"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.releaseDate}
                    hint={errors.releaseDate?.message}
                  />
                )}
              />
            </div>
            <div>
              <Label>Ngày kết thúc</Label>
              <Controller
                name="endDate"
                control={control}
                rules={{ required: "Ngày kết thúc là bắt buộc" }}
                render={({ field }) => (
                  <Input
                    type="date"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.endDate}
                    hint={errors.endDate?.message}
                  />
                )}
              />
            </div>
          </div>
          <div>
            <Label>Poster URL</Label>
            <Controller
              name="posterUrl"
              control={control}
              render={({ field }) => (
                <Input
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="https://image.tmdb.org/t/p/w500/..."
                />
              )}
            />
          </div>
          <div>
            <Label>Backdrop URL</Label>
            <Controller
              name="backdropUrl"
              control={control}
              render={({ field }) => (
                <Input
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="https://image.tmdb.org/t/p/w1280/..."
                />
              )}
            />
          </div>
          <div>
            <Label>Trailer URL (YouTube)</Label>
            <Controller
              name="trailerUrl"
              control={control}
              render={({ field }) => (
                <Input
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              )}
            />
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">{editingId ? "Cập nhật" : "Thêm mới"}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Xác nhận xoá phim"
        message="Bạn có chắc muốn xoá phim này?"
        confirmText="Xoá ngay"
        variant="error"
      />
      <MovieDetailModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        movie={viewingMovie}
      />
    </>
  );
}
