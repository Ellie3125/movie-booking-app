import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';

export type MovieStatus = 'now_showing' | 'coming_soon' | 'ended';
export type SeatCellType = 'seat' | 'empty';
export type SeatType = 'standard' | 'vip' | 'couple' | 'accessible';
export type SeatReservationStatus = 'available' | 'held' | 'reserved' | 'paid';
export type BookingStatus = 'held' | 'paid' | 'cancelled';
export type PaymentMethod = 'cash' | 'momo_sandbox' | 'vnpay_sandbox';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

export type Movie = {
  id: string;
  title: string;
  description: string;
  duration: number;
  genre: string[];
  poster: string;
  releaseDate: string;
  status: MovieStatus;
  language: string;
  rating: string;
  formats: string[];
  featuredNote: string;
};

export type Cinema = {
  id: string;
  brand: string;
  name: string;
  city: string;
  address: string;
  hotline: string;
  features: string[];
};

export type RoomSeat = {
  id: string;
  cellType: SeatCellType;
  coordinate: {
    rowIndex: number;
    columnIndex: number;
    coordinateLabel: string;
  };
  seatLabel: string | null;
  seatType: SeatType | null;
  priceModifier: number;
};

export type Room = {
  id: string;
  cinemaId: string;
  name: string;
  screenLabel: string;
  totalRows: number;
  totalColumns: number;
  activeSeatCount: number;
  seatLayout: RoomSeat[][];
};

export type ShowtimeSeatState = {
  seatCoordinate: string;
  seatLabel: string;
  seatType: SeatType;
  status: SeatReservationStatus;
  userId: string | null;
  bookingId: string | null;
  heldAt: string | null;
  holdExpiresAt: string | null;
  paidAt: string | null;
};

export type Showtime = {
  id: string;
  movieId: string;
  cinemaId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  format: string;
  language: string;
  basePrice: number;
  seatStates: ShowtimeSeatState[];
};

export type BookingSeatSnapshot = {
  seatCoordinate: string;
  seatLabel: string;
  seatType: SeatType;
  status: Extract<SeatReservationStatus, 'held' | 'paid'>;
  price: number;
};

export type Booking = {
  id: string;
  userId: string;
  movieId: string;
  showtimeId: string;
  roomId: string;
  seats: BookingSeatSnapshot[];
  totalPrice: number;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  paidAt: string | null;
};

export type DraftCheckout = {
  id: string;
  userId: string;
  showtimeId: string;
  movieId: string;
  roomId: string;
  seatCoordinates: string[];
  seats: BookingSeatSnapshot[];
  totalPrice: number;
  heldUntil: string;
};

type MovieInput = Omit<Movie, 'id'> & { id?: string };
type CinemaInput = Omit<Cinema, 'id'> & { id?: string };
type RoomInput = {
  id?: string;
  cinemaId: string;
  name: string;
  screenLabel: string;
  totalRows: number;
  totalColumns: number;
};
type SaveRoomLayoutInput = {
  roomId: string;
  totalRows: number;
  totalColumns: number;
  hiddenCoordinates: string[];
};

type AppStoreValue = {
  adminUser: UserProfile;
  currentUser: UserProfile;
  users: UserProfile[];
  movies: Movie[];
  cinemas: Cinema[];
  rooms: Room[];
  showtimes: Showtime[];
  bookings: Booking[];
  draftCheckout: DraftCheckout | null;
  upsertMovie: (input: MovieInput) => void;
  deleteMovie: (movieId: string) => void;
  upsertCinema: (input: CinemaInput) => void;
  deleteCinema: (cinemaId: string) => void;
  upsertRoom: (input: RoomInput) => Room;
  deleteRoom: (roomId: string) => void;
  saveRoomLayout: (input: SaveRoomLayoutInput) => void;
  startCheckout: (showtimeId: string, seatCoordinates: string[]) => {
    ok: boolean;
    error?: string;
  };
  releaseDraftCheckout: () => void;
  confirmDraftCheckout: (paymentMethod: PaymentMethod) => Booking | null;
};

