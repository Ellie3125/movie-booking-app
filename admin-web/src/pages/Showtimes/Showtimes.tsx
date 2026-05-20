import { useEffect, useState, useRef } from "react";
import flatpickr from 'flatpickr';
import dayjs from 'dayjs';
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Select from "../../components/form/Select";
import Label from "../../components/form/Label";

import { 
  getShowtimes, 
  deleteShowtime, 
  updateShowtime,
  fetchMovies,
  fetchBrands,
  fetchCities,
  fetchCinemas,
  fetchRooms,
  Movie,
  Cinema,
  Room
} from "../../services/showtimeService";
import toast from "react-hot-toast";
import { Link } from "react-router";
import { ConfirmationModal } from "../../components/ui/modal/ConfirmationModal";
import { CalenderIcon, CloseLineIcon } from "../../icons";

export default function Showtimes() {
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter Options
  const [movies, setMovies] = useState<Movie[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  // Filter values
  const [filterMovie, setFilterMovie] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterCinema, setFilterCinema] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [filterDate, setFilterDate] = useState(dayjs().format('YYYY-MM-DD'));

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const datePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [movieList, brandList, cityList] = await Promise.all([
          fetchMovies(),
          fetchBrands(),
          fetchCities()
        ]);
        setMovies(movieList);
        setBrands(brandList);
        setCities(cityList);
      } catch (error) {
        console.error("Failed to load filters", error);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!datePickerRef.current) return;
    const fp = flatpickr(datePickerRef.current, {
      dateFormat: 'M j',
      defaultDate: dayjs().toDate(),
      onChange: (selectedDates) => {
        if (selectedDates.length > 0) {
          setFilterDate(selectedDates[0].toISOString().split('T')[0]);
        } else {
          setFilterDate("");
        }
      },
    });
    return () => {
      if (!Array.isArray(fp)) fp.destroy();
    };
  }, []);

  useEffect(() => {
    fetchCinemas(filterBrand ? [filterBrand] : [], filterCity ? [filterCity] : []).then(setCinemas).catch(console.error);
    setFilterCinema("");
  }, [filterBrand, filterCity]);

  useEffect(() => {
    if (filterCinema) {
      fetchRooms(filterCinema).then(setRooms).catch(console.error);
    } else {
      setRooms([]);
    }
    setFilterRoom("");
  }, [filterCinema]);

  const loadShowtimes = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterMovie) params.movieId = filterMovie;
      if (filterCinema) params.cinemaId = filterCinema;
      if (filterRoom) params.roomId = filterRoom;
      if (filterDate) params.date = filterDate;

      const response = await getShowtimes(params);
      setShowtimes(response.data?.items || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi tải danh sách suất chiếu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShowtimes();
  }, [filterMovie, filterCinema, filterRoom, filterDate]);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteShowtime(deletingId);
      toast.success("Xoá suất chiếu thành công");
      loadShowtimes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xoá suất chiếu đã có người đặt vé");
    } finally {
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (showtime: any) => {
    const newStatus = showtime.status === "locked" ? "active" : "locked";
    try {
      await updateShowtime(showtime._id, {
        movieId: showtime.movie?._id || showtime.movieId,
        cinemaId: showtime.cinema?._id || showtime.cinemaId,
        roomId: showtime.room?._id || showtime.roomId,
        startTime: showtime.startTime,
        price: showtime.price,
        status: newStatus
      });
      toast.success(newStatus === "active" ? "Đã mở bán vé" : "Đã khóa bán vé");
      loadShowtimes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  // Group showtimes by date
  const groupedShowtimes = showtimes.reduce((acc: any, showtime: any) => {
    const dateLabel = dayjs(showtime.startTime).format('dddd, [ngày] D [tháng] M [năm] YYYY');
    if (!acc[dateLabel]) acc[dateLabel] = [];
    acc[dateLabel].push(showtime);
    return acc;
  }, {});

  return (
    <>
      <PageMeta title="Quản lý Lịch chiếu" description="Quản lý danh sách suất chiếu phim" />
      <PageBreadCrumb pageTitle="Quản lý Lịch chiếu" />
      
      {/* Filters Section */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] sm:grid-cols-2 lg:grid-cols-6 items-end">
        <div>
          <Label>Phim</Label>
          <Select
            options={[{ value: "", label: "Tất cả phim" }, ...movies.map(m => ({ value: m._id, label: m.title }))]}
            value={filterMovie}
            onChange={setFilterMovie}
          />
        </div>
        <div>
          <Label>Thành phố</Label>
          <Select
            options={[{ value: "", label: "Tất cả thành phố" }, ...cities.map(c => ({ value: c, label: c }))]}
            value={filterCity}
            onChange={setFilterCity}
          />
        </div>
        <div>
          <Label>Hãng</Label>
          <Select
            options={[{ value: "", label: "Tất cả hãng" }, ...brands.map(b => ({ value: b._id, label: b.name }))]}
            value={filterBrand}
            onChange={setFilterBrand}
          />
        </div>
        <div>
          <Label>Rạp</Label>
          <Select
            options={[{ value: "", label: "Tất cả rạp" }, ...cinemas.map(c => ({ value: c._id, label: c.name }))]}
            value={filterCinema}
            onChange={setFilterCinema}
          />
        </div>
        <div>
          <Label>Phòng</Label>
          <Select
            options={[{ value: "", label: "Tất cả phòng" }, ...rooms.map(r => ({ value: r._id, label: r.name }))]}
            value={filterRoom}
            onChange={setFilterRoom}
            disabled={!filterCinema}
          />
        </div>
        <div className="lg:col-span-1">
          <Label>Ngày chiếu</Label>
          <div className="relative group">
            <CalenderIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none z-10 transition-colors group-focus-within:text-brand-500" />
            <input
              ref={datePickerRef}
              type="text"
              placeholder="Chọn ngày"
              className="w-full h-11 pl-11 pr-10 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-medium text-gray-700 outline-none dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-300 cursor-pointer focus:border-brand-500 transition-all"
            />
            {filterDate && (
              <button 
                onClick={() => setFilterDate("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                title="Xóa bộ lọc ngày"
              >
                <CloseLineIcon className="size-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Link to="/showtime-planner" className="w-full">
            <Button className="w-full">+ Lập lịch hàng loạt</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          </div>
        ) : Object.keys(groupedShowtimes).length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-20 text-center dark:border-white/[0.05]">
            <p className="text-gray-500">Không tìm thấy suất chiếu nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          Object.entries(groupedShowtimes).map(([dateLabel, items]: [string, any]) => (
            <div key={dateLabel} className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {dateLabel}
                </h3>
                <div className="h-px flex-1 bg-gray-100 dark:bg-white/[0.05]"></div>
                <Badge color="info">{items.length} suất</Badge>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Phim</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Rạp / Phòng</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Thời gian</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Giá vé</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Trạng thái</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Thao tác</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {items.map((showtime: any) => (
                        <TableRow key={showtime._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                          <TableCell className="px-5 py-4 text-start">
                            <div className="flex items-center gap-3">
                              {showtime.movie?.poster && (
                                <img src={showtime.movie.poster} alt="" className="h-10 w-7 rounded object-cover shadow-sm" />
                              )}
                              <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                                {showtime.movie?.title}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <div className="font-medium text-gray-700 dark:text-gray-300">{showtime.cinema?.name}</div>
                            <div className="text-xs text-gray-400">{showtime.room?.name}</div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <div className="font-bold text-brand-500">
                              {new Date(showtime.startTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-xs opacity-60">Kết thúc: {new Date(showtime.endTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 font-medium">
                            {showtime.price?.toLocaleString("vi-VN")} đ
                          </TableCell>
                          <TableCell className="px-4 py-3 text-start">
                            {showtime.status === "locked" ? (
                              <Badge color="error">Đã khóa</Badge>
                            ) : (
                              <Badge color="success">Đang bán</Badge>
                            )}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-end">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="primary-soft"
                                size="sm"
                                onClick={() => handleToggleStatus(showtime)}
                                className="px-3 py-1.5 text-xs font-medium"
                                title={showtime.status === "locked" ? "Mở bán vé" : "Khóa bán vé"}
                              >
                                {showtime.status === "locked" ? "Mở bán" : "Khóa vé"}
                              </Button>
                              <Button
                                variant="error-soft"
                                size="sm"
                                onClick={() => handleDelete(showtime._id)}
                                className="px-3 py-1.5 text-xs font-medium"
                              >
                                Xoá
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Xác nhận xoá suất chiếu"
        message="Bạn có chắc muốn xoá suất chiếu này? Hành động này không thể hoàn tác nếu đã có dữ liệu liên quan."
        confirmText="Xoá ngay"
        variant="error"
      />
    </>
  );
}
