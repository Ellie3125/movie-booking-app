export type TimeRangeKey = 'all' | 'morning' | 'midday' | 'afternoon' | 'evening';

type MovieLike = {
  id: string;
  title: string;
  description?: string;
  duration: number;
  genre: string[];
  poster?: string;
  releaseDate: string;
  status: string;
  language: string;
  rating: string;
  formats: string[];
  featuredNote?: string;
};

type CinemaLike = {
  id: string;
  brand: string;
  name: string;
  city: string;
  address: string;
  hotline?: string;
  features?: string[];
  imageUrl?: string;
  distanceKm?: number;
};

type BrandLike = {
  code?: string;
  name?: string;
  logo?: string;
};

export type SeatLike = {
  seatCode: string;
  label?: string;
  rowLabel?: string;
  rowIndex?: number;
  columnIndex?: number;
  type?: string;
  status?: string;
  priceType?: string;
  capacity?: number;
  coupleGroupId?: string | null;
};

type RoomLike = {
  id: string;
  cinemaId: string;
  name: string;
  roomType: string;
  totalRows: number;
  totalColumns: number;
  activeSeatCount: number;
  seatLayout: SeatLike[][];
};

type ShowtimeSeatStateLike = {
  seatCode: string;
  label?: string;
  rowLabel?: string;
  rowIndex?: number;
  columnIndex?: number;
  type?: string;
  capacity?: number;
  status: string;
};

type ShowtimeLike = {
  id: string;
  movieId: string;
  cinemaId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  format: string;
  language: string;
  basePrice: number;
  seatStates: ShowtimeSeatStateLike[];
  totalSeats?: number;
  availableSeats?: number;
  bookedSeats?: number;
  heldSeats?: number;
  disabledSeats?: number;
};

export type MovieCardViewModel = {
  id: string;
  title: string;
  poster?: string;
  rating: string;
  genreLabel: string;
  status: string;
  formatBadge?: string;
  featuredNote?: string;
  releaseDate: string;
};

export type MovieHomeViewModel = {
  banners: MovieCardViewModel[];
  featured: MovieCardViewModel[];
  nowShowing: MovieCardViewModel[];
  filtered: MovieCardViewModel[];
};

export type DateFilterOption = {
  key: string;
  dateText: string;
  weekdayText: string;
  active: boolean;
};

export type FilterChipOption<TKey extends string = string> = {
  key: TKey;
  label: string;
  active: boolean;
  count?: number;
  logo?: string;
};

export type ShowtimeButtonViewModel = {
  id: string;
  startLabel: string;
  endLabel: string;
  roomName: string;
  roomType: string;
  format: string;
  language: string;
  availableSeats: number;
  totalSeats: number;
  basePrice: number;
};

export type ShowtimeGroupViewModel = {
  key: string;
  roomName: string;
  roomType: string;
  format: string;
  showtimes: ShowtimeButtonViewModel[];
};

export type CinemaCardViewModel = {
  cinemaId: string;
  cinemaBrand: string;
  cinemaName: string;
  address: string;
  city: string;
  logo?: string;
  distanceLabel?: string;
  expanded: boolean;
  showtimeCount: number;
  showtimeGroups: ShowtimeGroupViewModel[];
};

export type ShowtimeSelectionViewModel = {
  movie: MovieLike | null;
  dateOptions: DateFilterOption[];
  timeFilters: FilterChipOption<TimeRangeKey>[];
  brandFilters: FilterChipOption[];
  activeDateKey: string;
  activeTimeRange: TimeRangeKey;
  activeCinemaChain: string;
  locationLabel: string;
  cinemaCards: CinemaCardViewModel[];
};

export type SelectedSeatSummaryItem = {
  seatCode: string;
  label: string;
  type: 'regular' | 'vip' | 'couple';
  price: number;
  rowIndex: number;
  columnIndex: number;
};

export type SelectedSeatSummary = {
  seats: SelectedSeatSummaryItem[];
  totalPrice: number;
};

export const timeRangeOptions: Array<{ key: TimeRangeKey; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'morning', label: '09:00 - 12:00' },
  { key: 'midday', label: '12:00 - 15:00' },
  { key: 'afternoon', label: '15:00 - 18:00' },
  { key: 'evening', label: '18:00 - 24:00' },
];

const weekdayLabels = [
  'Chủ nhật',
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
];