const USERS: UserProfile[] = [
  { id: 'user_admin', name: 'Admin BeatCinema', email: 'admin@gmail.com', role: 'admin' },
  { id: 'user_nguyen_van_a', name: 'Nguyen Van A', email: 'user1@gmail.com', role: 'user' },
  { id: 'user_tran_thi_b', name: 'Tran Thi B', email: 'user2@gmail.com', role: 'user' },
];

const seatPriceMap: Record<SeatType, number> = {
  accessible: 85000,
  couple: 135000,
  standard: 90000,
  vip: 120000,
};

const appStoreContext = createContext<AppStoreValue | null>(null);

const makeId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const toIsoDate = (date: Date) => date.toISOString();

const buildShowtimeDate = (offsetDays: number, hour: number, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const rowLetter = (rowIndex: number) => String.fromCharCode(65 + rowIndex);

const createSeatCell = (
  rowIndex: number,
  columnIndex: number,
  seatNumber: number,
  seatType: SeatType,
): RoomSeat => ({
  id: `seat_${rowLetter(rowIndex)}${columnIndex + 1}`,
  cellType: 'seat',
  coordinate: {
    rowIndex,
    columnIndex,
    coordinateLabel: `${rowLetter(rowIndex)}${columnIndex + 1}`,
  },
  seatLabel: `${rowLetter(rowIndex)}${seatNumber}`,
  seatType,
  priceModifier: seatType === 'vip' ? 1.25 : seatType === 'couple' ? 1.5 : 1,
});

const createEmptyCell = (rowIndex: number, columnIndex: number): RoomSeat => ({
  id: `empty_${rowLetter(rowIndex)}${columnIndex + 1}`,
  cellType: 'empty',
  coordinate: {
    rowIndex,
    columnIndex,
    coordinateLabel: `${rowLetter(rowIndex)}${columnIndex + 1}`,
  },
  seatLabel: null,
  seatType: null,
  priceModifier: 0,
});

const buildSeatLayout = ({
  totalRows,
  totalColumns,
  hiddenCoordinates = [],
  seatTypeOverrides = {},
}: {
  totalRows: number;
  totalColumns: number;
  hiddenCoordinates?: string[];
  seatTypeOverrides?: Record<string, SeatType>;
}) => {
  const hiddenSet = new Set(hiddenCoordinates.map((item) => item.toUpperCase()));
  const layout: RoomSeat[][] = [];

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
    const row: RoomSeat[] = [];
    let visibleSeatIndex = 0;

    for (let columnIndex = 0; columnIndex < totalColumns; columnIndex += 1) {
      const coordinate = `${rowLetter(rowIndex)}${columnIndex + 1}`;

      if (hiddenSet.has(coordinate)) {
        row.push(createEmptyCell(rowIndex, columnIndex));
        continue;
      }

      visibleSeatIndex += 1;
      const inferredSeatType =
        seatTypeOverrides[coordinate] ??
        (rowIndex === totalRows - 1
          ? 'vip'
          : rowIndex === totalRows - 2 && columnIndex >= Math.max(0, totalColumns - 2)
            ? 'couple'
            : 'standard');

      row.push(createSeatCell(rowIndex, columnIndex, visibleSeatIndex, inferredSeatType));
    }

    layout.push(row);
  }

  return layout;
};

const flattenRoomSeats = (room: Room) =>
  room.seatLayout.flat().filter((seat) => seat.cellType === 'seat');

const buildRoom = ({
  id,
  cinemaId,
  name,
  screenLabel,
  totalRows,
  totalColumns,
  hiddenCoordinates = [],
  seatTypeOverrides = {},
}: {
  id: string;
  cinemaId: string;
  name: string;
  screenLabel: string;
  totalRows: number;
  totalColumns: number;
  hiddenCoordinates?: string[];
  seatTypeOverrides?: Record<string, SeatType>;
}): Room => {
  const seatLayout = buildSeatLayout({
    totalRows,
    totalColumns,
    hiddenCoordinates,
    seatTypeOverrides,
  });

  return {
    id,
    cinemaId,
    name,
    screenLabel,
    totalRows,
    totalColumns,
    activeSeatCount: seatLayout.flat().filter((seat) => seat.cellType === 'seat').length,
    seatLayout,
  };
};

