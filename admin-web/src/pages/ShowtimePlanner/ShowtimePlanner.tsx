import React, { useState, useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import dayjs from 'dayjs';
import { CalenderIcon } from '../../icons';
import PageBreadCrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import {
  fetchMovies,
  fetchBrands,
  fetchCities,
  fetchCinemas,
  fetchRooms,
  bulkCreateShowtimes,
  createMovie,
  Movie,
  Cinema,
  Room,
  BulkCreateResponse,
} from '../../services/showtimeService';
import Button from '../../components/ui/button/Button';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Badge from '../../components/ui/badge/Badge';
import { ConfirmationModal } from '../../components/ui/modal/ConfirmationModal';

const ShowtimePlanner: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  // Selection states
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isNewMovie] = useState(true);
  const [newMovieData, setNewMovieData] = useState({
    title: '',
    duration: 120,
    status: 'now_showing',
    poster: '',
    trailer: '',
  });

  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCinemaIds, setSelectedCinemaIds] = useState<string[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);

  // Config states
  const [numShows, setNumShows] = useState(4);
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('23:00');
  const [cleaningMinutes, setCleaningMinutes] = useState(15);
  const [basePrice, setBasePrice] = useState(75000);

  const [plannerRange, setPlannerRange] = useState({
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
  });
  const dateRangeRef = useRef<HTMLInputElement>(null);
  const openingTimeRef = useRef<HTMLInputElement>(null);
  const closingTimeRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<BulkCreateResponse | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Confirmation Modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (!dateRangeRef.current) return;
    const fp = flatpickr(dateRangeRef.current, {
      mode: 'range',
      dateFormat: 'M j',
      conjunction: ' - ',
      defaultDate: [plannerRange.startDate, plannerRange.endDate],
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
          setPlannerRange({
            startDate: selectedDates[0].toISOString().split('T')[0],
            endDate: selectedDates[1].toISOString().split('T')[0],
          });
        }
      },
    });

    const timePickerConfig = {
      enableTime: true,
      noCalendar: true,
      dateFormat: "h:i K",
      amPM: ["SA", "CH"], // Vietnamese SA/CH
    };

    const openFp = flatpickr(openingTimeRef.current!, {
      ...timePickerConfig,
      defaultDate: openingTime,
      onChange: (_, timeStr) => setOpeningTime(timeStr),
    });

    const closeFp = flatpickr(closingTimeRef.current!, {
      ...timePickerConfig,
      defaultDate: closingTime,
      onChange: (_, timeStr) => setClosingTime(timeStr),
    });

    return () => {
      if (!Array.isArray(fp)) fp.destroy();
      if (!Array.isArray(openFp)) openFp.destroy();
      if (!Array.isArray(closeFp)) closeFp.destroy();
    };
  }, []);

  useEffect(() => {
    if (selectedMovieId) {
      const movie = movies.find(m => m._id === selectedMovieId);
      setSelectedMovie(movie);
    } else {
      setSelectedMovie(null);
    }
  }, [selectedMovieId, movies]);

  useEffect(() => {
    loadMovies();
    const loadMetadata = async () => {
      try {
        const [brandList, cityList] = await Promise.all([
          fetchBrands(),
          fetchCities(),
        ]);
        setBrands(brandList);
        setCities(cityList);
      } catch (err) {
        console.error('Failed to load metadata', err);
      }
    };
    loadMetadata();
  }, []);

  const loadMovies = async () => {
    try {
      const movieList = await fetchMovies();
      setMovies(movieList);
    } catch (err) {
      console.error('Failed to load movies', err);
    }
  };

  useEffect(() => {
    if (selectedBrand || selectedCity) {
      const loadCinemas = async () => {
        try {
          const cinemaList = await fetchCinemas(selectedBrand, selectedCity);
          setCinemas(cinemaList);
        } catch (err) {
          console.error('Failed to load cinemas', err);
        }
      };
      loadCinemas();
    } else {
      setCinemas([]);
    }
  }, [selectedBrand, selectedCity]);

  useEffect(() => {
    if (selectedCinemaIds.length > 0) {
      const loadRooms = async () => {
        try {
          const allRooms: Room[] = [];
          for (const cinemaId of selectedCinemaIds) {
            const roomList = await fetchRooms(cinemaId);
            allRooms.push(...roomList);
          }
          setRooms(allRooms);
        } catch (err) {
          console.error('Failed to load rooms', err);
        }
      };
      loadRooms();
    } else {
      setRooms([]);
    }
  }, [selectedCinemaIds]);

  const handlePreview = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      let movieId = selectedMovieId;

      // Create new movie info
      if (isNewMovie) {
        if (!newMovieData.title || !newMovieData.duration) {
          throw new Error('Vui lòng nhập tên phim và thời lượng');
        }
        const createdMovie = await createMovie({
          ...newMovieData,
          releaseDate: plannerRange.startDate,
          endDate: plannerRange.endDate,
        });
        movieId = createdMovie._id;
        await loadMovies(); // Refresh list
        setSelectedMovieId(movieId);
      } else {
        if (!selectedMovie) throw new Error('Please select a movie');
      }

      const res = await bulkCreateShowtimes({
        movieId,
        cinemaIds: selectedCinemaIds,
        roomIds: selectedRoomIds,
        startDate: plannerRange.startDate,
        endDate: plannerRange.endDate,
        mode: 'AUTO',
        showsPerDay: numShows,
        openingTime,
        closingTime,
        cleaningMinutes,
        basePrice,
        dryRun: true,
      });
      setPreviewData(res);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Không thể tạo bản xem trước');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsConfirmOpen(true);
  };

  const executeCreate = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      let movieId = selectedMovieId;

      // Create new movie info
      if (isNewMovie) {
        if (!newMovieData.title || !newMovieData.duration) {
          throw new Error('Vui lòng nhập tên phim và thời lượng');
        }
        const createdMovie = await createMovie({
          ...newMovieData,
          releaseDate: plannerRange.startDate,
          endDate: plannerRange.endDate,
        });
        movieId = createdMovie._id;
        await loadMovies(); // Refresh list
        setSelectedMovieId(movieId);
      } else {
        if (!selectedMovie) throw new Error('Please select a movie');
      }

      const res = await bulkCreateShowtimes({
        movieId,
        cinemaIds: selectedCinemaIds,
        roomIds: selectedRoomIds,
        startDate: plannerRange.startDate,
        endDate: plannerRange.endDate,
        mode: 'AUTO',
        showsPerDay: numShows,
        openingTime,
        closingTime,
        cleaningMinutes,
        basePrice,
        dryRun: false,
      });
      setSuccessMessage(`Đã tạo thành công ${res.createdCount} suất chiếu. Đã bỏ qua ${res.skippedCount} suất bị trùng.`);
      setPreviewData(null);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Không thể tạo lịch chiếu');
    } finally {
      setLoading(false);
    }
  };

  const toggleCinema = (id: string) => {
    setSelectedCinemaIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const toggleRoom = (id: string) => {
    setSelectedRoomIds(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };


  return (
    <>
      <PageMeta title="Lập lịch chiếu | Admin" description="Quản lý và tạo lịch chiếu phim hàng loạt" />
      <PageBreadCrumb pageTitle="Trình lập lịch chiếu" />

      <div className="flex flex-col gap-6">
        {/* Top Section: Configuration (Side by Side on XL) */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Section 1: Movie Selection */}
          <div className="xl:col-span-1 p-6 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">1. Thông tin Phim</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border border-gray-100 rounded-xl dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="col-span-1 sm:col-span-2">
                    <Label>Tên Phim</Label>
                    <Input
                      type="text"
                      value={newMovieData.title}
                      onChange={(e) => setNewMovieData({ ...newMovieData, title: e.target.value })}
                      placeholder="Nhập tên phim..."
                    />
                  </div>
                  <div>
                    <Label>Thời lượng (phút)</Label>
                    <Input
                      type="number"
                      value={newMovieData.duration}
                      onChange={(e) => setNewMovieData({ ...newMovieData, duration: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Trạng thái</Label>
                    <Select
                      options={[
                        { value: 'now_showing', label: 'Đang chiếu' },
                        { value: 'coming_soon', label: 'Sắp chiếu' },
                      ]}
                      value={newMovieData.status}
                      onChange={(val) => setNewMovieData({ ...newMovieData, status: val })}
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <Label>Link Poster</Label>
                    <Input
                      type="text"
                      value={newMovieData.poster}
                      onChange={(e) => setNewMovieData({ ...newMovieData, poster: e.target.value })}
                      placeholder="https://example.com/poster.jpg"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <Label>Link Trailer (YouTube)</Label>
                    <Input
                      type="text"
                      value={newMovieData.trailer}
                      onChange={(e) => setNewMovieData({ ...newMovieData, trailer: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 italic">
                  * Ngày chiếu sẽ được lấy từ mục 3.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Cinema Targeting */}
          <div className="xl:col-span-1 p-6 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">2. Chọn Rạp & Phòng</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Thành phố</Label>
                <Select
                  options={[{ value: "", label: "Tất cả thành phố" }, ...cities.map(c => ({ value: c, label: c }))]}
                  value={selectedCity}
                  onChange={(val) => setSelectedCity(val)}
                />
              </div>
              <div>
                <Label>Thương hiệu</Label>
                <Select
                  options={[{ value: "", label: "Tất cả thương hiệu" }, ...brands.map(b => ({ value: b._id, label: b.name }))]}
                  value={selectedBrand}
                  onChange={(val) => setSelectedBrand(val)}
                />
              </div>
            </div>

            {cinemas.length > 0 && (
              <div className="mb-4">
                <Label>Chọn Rạp</Label>
                <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2">
                  {cinemas.map(c => (
                    <label key={c._id} className="flex items-center gap-2 p-2 transition-colors border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={selectedCinemaIds.includes(c._id)}
                        onChange={() => toggleCinema(c._id)}
                        className="rounded text-brand-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {rooms.length > 0 && (
              <div>
                <Label>Chọn Phòng</Label>
                <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2">
                  {rooms.map(r => (
                    <label key={r._id} className="flex items-center gap-2 p-2 transition-colors border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={selectedRoomIds.includes(r._id)}
                        onChange={() => toggleRoom(r._id)}
                        className="rounded text-brand-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{r.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Schedule Configuration */}
          <div className="xl:col-span-1 p-6 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">3. Cấu hình lịch chiếu</h3>
            
            <div className="mb-6">
              <Label>Khoảng ngày chiếu</Label>
              <div className="relative group">
                <CalenderIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none z-10 transition-colors group-focus-within:text-brand-500" />
                <input
                  ref={dateRangeRef}
                  className="w-full h-11 pl-11 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-medium text-gray-700 outline-none dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-300 cursor-pointer focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                  placeholder="Chọn khoảng ngày chiếu"
                />
              </div>
              <p className="mt-2 text-[10px] text-gray-500 italic">Hệ thống sẽ tự động tạo lịch trong khoảng ngày này.</p>
            </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Số suất mỗi ngày</Label>
                    <Input
                      type="number"
                      value={numShows}
                      onChange={(e) => setNumShows(Number(e.target.value))}
                      min={1}
                      max={12}
                    />
                  </div>
                  <div>
                    <Label>Dọn phòng (phút)</Label>
                    <Input
                      type="number"
                      value={cleaningMinutes}
                      onChange={(e) => setCleaningMinutes(Number(e.target.value))}
                      min={0}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Giờ mở cửa</Label>
                    <div className="relative group">
                      <input
                        ref={openingTimeRef}
                        className="w-full h-11 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50/50 text-sm font-medium text-gray-700 outline-none dark:border-gray-700 dark:bg-white/5 dark:text-gray-300 cursor-pointer focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Giờ đóng cửa</Label>
                    <div className="relative group">
                      <input
                        ref={closingTimeRef}
                        className="w-full h-11 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50/50 text-sm font-medium text-gray-700 outline-none dark:border-gray-700 dark:bg-white/5 dark:text-gray-300 cursor-pointer focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

            <div className="mb-6">
              <Label>Giá vé cơ bản (VNĐ)</Label>
              <Input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                placeholder="75000"
              />
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handlePreview}
                disabled={loading || (!selectedMovieId && !isNewMovie) || (isNewMovie && !newMovieData.title) || selectedRoomIds.length === 0}
              >
                {loading ? 'Đang xử lý...' : 'Xem trước lịch chiếu'}
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={loading || (!selectedMovieId && !isNewMovie) || (isNewMovie && !newMovieData.title) || selectedRoomIds.length === 0}
              >
                Tạo lịch chiếu
              </Button>
            </div>

            {successMessage && <div className="p-3 mt-4 text-sm text-green-600 bg-green-100 rounded-lg">{successMessage}</div>}
            {errorMessage && <div className="p-3 mt-4 text-sm text-red-600 bg-red-100 rounded-lg">{errorMessage}</div>}
          </div>
        </div>

        {/* Bottom Section: Preview Table */}
        <div className="p-6 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">4. Xem trước & Kiểm tra trùng</h3>
            {previewData && (
              <div className="flex gap-2">
                <Badge color="success">{previewData.okCount} OK</Badge>
                <Badge color="error">{previewData.conflictCount} Trùng lịch</Badge>
              </div>
            )}
          </div>

          <div className="max-h-[1000px] overflow-y-auto custom-scrollbar pr-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Phòng</TableCell>
                  <TableCell isHeader>Ngày & Giờ</TableCell>
                  <TableCell isHeader>Trạng thái</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!previewData && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-20 text-center text-gray-400">
                      Nhấn Xem trước để thấy danh sách suất chiếu dự kiến.
                    </TableCell>
                  </TableRow>
                )}
                {previewData?.slots?.map((slot, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-sm font-medium">{slot.roomName}</TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-800 dark:text-white/90">
                        {dayjs(slot.date).format('DD/MM/YYYY')}
                      </div>
                      <div className="text-xs text-gray-500">{slot.startTime.split('T')[1].slice(0, 5)} - {slot.endTime.split('T')[1].slice(0, 5)}</div>
                    </TableCell>
                    <TableCell>
                      {slot.status === 'OK' ? (
                        <Badge color="success">OK</Badge>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <Badge color="error">TRÙNG LỊCH</Badge>
                          <span className="text-[10px] text-red-400">Bị trùng với suất chiếu khác</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeCreate}
        title="Xác nhận tạo lịch chiếu"
        message="Bạn có chắc chắn muốn tạo các suất chiếu này? Các suất bị trùng sẽ bị bỏ qua."
        confirmText="Đồng ý tạo"
        variant="warning"
      />
    </>
  );
};

export default ShowtimePlanner;
