import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import MultiSelect from '../../components/form/MultiSelect';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Badge from '../../components/ui/badge/Badge';
import { ConfirmationModal } from '../../components/ui/modal/ConfirmationModal';
import { buildImageUrl } from '../../utils/imageUrl';

type PlannerFormData = {
  selectedMovieId: string;
  isNewMovie: boolean;
  newMovieData: {
    title: string;
    duration: number;
    status: string;
    poster: string;
    trailer: string;
  };
  selectedBrands: string[];
  selectedCities: string[];
  selectedCinemaIds: string[];
  selectedRoomIds: string[];
  numShows: string;
  openingTime: string;
  closingTime: string;
  cleaningMinutes: string;
  basePrice: string;
  startDate: string;
  endDate: string;
};

const ShowtimePlanner: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<PlannerFormData>({
    defaultValues: {
      selectedMovieId: '',
      isNewMovie: false,
      newMovieData: {
        title: '',
        duration: 120,
        status: 'now_showing',
        poster: '',
        trailer: '',
      },
      selectedBrands: [],
      selectedCities: [],
      selectedCinemaIds: [],
      selectedRoomIds: [],
      numShows: '4',
      openingTime: '08:00',
      closingTime: '23:00',
      cleaningMinutes: '15',
      basePrice: '75000',
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    }
  });

  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [createdMovieId, setCreatedMovieId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<BulkCreateResponse | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const dateRangeRef = useRef<HTMLInputElement>(null);
  const openingTimeRef = useRef<HTMLInputElement>(null);
  const closingTimeRef = useRef<HTMLInputElement>(null);

  // Watch fields for effects
  const watchedMovieId = watch('selectedMovieId');
  const watchedIsNewMovie = watch('isNewMovie');
  const watchedBrands = watch('selectedBrands');
  const watchedCities = watch('selectedCities');
  const watchedCinemaIds = watch('selectedCinemaIds');
  const watchedStartDate = watch('startDate');
  const watchedEndDate = watch('endDate');
  const watchedOpeningTime = watch('openingTime');
  const watchedClosingTime = watch('closingTime');

  useEffect(() => {
    if (!dateRangeRef.current) return;
    const fp = flatpickr(dateRangeRef.current, {
      mode: 'range',
      dateFormat: 'M j',
      conjunction: ' - ',
      defaultDate: [watchedStartDate, watchedEndDate],
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
          setValue('startDate', selectedDates[0].toISOString().split('T')[0]);
          setValue('endDate', selectedDates[1].toISOString().split('T')[0]);
        }
      },
    });

    const openFp = flatpickr(openingTimeRef.current!, {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      defaultDate: watchedOpeningTime,
      onChange: (_, timeStr) => setValue('openingTime', timeStr),
    });

    const closeFp = flatpickr(closingTimeRef.current!, {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      defaultDate: watchedClosingTime,
      onChange: (_, timeStr) => setValue('closingTime', timeStr),
    });

    return () => {
      if (!Array.isArray(fp)) fp.destroy();
      if (!Array.isArray(openFp)) openFp.destroy();
      if (!Array.isArray(closeFp)) closeFp.destroy();
    };
  }, []);

  useEffect(() => {
    if (watchedMovieId) {
      const movie = movies.find(m => m._id === watchedMovieId);
      setSelectedMovie(movie);
    } else {
      setSelectedMovie(null);
    }
  }, [watchedMovieId, movies]);

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
    if (watchedBrands.length > 0 || watchedCities.length > 0) {
      const loadCinemas = async () => {
        try {
          const cinemaList = await fetchCinemas(watchedBrands, watchedCities);
          setCinemas(cinemaList);
        } catch (err) {
          console.error('Failed to load cinemas', err);
        }
      };
      loadCinemas();
    } else {
      setCinemas([]);
    }
  }, [watchedBrands, watchedCities]);

  useEffect(() => {
    if (watchedCinemaIds.length > 0) {
      const loadRooms = async () => {
        try {
          const allRooms: Room[] = [];
          for (const cinemaId of watchedCinemaIds) {
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
  }, [watchedCinemaIds]);

  const handlePreview = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Get current form values
    const data = watch();

    try {
      let movieId = data.selectedMovieId;

      // Create new movie info if not already created
      if (data.isNewMovie) {
        if (createdMovieId) {
          movieId = createdMovieId;
        } else {
          if (!data.newMovieData.title || !data.newMovieData.duration) {
            throw new Error('Vui lòng nhập tên phim và thời lượng');
          }
          const createdMovie = await createMovie({
            ...data.newMovieData,
            releaseDate: data.startDate,
            endDate: data.endDate,
          });
          movieId = createdMovie._id;
          setCreatedMovieId(movieId);
          await loadMovies(); // Refresh list
          setValue('selectedMovieId', movieId);
        }
      } else {
        if (!data.selectedMovieId) throw new Error('Vui lòng chọn một bộ phim');
      }

      if (data.selectedRoomIds.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một phòng chiếu');
      }

      const res = await bulkCreateShowtimes({
        movieId,
        cinemaIds: data.selectedCinemaIds,
        roomIds: data.selectedRoomIds,
        startDate: data.startDate,
        endDate: data.endDate,
        mode: 'AUTO',
        showsPerDay: Number(data.numShows) || 0,
        openingTime: data.openingTime,
        closingTime: data.closingTime,
        cleaningMinutes: Number(data.cleaningMinutes) || 0,
        basePrice: Number(data.basePrice) || 0,
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
    // Basic validation before showing confirm modal
    const data = watch();
    if (!data.selectedMovieId && !data.isNewMovie) {
      setErrorMessage('Vui lòng chọn một bộ phim');
      return;
    }
    if (data.selectedRoomIds.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một phòng chiếu');
      return;
    }
    setIsConfirmOpen(true);
  };

  const executeCreate = async () => {
    // This is called after confirmation, but we can wrap it in handleSubmit if we want validation
    await handleSubmit(async (data) => {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      try {
        let movieId = data.selectedMovieId;

        // Create new movie info if not already created
        if (data.isNewMovie) {
          if (createdMovieId) {
            movieId = createdMovieId;
          } else {
            if (!data.newMovieData.title || !data.newMovieData.duration) {
              throw new Error('Vui lòng nhập tên phim và thời lượng');
            }
            const createdMovie = await createMovie({
              ...data.newMovieData,
              releaseDate: data.startDate,
              endDate: data.endDate,
            });
            movieId = createdMovie._id;
            setCreatedMovieId(movieId);
            await loadMovies(); // Refresh list
            setValue('selectedMovieId', movieId);
          }
        }

        const res = await bulkCreateShowtimes({
          movieId,
          cinemaIds: data.selectedCinemaIds,
          roomIds: data.selectedRoomIds,
          startDate: data.startDate,
          endDate: data.endDate,
          mode: 'AUTO',
          showsPerDay: Number(data.numShows) || 0,
          openingTime: data.openingTime,
          closingTime: data.closingTime,
          cleaningMinutes: Number(data.cleaningMinutes) || 0,
          basePrice: Number(data.basePrice) || 0,
          dryRun: false,
        });
        setSuccessMessage(`Đã tạo thành công ${res.createdCount} suất chiếu. Đã bỏ qua ${res.skippedCount} suất bị trùng.`);
        setIsConfirmOpen(false);
        setPreviewData(null);
      } catch (err: any) {
        setErrorMessage(err.response?.data?.message || err.message || 'Không thể tạo lịch chiếu');
      } finally {
        setLoading(false);
      }
    })();
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
              <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                <button
                  onClick={() => setValue('isNewMovie', false)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${!watchedIsNewMovie ? 'bg-white dark:bg-gray-800 shadow-sm text-brand-500' : 'text-gray-500'}`}
                >
                  Chọn có sẵn
                </button>
                <button
                  onClick={() => setValue('isNewMovie', true)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${watchedIsNewMovie ? 'bg-white dark:bg-gray-800 shadow-sm text-brand-500' : 'text-gray-500'}`}
                >
                  Thêm mới
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {!watchedIsNewMovie ? (
                <div>
                  <Label>Chọn phim từ danh sách <span className="text-red-500">*</span></Label>
                  <Controller
                    name="selectedMovieId"
                    control={control}
                    rules={{ required: !watchedIsNewMovie ? "Vui lòng chọn một bộ phim" : false }}
                    render={({ field }) => (
                      <Select
                        options={[{ value: '', label: '--- Chọn phim ---' }, ...movies.map(m => ({ value: m._id, label: m.title }))]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.selectedMovieId && <p className="mt-1 text-xs text-error-500">{errors.selectedMovieId.message}</p>}
                  {selectedMovie && (
                    <div className="mt-4 flex gap-4 p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-white/5">
                      <img
                        src={selectedMovie.posterUrl || selectedMovie.poster}
                        alt=""
                        className="w-16 h-24 object-cover rounded-lg shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">{selectedMovie.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{selectedMovie.duration} phút</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 border border-gray-100 rounded-xl dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="col-span-1 sm:col-span-2">
                      <Label>Tên Phim <span className="text-red-500">*</span></Label>
                      <Controller
                        name="newMovieData.title"
                        control={control}
                        rules={{ required: watchedIsNewMovie ? "Tên phim là bắt buộc" : false }}
                        render={({ field }) => (
                          <Input
                            type="text"
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e);
                              setCreatedMovieId(null);
                            }}
                            placeholder="Nhập tên phim..."
                            error={!!errors.newMovieData?.title}
                            hint={errors.newMovieData?.title?.message}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Label>Thời lượng (phút) <span className="text-red-500">*</span></Label>
                      <Controller
                        name="newMovieData.duration"
                        control={control}
                        rules={{ required: watchedIsNewMovie ? "Thời lượng là bắt buộc" : false, min: 1 }}
                        render={({ field }) => (
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            onFocus={(e) => e.target.select()}
                            error={!!errors.newMovieData?.duration}
                            hint={errors.newMovieData?.duration?.message}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Label>Trạng thái</Label>
                      <Controller
                        name="newMovieData.status"
                        control={control}
                        render={({ field }) => (
                          <Select
                            options={[
                              { value: 'now_showing', label: 'Đang chiếu' },
                              { value: 'coming_soon', label: 'Sắp chiếu' },
                            ]}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Label>Link Poster</Label>
                      <Controller
                        name="newMovieData.poster"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="text"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="https://example.com/poster.jpg"
                          />
                        )}
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Label>Link Trailer (YouTube)</Label>
                      <Controller
                        name="newMovieData.trailer"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="text"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="https://youtube.com/watch?v=..."
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Cinema Targeting */}
          <div className="xl:col-span-1 p-6 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">2. Chọn Rạp & Phòng</h3>
            <div className="space-y-4 mb-4">
              <Controller
                name="selectedCities"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    label="Thành phố"
                    placeholder="Chọn thành phố..."
                    options={cities.map(c => ({ value: c, text: c }))}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                name="selectedBrands"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    label="Thương hiệu"
                    placeholder="Chọn thương hiệu..."
                    options={brands.map(b => ({
                      value: b._id || b.code || b.name,
                      text: b.name,
                      image: buildImageUrl(b.logo || b.logoUrl)
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {cinemas.length > 0 && (
              <div className="mb-4">
                <Label>Chọn Rạp</Label>
                <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2">
                  <Controller
                    name="selectedCinemaIds"
                    control={control}
                    render={({ field }) => (
                      <>
                        {cinemas.map(c => (
                          <label key={c._id} className="flex items-center gap-2 p-2 transition-colors border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5">
                            <input
                              type="checkbox"
                              checked={field.value.includes(c._id)}
                              onChange={() => {
                                const newValue = field.value.includes(c._id)
                                  ? field.value.filter(id => id !== c._id)
                                  : [...field.value, c._id];
                                field.onChange(newValue);
                              }}
                              className="rounded text-brand-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{c.name}</span>
                          </label>
                        ))}
                      </>
                    )}
                  />
                </div>
              </div>
            )}

            {rooms.length > 0 && (
              <div>
                <Label>Chọn Phòng</Label>
                <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2">
                  <Controller
                    name="selectedRoomIds"
                    control={control}
                    render={({ field }) => (
                      <>
                        {rooms.map(r => (
                          <label key={r._id} className="flex items-center gap-2 p-2 transition-colors border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5">
                            <input
                              type="checkbox"
                              checked={field.value.includes(r._id)}
                              onChange={() => {
                                const newValue = field.value.includes(r._id)
                                  ? field.value.filter(id => id !== r._id)
                                  : [...field.value, r._id];
                                field.onChange(newValue);
                              }}
                              className="rounded text-brand-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{r.name}</span>
                          </label>
                        ))}
                      </>
                    )}
                  />
                </div>
                {errors.selectedRoomIds && <p className="mt-1 text-xs text-error-500">{errors.selectedRoomIds.message}</p>}
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
                    <Controller
                      name="numShows"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          value={field.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val.replace(/^0+(?=\d)/, ''));
                          }}
                          onFocus={(e) => e.target.select()}
                          min={1}
                          max={12}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Label>Dọn phòng (phút)</Label>
                    <Controller
                      name="cleaningMinutes"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          value={field.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val.replace(/^0+(?=\d)/, ''));
                          }}
                          onFocus={(e) => e.target.select()}
                          min={0}
                        />
                      )}
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
              <Controller
                name="basePrice"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    value={field.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val.replace(/^0+(?=\d)/, ''));
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="75000"
                  />
                )}
              />
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handlePreview}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xem trước lịch chiếu'}
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={loading}
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