const buildSeatStates = (
  room: Room,
  overrides: Array<Partial<ShowtimeSeatState> & { seatCoordinate: string }> = [],
) => {
  const overrideMap = new Map(
    overrides.map((item) => [item.seatCoordinate.toUpperCase(), item]),
  );

  return flattenRoomSeats(room).map((seat) => {
    const coordinate = seat.coordinate.coordinateLabel.toUpperCase();
    const override = overrideMap.get(coordinate);

    return {
      seatCoordinate: coordinate,
      seatLabel: seat.seatLabel ?? coordinate,
      seatType: seat.seatType ?? 'standard',
      status: override?.status ?? 'available',
      userId: override?.userId ?? null,
      bookingId: override?.bookingId ?? null,
      heldAt: override?.heldAt ?? null,
      holdExpiresAt: override?.holdExpiresAt ?? null,
      paidAt: override?.paidAt ?? null,
    } satisfies ShowtimeSeatState;
  });
};

const findRoomSeat = (room: Room, seatCoordinate: string) =>
  flattenRoomSeats(room).find(
    (seat) =>
      seat.coordinate.coordinateLabel.toUpperCase() === seatCoordinate.toUpperCase(),
  );

const seatSnapshotFromRoom = (
  room: Room,
  seatCoordinate: string,
  status: Extract<SeatReservationStatus, 'held' | 'paid'>,
): BookingSeatSnapshot | null => {
  const seat = findRoomSeat(room, seatCoordinate);

  if (!seat || seat.cellType !== 'seat' || !seat.seatType || !seat.seatLabel) {
    return null;
  }

  return {
    seatCoordinate: seat.coordinate.coordinateLabel.toUpperCase(),
    seatLabel: seat.seatLabel,
    seatType: seat.seatType,
    status,
    price: seatPriceMap[seat.seatType],
  };
};

const syncSeatStatesWithRoom = (room: Room, currentSeatStates: ShowtimeSeatState[]) => {
  const currentMap = new Map(
    currentSeatStates.map((item) => [item.seatCoordinate.toUpperCase(), item]),
  );

  return flattenRoomSeats(room).map((seat) => {
    const coordinate = seat.coordinate.coordinateLabel.toUpperCase();
    const previous = currentMap.get(coordinate);

    return {
      seatCoordinate: coordinate,
      seatLabel: seat.seatLabel ?? coordinate,
      seatType: seat.seatType ?? 'standard',
      status: previous?.status ?? 'available',
      userId: previous?.userId ?? null,
      bookingId: previous?.bookingId ?? null,
      heldAt: previous?.heldAt ?? null,
      holdExpiresAt: previous?.holdExpiresAt ?? null,
      paidAt: previous?.paidAt ?? null,
    } satisfies ShowtimeSeatState;
  });
};

const initialMovies: Movie[] = [
  {
    id: 'movie_dune_part_two',
    title: 'Dune: Part Two',
    description:
      'Paul Atreides returns to Arrakis and chooses war, prophecy, and impossible love.',
    duration: 166,
    genre: ['Sci-Fi', 'Adventure'],
    poster:
      'https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=900&q=80',
    releaseDate: '2024-03-01',
    status: 'now_showing',
    language: 'English subtitle',
    rating: 'T13',
    formats: ['2D', 'IMAX', 'Dolby Atmos'],
    featuredNote: 'Epic scale, premium sound, sold fast after 18:00.',
  },
  {
    id: 'movie_inside_out_2',
    title: 'Inside Out 2',
    description:
      'Riley enters the storm of teenage years and meets a louder emotional control room.',
    duration: 96,
    genre: ['Animation', 'Family', 'Comedy'],
    poster:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
    releaseDate: '2024-06-14',
    status: 'now_showing',
    language: 'Vietnamese dub',
    rating: 'P',
    formats: ['2D', 'Family'],
    featuredNote: 'Family sessions are strongest on weekend mornings.',
  },
  {
    id: 'movie_interstellar',
    title: 'Interstellar',
    description:
      'A return screening for one of the most expansive space epics ever projected.',
    duration: 169,
    genre: ['Sci-Fi', 'Drama'],
    poster:
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=900&q=80',
    releaseDate: '2014-11-07',
    status: 'now_showing',
    language: 'English subtitle',
    rating: 'T13',
    formats: ['2D', 'Special Re-run'],
    featuredNote: 'Late-night audience, premium rows nearly full.',
  },
  {
    id: 'movie_secret_wars',
    title: 'Avengers: Secret Wars',
    description:
      'Coming soon campaign page with booking reminder and franchise demand metrics.',
    duration: 140,
    genre: ['Action', 'Sci-Fi'],
    poster:
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=900&q=80',
    releaseDate: '2027-05-07',
    status: 'coming_soon',
    language: 'English subtitle',
    rating: 'T13',
    formats: ['2D', 'IMAX'],
    featuredNote: 'Open ticket alerts before pre-sale starts.',
  },
];