const structuralSeatTypes = new Set(['space', 'empty', 'aisle']);
const unselectableSeatTypes = new Set(['space', 'empty', 'aisle', 'disabled']);
const unselectableSeatStatuses = new Set(['booked', 'held', 'disabled']);

const padDatePart = (value: number) => String(value).padStart(2, '0');

const parseDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getLocalDateKey = (date: Date) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;

const formatDateText = (date: Date) =>
  `${padDatePart(date.getDate())}/${padDatePart(date.getMonth() + 1)}`;

const formatTimeText = (value: string) => {
  const date = parseDate(value);

  if (!date) {
    return '--:--';
  }

  return `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
};

const normalizeKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const uniqueByKey = <T,>(items: T[], getKey: (item: T) => string) => {
  const seen = new Set<string>();
  const result: T[] = [];

  items.forEach((item) => {
    const key = getKey(item);

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    result.push(item);
  });

  return result;
};

const sortShowtimesByStart = <T extends { startTime: string }>(items: T[]) =>
  [...items].sort((first, second) => {
    const firstTime = parseDate(first.startTime)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const secondTime = parseDate(second.startTime)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return firstTime - secondTime;
  });

const getTimeRange = (showtime: Pick<ShowtimeLike, 'startTime'>): TimeRangeKey => {
  const hour = parseDate(showtime.startTime)?.getHours() ?? 0;

  if (hour < 12) {
    return 'morning';
  }

  if (hour < 15) {
    return 'midday';
  }

  if (hour < 18) {
    return 'afternoon';
  }

  return 'evening';
};

const isFutureShowtime = (showtime: Pick<ShowtimeLike, 'startTime'>, now: Date) => {
  const date = parseDate(showtime.startTime);

  return Boolean(date && date.getTime() >= now.getTime());
};

const getBrandKey = (cinema?: Pick<CinemaLike, 'brand'> | null) =>
  normalizeKey(cinema?.brand ?? '');

const getBrandLabel = (brandKey: string, cinemas: CinemaLike[], brands: BrandLike[]) => {
  const brand = brands.find((item) => normalizeKey(item.code ?? item.name ?? '') === brandKey);
  const cinema = cinemas.find((item) => getBrandKey(item) === brandKey);

  return brand?.name || cinema?.brand || brandKey.toUpperCase();
};

const getBrandLogo = (brandKey: string, brands: BrandLike[]) =>
  brands.find((item) => normalizeKey(item.code ?? item.name ?? '') === brandKey)?.logo;

const countAvailableSeats = (showtime: Pick<ShowtimeLike, 'seatStates'>) =>
  showtime.seatStates
    .filter((seat) => seat.status === 'available')
    .reduce((sum, seat) => sum + (seat.capacity ?? 1), 0);

const buildMovieCard = (movie: MovieLike): MovieCardViewModel => ({
  id: movie.id,
  title: movie.title,
  poster: movie.poster,
  rating: movie.rating,
  genreLabel: movie.genre.join(' • '),
  status: movie.status,
  formatBadge: movie.formats[0],
  featuredNote: movie.featuredNote,
  releaseDate: movie.releaseDate,
});

export function buildMovieHomeViewModel(
  movies: MovieLike[],
  query = '',
): MovieHomeViewModel {
  const normalizedQuery = normalizeKey(query);
  const cards = movies.map(buildMovieCard);
  const filtered = normalizedQuery
    ? cards.filter((movie) =>
        normalizeKey(
          [
            movie.title,
            movie.rating,
            movie.genreLabel,
            movie.formatBadge ?? '',
            movie.featuredNote ?? '',
          ].join(' '),
        ).includes(normalizedQuery),
      )
    : cards;

  return {
    banners: cards.slice(0, 4),
    featured: filtered.slice(0, 8),
    nowShowing: filtered.filter((movie) => movie.status === 'now_showing'),
    filtered,
  };
}

export function buildShowtimeSelectionViewModel({
  movieId,
  cinemaId,
  movies,
  cinemas,
  rooms,
  showtimes,
  brands = [],
  selectedDate,
  selectedTimeRange = 'all',
  selectedCinemaChain = 'all',
  expandedCinemaId,
  now = new Date(),
}: {
  movieId?: string | null;
  cinemaId?: string | null;
  movies: MovieLike[];
  cinemas: CinemaLike[];
  rooms: RoomLike[];
  showtimes: ShowtimeLike[];
  brands?: BrandLike[];
  selectedDate?: string;
  selectedTimeRange?: TimeRangeKey;
  selectedCinemaChain?: string;
  expandedCinemaId?: string;
  now?: Date;
}): ShowtimeSelectionViewModel {
  const movie = movies.find((item) => item.id === movieId) ?? null;
  const cinemaById = new Map(cinemas.map((cinema) => [cinema.id, cinema]));
  const roomById = new Map(rooms.map((room) => [room.id, room]));
  const movieFutureShowtimes = sortShowtimesByStart(
    showtimes.filter(
      (showtime) =>
        showtime.movieId === movieId &&
        (!cinemaId || showtime.cinemaId === cinemaId) &&
        isFutureShowtime(showtime, now),
    ),
  );
  const dateKeys = uniqueByKey(
    movieFutureShowtimes
      .map((showtime) => parseDate(showtime.startTime))
      .filter((date): date is Date => Boolean(date)),
    getLocalDateKey,
  );
  const selectedDateIsAvailable = Boolean(
    selectedDate && dateKeys.some((date) => getLocalDateKey(date) === selectedDate),
  );
  const activeDateKey =
    selectedDateIsAvailable && selectedDate ? selectedDate : getLocalDateKey(dateKeys[0] ?? now);
  const activeDateShowtimes = movieFutureShowtimes.filter((showtime) => {
    const date = parseDate(showtime.startTime);
    return Boolean(date && getLocalDateKey(date) === activeDateKey);
  });
  const activeRangeKeys = new Set(activeDateShowtimes.map(getTimeRange));
  const timeFilters = timeRangeOptions
    .filter((option) => option.key === 'all' || activeRangeKeys.has(option.key))
    .map((option) => ({
      ...option,
      active: option.key === selectedTimeRange,
      count:
        option.key === 'all'
          ? activeDateShowtimes.length
          : activeDateShowtimes.filter((showtime) => getTimeRange(showtime) === option.key).length,
    }));
  const activeTimeRange = timeFilters.some((option) => option.key === selectedTimeRange)
    ? selectedTimeRange
    : 'all';
  const brandKeys = uniqueByKey(
    movieFutureShowtimes
      .map((showtime) => cinemaById.get(showtime.cinemaId))
      .filter((cinema): cinema is CinemaLike => Boolean(cinema)),
    getBrandKey,
  )
    .map(getBrandKey)
    .filter(Boolean);
  const requestedCinemaChain = selectedCinemaChain || 'all';
  const activeCinemaChain =
    requestedCinemaChain === 'all' || brandKeys.includes(requestedCinemaChain)
      ? requestedCinemaChain
      : 'all';
  const brandFilters: FilterChipOption[] = [
    {
      key: 'all',
      label: 'Tất cả',
      active: activeCinemaChain === 'all',
      count: movieFutureShowtimes.length,
    },
    ...brandKeys.map((brandKey) => ({
      key: brandKey,
      label: getBrandLabel(brandKey, cinemas, brands),
      logo: getBrandLogo(brandKey, brands),
      active: activeCinemaChain === brandKey,
      count: movieFutureShowtimes.filter(
        (showtime) => getBrandKey(cinemaById.get(showtime.cinemaId)) === brandKey,
      ).length,
    })),
  ];
  const filteredShowtimes = activeDateShowtimes.filter((showtime) => {
    const cinema = cinemaById.get(showtime.cinemaId);
    const matchesTime = activeTimeRange === 'all' || getTimeRange(showtime) === activeTimeRange;
    const matchesBrand =
      activeCinemaChain === 'all' || getBrandKey(cinema) === activeCinemaChain;

    return matchesTime && matchesBrand;
  });
  const cinemaMap = new Map<string, CinemaCardViewModel>();

  filteredShowtimes.forEach((showtime) => {
    const cinema = cinemaById.get(showtime.cinemaId);
    const room = roomById.get(showtime.roomId);

    if (!cinema || !room) {
      return;
    }

    const currentCard =
      cinemaMap.get(cinema.id) ??
      ({
        cinemaId: cinema.id,
        cinemaBrand: cinema.brand,
        cinemaName: cinema.name,
        address: cinema.address,
        city: cinema.city,
        logo: cinema.imageUrl,
        distanceLabel:
          typeof cinema.distanceKm === 'number'
            ? `${cinema.distanceKm.toLocaleString('vi-VN')} km`
            : undefined,
        expanded: false,
        showtimeCount: 0,
        showtimeGroups: [],
      } satisfies CinemaCardViewModel);
    const groupKey = `${room.id}_${showtime.format}`;
    let showtimeGroup = currentCard.showtimeGroups.find((group) => group.key === groupKey);

    if (!showtimeGroup) {
      showtimeGroup = {
        key: groupKey,
        roomName: room.name,
        roomType: room.roomType,
        format: showtime.format,
        showtimes: [],
      };
      currentCard.showtimeGroups.push(showtimeGroup);
    }

    const computedAvailableSeats = showtime.seatStates.length > 0
      ? countAvailableSeats(showtime)
      : (showtime.availableSeats !== undefined ? showtime.availableSeats : (room.activeSeatCount || 0));

    const computedTotalSeats = showtime.totalSeats !== undefined
      ? showtime.totalSeats
      : (room.activeSeatCount || showtime.seatStates.length);

    showtimeGroup.showtimes.push({
      id: showtime.id,
      startLabel: formatTimeText(showtime.startTime),
      endLabel: formatTimeText(showtime.endTime),
      roomName: room.name,
      roomType: room.roomType,
      format: showtime.format,
      language: showtime.language,
      availableSeats: computedAvailableSeats,
      totalSeats: computedTotalSeats,
      basePrice: showtime.basePrice,
    });
    currentCard.showtimeCount += 1;
    cinemaMap.set(cinema.id, currentCard);
  });

  const cinemaCards = [...cinemaMap.values()].map((card, index) => ({
    ...card,
    expanded: expandedCinemaId ? card.cinemaId === expandedCinemaId : index === 0,
    showtimeGroups: card.showtimeGroups.map((group) => ({
      ...group,
      showtimes: group.showtimes.sort((first, second) =>
        first.startLabel.localeCompare(second.startLabel),
      ),
    })),
  }));
  const activeCities = uniqueByKey(
    cinemaCards.map((card) => ({ city: card.city })).filter((item) => item.city),
    (item) => item.city,
  );

  return {
    movie,
    dateOptions: dateKeys.map((date) => {
      const key = getLocalDateKey(date);

      return {
        key,
        dateText: formatDateText(date),
        weekdayText: weekdayLabels[date.getDay()],
        active: key === activeDateKey,
      };
    }),
    timeFilters: timeFilters.map((option) => ({
      ...option,
      active: option.key === activeTimeRange,
    })),
    brandFilters,
    activeDateKey,
    activeTimeRange,
    activeCinemaChain,
    locationLabel:
      activeCities.length === 1
        ? activeCities[0].city
        : activeCities.length > 1
          ? `${activeCities.length} khu vực`
          : 'Chưa có suất khả dụng',
    cinemaCards,
  };
}

const normalizeSeatCode = (value: string) => value.trim().toUpperCase();

const getSeatState = (seatStates: ShowtimeSeatStateLike[], seatCode: string) =>
  seatStates.find((state) => normalizeSeatCode(state.seatCode) === normalizeSeatCode(seatCode));

const flattenLayout = (layout: SeatLike[][]) => layout.flat();

const getPhysicalSeatKey = (seat: SeatLike) => ({
  rowIndex: seat.rowIndex ?? Number.MAX_SAFE_INTEGER,
  columnIndex: seat.columnIndex ?? Number.MAX_SAFE_INTEGER,
  code: normalizeSeatCode(seat.seatCode),
});

const sortSeatIdsByLayout = (seatIds: string[], layout: SeatLike[][]) => {
  const selectedSet = new Set(seatIds.map(normalizeSeatCode));

  const sortedList = flattenLayout(layout)
    .filter((seat) => !structuralSeatTypes.has(normalizeKey(seat.type ?? '')))
    .filter((seat) => selectedSet.has(normalizeSeatCode(seat.seatCode)))
    .sort((first, second) => {
      const firstKey = getPhysicalSeatKey(first);
      const secondKey = getPhysicalSeatKey(second);

      return (
        firstKey.rowIndex - secondKey.rowIndex ||
        firstKey.columnIndex - secondKey.columnIndex ||
        firstKey.code.localeCompare(secondKey.code)
      );
    })
    .map((seat) => normalizeSeatCode(seat.seatCode));

  return Array.from(new Set(sortedList));
};

export const isSeatSelectable = (
  seat: SeatLike,
  seatStates: ShowtimeSeatStateLike[] = [],
) => {
  const seatType = normalizeKey(seat.type ?? '');
  const seatStatus = normalizeKey(getSeatState(seatStates, seat.seatCode)?.status ?? 'available');

  return !unselectableSeatTypes.has(seatType) && !unselectableSeatStatuses.has(seatStatus);
};

export function toggleSeatSelection({
  seat,
  layout,
  seatStates = [],
  selectedSeatIds = [],
}: {
  seat: SeatLike;
  layout: SeatLike[][];
  seatStates?: ShowtimeSeatStateLike[];
  selectedSeatIds?: string[];
}) {
  const currentSelectedSet = new Set(selectedSeatIds.map(normalizeSeatCode));
  const seatCode = normalizeSeatCode(seat.seatCode);

  if (!isSeatSelectable(seat, seatStates)) {
    return sortSeatIdsByLayout([...currentSelectedSet], layout);
  }

  const nextSelectedSet = new Set(currentSelectedSet);

  if (normalizeKey(seat.type ?? '') === 'couple' && seat.coupleGroupId) {
    const groupSeats = flattenLayout(layout).filter(
      (item) =>
        item.coupleGroupId === seat.coupleGroupId &&
        !structuralSeatTypes.has(normalizeKey(item.type ?? '')),
    );

    if (
      groupSeats.length > 1 &&
      groupSeats.every((groupSeat) => isSeatSelectable(groupSeat, seatStates))
    ) {
      const groupCodes = groupSeats.map((groupSeat) => normalizeSeatCode(groupSeat.seatCode));
      const groupAlreadySelected = groupCodes.every((code) => nextSelectedSet.has(code));

      groupCodes.forEach((code) => {
        if (groupAlreadySelected) {
          nextSelectedSet.delete(code);
        } else {
          nextSelectedSet.add(code);
        }
      });

      return sortSeatIdsByLayout([...nextSelectedSet], layout);
    }
  }

  if (nextSelectedSet.has(seatCode)) {
    nextSelectedSet.delete(seatCode);
  } else {
    nextSelectedSet.add(seatCode);
  }

  return sortSeatIdsByLayout([...nextSelectedSet], layout);
}

export const getSeatDisplayType = (seat: SeatLike): SelectedSeatSummaryItem['type'] => {
  const seatType = normalizeKey(seat.type ?? seat.priceType ?? '');

  if (seatType === 'vip') {
    return 'vip';
  }

  if (seatType === 'couple') {
    return 'couple';
  }

  return 'regular';
};

export const getSeatDisplayPrice = (seat: SeatLike, basePrice: number) => {
  const displayType = getSeatDisplayType(seat);

  if (displayType === 'vip') {
    return basePrice + 30000;
  }

  if (displayType === 'couple') {
    return basePrice * Math.max(seat.capacity ?? 1, 1);
  }

  return basePrice;
};

export function calculateSelectedSeatSummary({
  layout,
  selectedSeatIds = [],
  basePrice,
}: {
  layout: SeatLike[][];
  selectedSeatIds?: string[];
  basePrice: number;
}): SelectedSeatSummary {
  const selectedSet = new Set(selectedSeatIds.map(normalizeSeatCode));
  const seats = flattenLayout(layout)
    .filter((seat) => selectedSet.has(normalizeSeatCode(seat.seatCode)))
    .filter((seat) => !structuralSeatTypes.has(normalizeKey(seat.type ?? '')))
    .sort((first, second) => {
      const firstKey = getPhysicalSeatKey(first);
      const secondKey = getPhysicalSeatKey(second);

      return (
        firstKey.rowIndex - secondKey.rowIndex ||
        firstKey.columnIndex - secondKey.columnIndex ||
        firstKey.code.localeCompare(secondKey.code)
      );
    })
    .map((seat) => ({
      seatCode: normalizeSeatCode(seat.seatCode),
      label: seat.label || normalizeSeatCode(seat.seatCode),
      type: getSeatDisplayType(seat),
      price: getSeatDisplayPrice(seat, basePrice),
      rowIndex: seat.rowIndex ?? Number.MAX_SAFE_INTEGER,
      columnIndex: seat.columnIndex ?? Number.MAX_SAFE_INTEGER,
    }));

  return {
    seats,
    totalPrice: seats.reduce((total, seat) => total + seat.price, 0),
  };
}