const initialCinemas: Cinema[] = [
  {
    id: 'cinema_cgv_vincom_ba_trieu',
    brand: 'CGV',
    name: 'Vincom Ba Trieu',
    city: 'Ha Noi',
    address: '191 Ba Trieu, Hai Ba Trung, Ha Noi',
    hotline: '1900 6017',
    features: ['IMAX', 'Couple seats', 'Parking in mall'],
  },
  {
    id: 'cinema_cgv_aeon_long_bien',
    brand: 'CGV',
    name: 'Aeon Long Bien',
    city: 'Ha Noi',
    address: '27 Co Linh, Long Bien, Ha Noi',
    hotline: '1900 6017',
    features: ['Family rooms', 'Wide aisle', 'Food court nearby'],
  },
  {
    id: 'cinema_lotte_govap',
    brand: 'Lotte',
    name: 'Go Vap',
    city: 'Ho Chi Minh City',
    address: '242 Nguyen Van Luong, Go Vap, Ho Chi Minh City',
    hotline: '1900 5555',
    features: ['Premium seats', 'Late sessions', 'Mall parking'],
  },
];

const initialRooms: Room[] = [
  buildRoom({
    id: 'room_ba_trieu_1',
    cinemaId: 'cinema_cgv_vincom_ba_trieu',
    name: 'Room 1',
    screenLabel: 'SCREEN 01',
    totalRows: 6,
    totalColumns: 10,
    hiddenCoordinates: ['A1', 'A6', 'B6', 'C1', 'C6', 'D6', 'E6', 'F1'],
    seatTypeOverrides: {
      D9: 'vip',
      D10: 'vip',
      E9: 'couple',
      E10: 'couple',
      F8: 'vip',
      F9: 'couple',
      F10: 'couple',
    },
  }),
  buildRoom({
    id: 'room_aeon_2',
    cinemaId: 'cinema_cgv_aeon_long_bien',
    name: 'Room 2',
    screenLabel: 'SCREEN FAMILY',
    totalRows: 5,
    totalColumns: 9,
    hiddenCoordinates: ['A5', 'B5', 'C1', 'C5', 'D5', 'E9'],
    seatTypeOverrides: {
      D8: 'vip',
      D9: 'vip',
      E7: 'couple',
      E8: 'couple',
    },
  }),
  buildRoom({
    id: 'room_govap_gold',
    cinemaId: 'cinema_lotte_govap',
    name: 'Gold Class',
    screenLabel: 'PREMIUM SCREEN',
    totalRows: 4,
    totalColumns: 8,
    hiddenCoordinates: ['A4', 'B4', 'C4', 'D4'],
    seatTypeOverrides: {
      A7: 'vip',
      A8: 'vip',
      B7: 'vip',
      B8: 'vip',
      C7: 'couple',
      C8: 'couple',
      D7: 'couple',
      D8: 'couple',
    },
  }),
];

const roomLookup = Object.fromEntries(initialRooms.map((room) => [room.id, room]));

const initialShowtimes: Showtime[] = [
  {
    id: 'showtime_dune_ba_trieu_evening',
    movieId: 'movie_dune_part_two',
    cinemaId: 'cinema_cgv_vincom_ba_trieu',
    roomId: 'room_ba_trieu_1',
    startTime: toIsoDate(buildShowtimeDate(1, 18, 30)),
    endTime: toIsoDate(buildShowtimeDate(1, 21, 16)),
    format: 'IMAX Laser',
    language: 'English subtitle',
    basePrice: 90000,
    seatStates: buildSeatStates(roomLookup.room_ba_trieu_1, [
      {
        seatCoordinate: 'A2',
        status: 'paid',
        userId: 'user_nguyen_van_a',
        bookingId: 'booking_dune_paid',
        paidAt: toIsoDate(new Date()),
      },
      {
        seatCoordinate: 'A3',
        status: 'paid',
        userId: 'user_nguyen_van_a',
        bookingId: 'booking_dune_paid',
        paidAt: toIsoDate(new Date()),
      },
      {
        seatCoordinate: 'B3',
        status: 'held',
        userId: 'user_tran_thi_b',
        heldAt: toIsoDate(new Date()),
        holdExpiresAt: toIsoDate(new Date(Date.now() + 5 * 60 * 1000)),
      },
      {
        seatCoordinate: 'F10',
        status: 'reserved',
        userId: 'user_admin',
      },
    ]),
  },
  {
    id: 'showtime_dune_ba_trieu_late',
    movieId: 'movie_dune_part_two',
    cinemaId: 'cinema_cgv_vincom_ba_trieu',
    roomId: 'room_ba_trieu_1',
    startTime: toIsoDate(buildShowtimeDate(1, 21, 45)),
    endTime: toIsoDate(buildShowtimeDate(2, 0, 31)),
    format: '2D Atmos',
    language: 'English subtitle',
    basePrice: 95000,
    seatStates: buildSeatStates(roomLookup.room_ba_trieu_1),
  },
  {
    id: 'showtime_inside_out_aeon_morning',
    movieId: 'movie_inside_out_2',
    cinemaId: 'cinema_cgv_aeon_long_bien',
    roomId: 'room_aeon_2',
    startTime: toIsoDate(buildShowtimeDate(2, 10, 0)),
    endTime: toIsoDate(buildShowtimeDate(2, 11, 36)),
    format: '2D Family',
    language: 'Vietnamese dub',
    basePrice: 80000,
    seatStates: buildSeatStates(roomLookup.room_aeon_2, [
      {
        seatCoordinate: 'D8',
        status: 'held',
        userId: 'user_tran_thi_b',
        heldAt: toIsoDate(new Date()),
        holdExpiresAt: toIsoDate(new Date(Date.now() + 10 * 60 * 1000)),
      },
    ]),
  },
  {
    id: 'showtime_interstellar_govap_night',
    movieId: 'movie_interstellar',
    cinemaId: 'cinema_lotte_govap',
    roomId: 'room_govap_gold',
    startTime: toIsoDate(buildShowtimeDate(2, 20, 15)),
    endTime: toIsoDate(buildShowtimeDate(2, 23, 4)),
    format: 'Premium 2D',
    language: 'English subtitle',
    basePrice: 110000,
    seatStates: buildSeatStates(roomLookup.room_govap_gold, [
      {
        seatCoordinate: 'C7',
        status: 'paid',
        userId: 'user_tran_thi_b',
        bookingId: 'booking_interstellar_paid',
        paidAt: toIsoDate(new Date()),
      },
      {
        seatCoordinate: 'C8',
        status: 'paid',
        userId: 'user_tran_thi_b',
        bookingId: 'booking_interstellar_paid',
        paidAt: toIsoDate(new Date()),
      },
    ]),
  },
];

const initialBookings: Booking[] = [
  {
    id: 'booking_dune_paid',
    userId: 'user_nguyen_van_a',
    movieId: 'movie_dune_part_two',
    showtimeId: 'showtime_dune_ba_trieu_evening',
    roomId: 'room_ba_trieu_1',
    seats: [
      seatSnapshotFromRoom(roomLookup.room_ba_trieu_1, 'A2', 'paid'),
      seatSnapshotFromRoom(roomLookup.room_ba_trieu_1, 'A3', 'paid'),
    ].filter(Boolean) as BookingSeatSnapshot[],
    totalPrice: 180000,
    status: 'paid',
    paymentMethod: 'momo_sandbox',
    createdAt: toIsoDate(new Date()),
    paidAt: toIsoDate(new Date()),
  },
  {
    id: 'booking_interstellar_paid',
    userId: 'user_tran_thi_b',
    movieId: 'movie_interstellar',
    showtimeId: 'showtime_interstellar_govap_night',
    roomId: 'room_govap_gold',
    seats: [
      seatSnapshotFromRoom(roomLookup.room_govap_gold, 'C7', 'paid'),
      seatSnapshotFromRoom(roomLookup.room_govap_gold, 'C8', 'paid'),
    ].filter(Boolean) as BookingSeatSnapshot[],
    totalPrice: 270000,
    status: 'paid',
    paymentMethod: 'cash',
    createdAt: toIsoDate(new Date()),
    paidAt: toIsoDate(new Date()),
  },
];

const sortByDateAscending = <T extends { startTime: string }>(items: T[]) =>
  [...items].sort(
    (first, second) =>
      new Date(first.startTime).getTime() - new Date(second.startTime).getTime(),
  );

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [cinemas, setCinemas] = useState<Cinema[]>(initialCinemas);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [showtimes, setShowtimes] = useState<Showtime[]>(initialShowtimes);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [draftCheckout, setDraftCheckout] = useState<DraftCheckout | null>(null);

  const adminUser = USERS[0];
  const currentUser = USERS[1];

  const clearDraftIfMatchesShowtime = (showtimeId: string) => {
    setDraftCheckout((currentDraft) =>
      currentDraft?.showtimeId === showtimeId ? null : currentDraft,
    );
  };

  const cascadeDeleteShowtimes = (showtimeIds: string[]) => {
    if (showtimeIds.length === 0) {
      return;
    }

    const showtimeIdSet = new Set(showtimeIds);

    setShowtimes((current) =>
      current.filter((showtime) => !showtimeIdSet.has(showtime.id)),
    );
    setBookings((current) =>
      current.filter((booking) => !showtimeIdSet.has(booking.showtimeId)),
    );
    setDraftCheckout((currentDraft) =>
      currentDraft && showtimeIdSet.has(currentDraft.showtimeId)
        ? null
        : currentDraft,
    );
  };

  const upsertMovie = (input: MovieInput) => {
    setMovies((current) => {
      if (!input.id) {
        return [...current, { ...input, id: makeId('movie') }];
      }

      return current.map((movie) =>
        movie.id === input.id ? { ...movie, ...input, id: input.id } : movie,
      );
    });
  };

  const deleteMovie = (movieId: string) => {
    setMovies((current) => current.filter((movie) => movie.id !== movieId));
    const relatedShowtimeIds = showtimes
      .filter((showtime) => showtime.movieId === movieId)
      .map((showtime) => showtime.id);
    cascadeDeleteShowtimes(relatedShowtimeIds);
  };

  const upsertCinema = (input: CinemaInput) => {
    setCinemas((current) => {
      if (!input.id) {
        return [...current, { ...input, id: makeId('cinema') }];
      }

      return current.map((cinema) =>
        cinema.id === input.id ? { ...cinema, ...input, id: input.id } : cinema,
      );
    });
  };

  const deleteCinema = (cinemaId: string) => {
    setCinemas((current) => current.filter((cinema) => cinema.id !== cinemaId));
    const roomIds = rooms
      .filter((room) => room.cinemaId === cinemaId)
      .map((room) => room.id);
    const relatedShowtimeIds = showtimes
      .filter(
        (showtime) =>
          showtime.cinemaId === cinemaId || roomIds.includes(showtime.roomId),
      )
      .map((showtime) => showtime.id);

    setRooms((current) => current.filter((room) => room.cinemaId !== cinemaId));
    cascadeDeleteShowtimes(relatedShowtimeIds);
  };

  const upsertRoom = (input: RoomInput) => {
    let nextRoom = rooms.find((room) => room.id === input.id) ?? null;

    setRooms((current) => {
      if (!input.id) {
        const createdRoom = buildRoom({
          id: makeId('room'),
          cinemaId: input.cinemaId,
          name: input.name,
          screenLabel: input.screenLabel,
          totalRows: input.totalRows,
          totalColumns: input.totalColumns,
        });

        nextRoom = createdRoom;
        return [...current, createdRoom];
      }

      const currentRoom = current.find((room) => room.id === input.id);
      const existingHiddenCoordinates =
        currentRoom?.seatLayout
          .flat()
          .filter((seat) => seat.cellType === 'empty')
          .map((seat) => seat.coordinate.coordinateLabel) ?? [];

      const rebuiltRoom = buildRoom({
        id: input.id,
        cinemaId: input.cinemaId,
        name: input.name,
        screenLabel: input.screenLabel,
        totalRows: input.totalRows,
        totalColumns: input.totalColumns,
        hiddenCoordinates: existingHiddenCoordinates,
      });

      nextRoom = rebuiltRoom;

      return current.map((room) => (room.id === input.id ? rebuiltRoom : room));
    });

    if (!nextRoom) {
      throw new Error('Room was not created');
    }

    setShowtimes((current) =>
      current.map((showtime) =>
        showtime.roomId === nextRoom!.id
          ? {
              ...showtime,
              cinemaId: nextRoom!.cinemaId,
              seatStates: syncSeatStatesWithRoom(nextRoom!, showtime.seatStates),
            }
          : showtime,
      ),
    );

    return nextRoom;
  };

  const deleteRoom = (roomId: string) => {
    setRooms((current) => current.filter((room) => room.id !== roomId));
    const relatedShowtimeIds = showtimes
      .filter((showtime) => showtime.roomId === roomId)
      .map((showtime) => showtime.id);
    cascadeDeleteShowtimes(relatedShowtimeIds);
  };

  const saveRoomLayout = ({
    roomId,
    totalRows,
    totalColumns,
    hiddenCoordinates,
  }: SaveRoomLayoutInput) => {
    let updatedRoom: Room | null = null;

    setRooms((current) =>
      current.map((room) => {
        if (room.id !== roomId) {
          return room;
        }

        updatedRoom = buildRoom({
          id: room.id,
          cinemaId: room.cinemaId,
          name: room.name,
          screenLabel: room.screenLabel,
          totalRows,
          totalColumns,
          hiddenCoordinates,
        });

        return updatedRoom;
      }),
    );

    if (!updatedRoom) {
      return;
    }

    setShowtimes((current) =>
      current.map((showtime) =>
        showtime.roomId === roomId
          ? {
              ...showtime,
              seatStates: syncSeatStatesWithRoom(updatedRoom!, showtime.seatStates),
            }
          : showtime,
      ),
    );

    setBookings((current) =>
      current.map((booking) => {
        if (booking.roomId !== roomId) {
          return booking;
        }

        const nextSeats = booking.seats
          .map((seat) =>
            seatSnapshotFromRoom(
              updatedRoom!,
              seat.seatCoordinate,
              booking.status === 'paid' ? 'paid' : 'held',
            ),
          )
          .filter(Boolean) as BookingSeatSnapshot[];

        return {
          ...booking,
          seats: nextSeats,
          totalPrice: nextSeats.reduce((sum, seat) => sum + seat.price, 0),
        };
      }),
    );

    clearDraftIfMatchesShowtime(
      showtimes.find((showtime) => showtime.roomId === roomId)?.id ?? '',
    );
  };

  const releaseDraftCheckout = () => {
    if (!draftCheckout) {
      return;
    }

    const seatCoordinateSet = new Set(
      draftCheckout.seatCoordinates.map((item) => item.toUpperCase()),
    );

    setShowtimes((current) =>
      current.map((showtime) => {
        if (showtime.id !== draftCheckout.showtimeId) {
          return showtime;
        }

        return {
          ...showtime,
          seatStates: showtime.seatStates.map((seat) =>
            seatCoordinateSet.has(seat.seatCoordinate.toUpperCase()) &&
            seat.status === 'held' &&
            seat.userId === currentUser.id
              ? {
                  ...seat,
                  status: 'available',
                  userId: null,
                  heldAt: null,
                  holdExpiresAt: null,
                }
              : seat,
          ),
        };
      }),
    );

    setDraftCheckout(null);
  };

  const startCheckout = (showtimeId: string, seatCoordinates: string[]) => {
    const showtime = showtimes.find((item) => item.id === showtimeId);
    const room = rooms.find((item) => item.id === showtime?.roomId);

    if (!showtime || !room) {
      return {
        ok: false,
        error: 'Khong tim thay suat chieu hoac phong chieu.',
      };
    }

    if (seatCoordinates.length === 0) {
      return {
        ok: false,
        error: 'Can chon it nhat mot ghe de tiep tuc.',
      };
    }

    const selectedSet = new Set(seatCoordinates.map((item) => item.toUpperCase()));
    const unavailableSeat = showtime.seatStates.find(
      (seat) =>
        selectedSet.has(seat.seatCoordinate.toUpperCase()) &&
        seat.status !== 'available',
    );

    if (unavailableSeat) {
      return {
        ok: false,
        error: `Ghe ${unavailableSeat.seatLabel} dang khong kha dung.`,
      };
    }

    if (draftCheckout) {
      releaseDraftCheckout();
    }

    const heldUntil = toIsoDate(new Date(Date.now() + 5 * 60 * 1000));

    setShowtimes((current) =>
      current.map((item) =>
        item.id === showtimeId
          ? {
              ...item,
              seatStates: item.seatStates.map((seat) =>
                selectedSet.has(seat.seatCoordinate.toUpperCase())
                  ? {
                      ...seat,
                      status: 'held',
                      userId: currentUser.id,
                      heldAt: toIsoDate(new Date()),
                      holdExpiresAt: heldUntil,
                    }
                  : seat,
              ),
            }
          : item,
      ),
    );

    const seats = seatCoordinates
      .map((seatCoordinate) => seatSnapshotFromRoom(room, seatCoordinate, 'held'))
      .filter(Boolean) as BookingSeatSnapshot[];

    const movie = movies.find((item) => item.id === showtime.movieId);

    setDraftCheckout({
      id: makeId('draft'),
      userId: currentUser.id,
      showtimeId,
      movieId: movie?.id ?? '',
      roomId: room.id,
      seatCoordinates: seatCoordinates.map((item) => item.toUpperCase()),
      seats,
      totalPrice: seats.reduce((sum, seat) => sum + seat.price, 0),
      heldUntil,
    });

    return { ok: true };
  };

  const confirmDraftCheckout = (paymentMethod: PaymentMethod) => {
    if (!draftCheckout) {
      return null;
    }

    const bookingId = makeId('booking');
    const seatCoordinateSet = new Set(
      draftCheckout.seatCoordinates.map((item) => item.toUpperCase()),
    );
    const paidAt = toIsoDate(new Date());

    setShowtimes((current) =>
      current.map((showtime) =>
        showtime.id === draftCheckout.showtimeId
          ? {
              ...showtime,
              seatStates: showtime.seatStates.map((seat) =>
                seatCoordinateSet.has(seat.seatCoordinate.toUpperCase())
                  ? {
                      ...seat,
                      status: 'paid',
                      bookingId,
                      userId: currentUser.id,
                      paidAt,
                      holdExpiresAt: null,
                    }
                  : seat,
              ),
            }
          : showtime,
      ),
    );

    const booking: Booking = {
      id: bookingId,
      userId: currentUser.id,
      movieId: draftCheckout.movieId,
      showtimeId: draftCheckout.showtimeId,
      roomId: draftCheckout.roomId,
      seats: draftCheckout.seats.map((seat) => ({ ...seat, status: 'paid' })),
      totalPrice: draftCheckout.totalPrice,
      status: 'paid',
      paymentMethod,
      createdAt: toIsoDate(new Date()),
      paidAt,
    };

    setBookings((current) => [booking, ...current]);
    setDraftCheckout(null);

    return booking;
  };

  const value: AppStoreValue = {
    adminUser,
    currentUser,
    users: USERS,
    movies,
    cinemas,
    rooms,
    showtimes: sortByDateAscending(showtimes),
    bookings: [...bookings].sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    ),
    draftCheckout,
    upsertMovie,
    deleteMovie,
    upsertCinema,
    deleteCinema,
    upsertRoom,
    deleteRoom,
    saveRoomLayout,
    startCheckout,
    releaseDraftCheckout,
    confirmDraftCheckout,
  };

  return <appStoreContext.Provider value={value}>{children}</appStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(appStoreContext);

  if (!context) {
    throw new Error('useAppStore must be used inside AppStoreProvider');
  }

  return context;
}
