import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  API_BASE_URL,
  ApiRequestError,
  cancelBooking as cancelBookingRequest,
  createBooking as createBookingRequest,
  createAdminUser,
  createMovie as createMovieRequest,
  createRoom as createRoomRequest,
  createShowtimeSchedule as createShowtimeScheduleRequest,
  deleteMovie as deleteMovieRequest,
  deleteRoom as deleteRoomRequest,
  fetchCinemas,
  fetchCurrentUser,
  fetchMovies,
  fetchMyBookingById,
  fetchMyBookings,
  fetchPaymentBill,
  fetchRoomById,
  fetchRooms,
  fetchShowtimeById,
  fetchShowtimes,
  loginUser,
  logoutUser,
  payBookingBill,
  registerUser,
  updateMovie as updateMovieRequest,
  updateRoom as updateRoomRequest,
  updateUserProfile,
  updateUserNotificationPreferences,
  updateUserPreferences,
  deleteUserAccount,
  uploadUserAvatar,
  changeUserPassword,
  type BackendBooking,
  type BackendCinema,
  type BackendMovie,
  type BackendRoom,
  type BackendMovieMutationPayload,
  type BackendShowtimeDetail,
  type BackendShowtimeListItem,
  type BackendUser,
  type BackendCinemaBrand,
  fetchCinemaOptions,
} from '@/lib/backend-api';
import { getMoviePosterPath } from '@/lib/image-url';
import { getEdgeSeatSelectionConflict } from '@/lib/seat-selection-rule';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '@/lib/tokenStorage';

export type MovieStatus = 'now_showing' | 'coming_soon' | 'ended';
export type SeatCellType = 'seat' | 'space';
export type SeatType = 'regular' | 'standard' | 'vip' | 'couple' | 'disabled' | 'space';
export type SeatReservationStatus = 'available' | 'held' | 'booked' | 'disabled';
export type BookingStatus = 'held' | 'paid' | 'booked' | 'cancelled' | 'pending_payment' | 'confirmed' | 'expired';
export type PaymentMethod = 'momo_sandbox' | 'vnpay_sandbox' | 'mock_gateway';
export type AuthStatus = 'bootstrapping' | 'authenticated' | 'unauthenticated';

export type UserProfile = {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'staff' | 'user';
  dateOfBirth?: string | null;
  gender?: 'male' | 'female' | 'other' | '';
  address?: string;
  country?: string;
  bio?: string;
  notificationPreferences?: {
    email: {
      bookingConfirmation: boolean;
      promotions: boolean;
      systemUpdates: boolean;
    };
    push: {
      bookingConfirmation: boolean;
      promotions: boolean;
      showReminders: boolean;
    };
  };
  preferences?: {
    language: 'vi' | 'en';
    theme: 'light' | 'dark' | 'system';
    timezone: string;
    dateFormat: string;
  };
  createdAt?: string;
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
  imageUrl?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
};

export type RoomSeat = {
  seatCode: string;
  label?: string;
  rowLabel: string;
  rowIndex: number;
  columnIndex: number;
  type: SeatType;
  status: 'active' | 'disabled';
  priceType?: 'standard' | 'vip' | 'couple';
  capacity: number;
  size: number;
  coupleGroupId: string | null;
};

export type Room = {
  id: string;
  cinemaId: string;
  name: string;
  roomType: 'standard' | 'vip' | 'gold' | 'imax';
  totalRows: number;
  totalColumns: number;
  activeSeatCount: number;
  seatLayout: RoomSeat[][];
};

export type ShowtimeSeatState = {
  seatCode: string;
  label: string;
  rowLabel: string;
  rowIndex: number;
  columnIndex: number;
  type: SeatType;
  capacity: number;
  coupleGroupId: string | null;
  status: SeatReservationStatus;
  userId: string | null;
  bookingId: string | null;
  heldAt: string | null;
  holdExpiresAt: string | null;
  bookedAt: string | null;
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
  seatCode: string;
  seatLabel: string;
  seatType: SeatType;
  status: Extract<SeatReservationStatus, 'held' | 'booked'>;
  price: number;
  coupleGroupId: string | null;
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
  paymentMethod: PaymentMethod | null;
  createdAt: string;
  paidAt: string | null;
  paymentExpiresAt?: string | null;
};

export type DraftCheckout = {
  id: string;
  userId: string;
  showtimeId: string;
  movieId: string;
  roomId: string;
  seatCodes: string[];
  seats: BookingSeatSnapshot[];
  totalPrice: number;
  heldUntil: string;
};

type MovieInput = Omit<Movie, 'id'> & { id?: string };
type CinemaInput = Omit<Cinema, 'id'> & { id?: string };
type ShowtimeScheduleInput = {
  movieId: string;
  cinemaId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  showsPerDay: number;
};
type RoomInput = {
  id?: string;
  cinemaId: string;
  name: string;
  roomType: 'standard' | 'vip' | 'gold' | 'imax';
  totalRows: number;
  totalColumns: number;
};
type SaveRoomLayoutInput = {
  roomId: string;
  totalRows: number;
  totalColumns: number;
  hiddenCoordinates: string[];
};

type AuthActionResult = {
  ok: boolean;
  error?: string;
  user?: UserProfile;
};

type RoomMutationResult = {
  ok: boolean;
  error?: string;
  room?: Room;
};

type MovieMutationResult = {
  ok: boolean;
  error?: string;
  movie?: Movie;
};

type DeleteMovieResult = {
  ok: boolean;
  error?: string;
};

type ShowtimeScheduleMutationResult = {
  ok: boolean;
  error?: string;
  createdCount?: number;
};

type DeleteRoomResult = {
  ok: boolean;
  error?: string;
};

type CreateAdminAccountResult = {
  ok: boolean;
  error?: string;
  admin?: UserProfile;
};

type AppStoreValue = {
  adminUser: UserProfile | null;
  currentUser: UserProfile | null;
  authToken: string | null;
  authStatus: AuthStatus;
  isAuthenticated: boolean;
  isAdmin: boolean;
  users: UserProfile[];
  movies: Movie[];
  cinemas: Cinema[];
  rooms: Room[];
  showtimes: Showtime[];
  bookings: Booking[];
  draftCheckout: DraftCheckout | null;
  brands: BackendCinemaBrand[];
  refreshShowtime?: (showtimeId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  login: (input: {
    email: string;
    password: string;
    persistSession?: boolean;
  }) => Promise<AuthActionResult>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    persistSession?: boolean;
  }) => Promise<AuthActionResult>;
  createAdminAccount: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<CreateAdminAccountResult>;
  logout: () => Promise<void>;
  updateProfile: (payload: Partial<BackendUser>) => Promise<AuthActionResult>;
  updateNotificationPreferences: (payload: any) => Promise<AuthActionResult>;
  updatePreferences: (payload: any) => Promise<AuthActionResult>;
  deleteAccount: (payload: any) => Promise<AuthActionResult>;
  uploadAvatar: (formData: FormData) => Promise<AuthActionResult>;
  changePassword: (payload: any) => Promise<AuthActionResult>;
  upsertMovie: (input: MovieInput) => Promise<MovieMutationResult>;
  deleteMovie: (movieId: string) => Promise<DeleteMovieResult>;
  upsertCinema: (input: CinemaInput) => void;
  deleteCinema: (cinemaId: string) => void;
  upsertRoom: (input: RoomInput) => Promise<RoomMutationResult>;
  deleteRoom: (roomId: string) => Promise<DeleteRoomResult>;
  createShowtimeSchedule: (
    input: ShowtimeScheduleInput,
  ) => Promise<ShowtimeScheduleMutationResult>;
  saveRoomLayout: (input: SaveRoomLayoutInput) => Promise<RoomMutationResult>;
  startCheckout: (showtimeId: string, seatCodes: string[]) => Promise<{
    ok: boolean;
    error?: string;
  }>;
  releaseDraftCheckout: () => Promise<void>;
  confirmDraftCheckout: (paymentMethod: PaymentMethod) => Promise<Booking | null>;
};

const seatPriceMap: Record<string, number> = {
  couple: 180000,
  vip: 120000,
  standard: 90000,
};

const ADMIN_ACCOUNT_LOGIN_MESSAGE =
  'Tài khoản quản trị vui lòng đăng nhập tại trang admin';

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
  type: SeatType,
): RoomSeat => ({
  seatCode: `${rowLetter(rowIndex)}${columnIndex + 1}`,
  rowLabel: rowLetter(rowIndex),
  rowIndex,
  columnIndex,
  type,
  label: type === 'couple' ? `${rowLetter(rowIndex)}${seatNumber}-${rowLetter(rowIndex)}${seatNumber + 1}` : `${rowLetter(rowIndex)}${seatNumber}`,
  status: 'active',
  priceType: type === 'couple' ? 'couple' : (type === 'vip' ? 'vip' : 'standard'),
  capacity: type === 'couple' ? 2 : 1,
  size: 1,
  coupleGroupId: null,
});

const createSpaceCell = (rowIndex: number, columnIndex: number): RoomSeat => ({
  seatCode: `space_${rowLetter(rowIndex)}${columnIndex + 1}`,
  rowLabel: rowLetter(rowIndex),
  rowIndex,
  columnIndex,
  type: 'space',
  label: '',
  status: 'active',
  capacity: 0,
  size: 1,
  coupleGroupId: null,
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
        row.push(createSpaceCell(rowIndex, columnIndex));
        continue;
      }

      const inferredSeatType = seatTypeOverrides[coordinate] ?? 'standard';
      row.push(createSeatCell(rowIndex, columnIndex, visibleSeatIndex + 1, inferredSeatType));
      
      if (inferredSeatType === 'couple') {
        visibleSeatIndex += 2;
      } else {
        visibleSeatIndex += 1;
      }
    }

    layout.push(row);
  }

  return layout;
};

const flattenRoomSeats = (room: Room) =>
  room.seatLayout.flat().filter((seat) => seat.type !== 'space');

const buildRoom = ({
  id,
  cinemaId,
  name,
  roomType,
  totalRows,
  totalColumns,
  hiddenCoordinates = [],
  seatTypeOverrides = {},
}: {
  id: string;
  cinemaId: string;
  name: string;
  roomType: string;
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
    roomType: roomType as 'standard' | 'vip' | 'gold' | 'imax',
    totalRows,
    totalColumns,
    activeSeatCount: seatLayout.flat().reduce((acc, seat) => acc + (!['space', 'empty', 'aisle', 'disabled'].includes(seat.type) ? seat.capacity : 0), 0),
    seatLayout,
  };
};

const getHiddenCoordinatesFromRoom = (room: Room) =>
  room.seatLayout
    .flat()
    .filter((seat) => seat.type === 'space')
    .map((seat) => seat.seatCode.toUpperCase());

const buildSeatStates = (
  room: Room,
  overrides: Array<Partial<ShowtimeSeatState> & { seatCode: string }> = [],
) => {
  const overrideMap = new Map(
    overrides.map((item) => [item.seatCode.toUpperCase(), item]),
  );

  return flattenRoomSeats(room).map((seat) => {
    const coordinate = seat.seatCode.toUpperCase();
    const override = overrideMap.get(coordinate);

    return {
      seatCode: coordinate,
      label: seat.label ?? coordinate,
      rowLabel: seat.rowLabel,
      rowIndex: seat.rowIndex,
      columnIndex: seat.columnIndex,
      type: seat.type,
      capacity: seat.capacity,
      coupleGroupId: seat.coupleGroupId,
      status: (override?.status ?? 'available') as SeatReservationStatus,
      userId: override?.userId ?? null,
      bookingId: override?.bookingId ?? null,
      heldAt: override?.heldAt ?? null,
      holdExpiresAt: override?.holdExpiresAt ?? null,
      bookedAt: override?.bookedAt ?? null,
    } satisfies ShowtimeSeatState;
  });
};

const findRoomSeat = (room: Room, seatCode: string) =>
  flattenRoomSeats(room).find(
    (seat) =>
      seat.seatCode.toUpperCase() === seatCode.toUpperCase(),
  );

const seatSnapshotFromRoom = (
  room: Room,
  seatCode: string,
  status: Extract<SeatReservationStatus, 'held' | 'booked'>,
): BookingSeatSnapshot | null => {
  const seat = findRoomSeat(room, seatCode);

  if (!seat || seat.type === 'space' || !seat.label) {
    return null;
  }

  return {
    seatCode: seat.seatCode.toUpperCase(),
    seatLabel: seat.label,
    seatType: seat.type as 'standard' | 'couple' | 'vip',
    status,
    price: seatPriceMap[seat.type] || 0,
    coupleGroupId: seat.coupleGroupId,
  };
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
    id: 'movie_deadpool_wolverine',
    title: 'Deadpool & Wolverine',
    description:
      'The most chaotic duo in Marvel collides with a mission that tears across the multiverse.',
    duration: 128,
    genre: ['Action', 'Comedy', 'Sci-Fi'],
    poster:
      'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=900&q=80',
    releaseDate: '2024-07-26',
    status: 'now_showing',
    language: 'English subtitle',
    rating: 'T18',
    formats: ['2D', 'Dolby Atmos'],
    featuredNote: 'Late sessions keep selling out in the last row first.',
  },
  {
    id: 'movie_kung_fu_panda_4',
    title: 'Kung Fu Panda 4',
    description: 'Po returns to protect the Valley of Peace and train the next warrior.',
    duration: 94,
    genre: ['Animation', 'Comedy', 'Family'],
    poster:
      'https://images.unsplash.com/photo-1542204625-de293a6b4179?auto=format&fit=crop&w=900&q=80',
    releaseDate: '2024-03-08',
    status: 'now_showing',
    language: 'Vietnamese dub',
    rating: 'P',
    formats: ['2D', 'Family'],
    featuredNote: 'Best tested with family flow and quick seat selection.',
  },
  {
    id: 'movie_godzilla_x_kong',
    title: 'Godzilla x Kong: The New Empire',
    description:
      'The Titans are forced into a new alliance when an ancient threat rises from Hollow Earth.',
    duration: 115,
    genre: ['Action', 'Sci-Fi', 'Adventure'],
    poster:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
    releaseDate: '2024-03-29',
    status: 'now_showing',
    language: 'English subtitle',
    rating: 'T13',
    formats: ['2D', 'IMAX'],
    featuredNote: 'Large rooms and IMAX sessions are useful for seat-map stress tests.',
  },
  {
    id: 'movie_the_batman',
    title: 'The Batman',
    description:
      'Batman follows a darker trail of clues through Gotham as the city fractures under fear.',
    duration: 176,
    genre: ['Action', 'Crime', 'Drama'],
    poster:
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=900&q=80',
    releaseDate: '2022-03-04',
    status: 'now_showing',
    language: 'English subtitle',
    rating: 'T18',
    formats: ['2D', 'Dolby Atmos'],
    featuredNote: 'Evening sessions are dense enough to test booked-seat states.',
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
    id: 'cinema_beta_my_dinh',
    brand: 'Beta',
    name: 'My Dinh',
    city: 'Ha Noi',
    address: 'Me Tri, Nam Tu Liem, Ha Noi',
    hotline: '1900 2224',
    features: ['Wide aisle', 'Late sessions', 'Food court nearby'],
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
  {
    id: 'cinema_cgv_vincom_da_nang',
    brand: 'CGV',
    name: 'Vincom Da Nang',
    city: 'Da Nang',
    address: 'Ngo Quyen, Son Tra, Da Nang',
    hotline: '1900 6017',
    features: ['IMAX', 'Premium seats', 'Parking in mall'],
  },
];

const initialRooms: Room[] = [
  buildRoom({
    id: 'room_ba_trieu_1',
    cinemaId: 'cinema_cgv_vincom_ba_trieu',
    name: 'Room 1',
    roomType: 'standard',
    totalRows: 6,
    totalColumns: 10,
    hiddenCoordinates: ['A5', 'A6', 'B6', 'C5', 'C6', 'D6', 'E6', 'F5'],
    seatTypeOverrides: {
      E9: 'couple',
      E10: 'couple',
      F9: 'couple',
      F10: 'couple',
    },
  }),
  buildRoom({
    id: 'room_aeon_2',
    cinemaId: 'cinema_cgv_aeon_long_bien',
    name: 'Room 2',
    roomType: 'standard',
    totalRows: 5,
    totalColumns: 9,
    hiddenCoordinates: ['A5', 'B5', 'C5', 'D5', 'E5'],
    seatTypeOverrides: {
      E7: 'couple',
      E8: 'couple',
    },
  }),
  buildRoom({
    id: 'room_govap_gold',
    cinemaId: 'cinema_lotte_govap',
    name: 'Gold Class',
    roomType: 'gold',
    totalRows: 4,
    totalColumns: 8,
    hiddenCoordinates: ['A4', 'B4', 'C4', 'D4'],
    seatTypeOverrides: {
      C7: 'couple',
      C8: 'couple',
      D7: 'couple',
      D8: 'couple',
    },
  }),
  buildRoom({
    id: 'room_ba_trieu_imax',
    cinemaId: 'cinema_cgv_vincom_ba_trieu',
    name: 'IMAX Hall',
    roomType: 'imax',
    totalRows: 8,
    totalColumns: 12,
    hiddenCoordinates: [
      'A6',
      'A7',
      'B6',
      'B7',
      'C6',
      'C7',
      'D6',
      'D7',
      'E6',
      'E7',
      'F6',
      'F7',
      'G6',
      'G7',
    ],
    seatTypeOverrides: {
      G9: 'couple',
      G10: 'couple',
      G11: 'couple',
      H9: 'couple',
      H10: 'couple',
      H11: 'couple',
      H12: 'couple',
    },
  }),
  buildRoom({
    id: 'room_aeon_max',
    cinemaId: 'cinema_cgv_aeon_long_bien',
    name: 'Room 5',
    roomType: 'imax',
    totalRows: 8,
    totalColumns: 12,
    hiddenCoordinates: [
      'A6',
      'A7',
      'B6',
      'B7',
      'C6',
      'C7',
      'D6',
      'D7',
      'E6',
      'E7',
      'F6',
      'F7',
      'G6',
      'G7',
    ],
    seatTypeOverrides: {
      G9: 'couple',
      G10: 'couple',
      G11: 'couple',
      H9: 'couple',
      H10: 'couple',
      H11: 'couple',
      H12: 'couple',
    },
  }),
  buildRoom({
    id: 'room_beta_1',
    cinemaId: 'cinema_beta_my_dinh',
    name: 'Room 1',
    roomType: 'standard',
    totalRows: 6,
    totalColumns: 10,
    hiddenCoordinates: ['A5', 'A6', 'B6', 'C5', 'C6', 'D6', 'E6', 'F5'],
    seatTypeOverrides: {
      E9: 'couple',
      E10: 'couple',
      F9: 'couple',
      F10: 'couple',
    },
  }),
  buildRoom({
    id: 'room_beta_2',
    cinemaId: 'cinema_beta_my_dinh',
    name: 'Room 2',
    roomType: 'standard',
    totalRows: 5,
    totalColumns: 8,
    hiddenCoordinates: ['A4', 'B4', 'C4', 'D4', 'E4'],
    seatTypeOverrides: {
      E7: 'couple',
      E8: 'couple',
    },
  }),
  buildRoom({
    id: 'room_govap_standard',
    cinemaId: 'cinema_lotte_govap',
    name: 'Standard 2',
    roomType: 'standard',
    totalRows: 5,
    totalColumns: 8,
    hiddenCoordinates: ['A4', 'B4', 'C4', 'D4', 'E4'],
    seatTypeOverrides: {
      E7: 'couple',
      E8: 'couple',
    },
  }),
  buildRoom({
    id: 'room_danang_3',
    cinemaId: 'cinema_cgv_vincom_da_nang',
    name: 'Room 3',
    roomType: 'standard',
    totalRows: 6,
    totalColumns: 10,
    hiddenCoordinates: ['A5', 'A6', 'B6', 'C5', 'C6', 'D6', 'E6', 'F5'],
    seatTypeOverrides: {
      E9: 'couple',
      E10: 'couple',
      F9: 'couple',
      F10: 'couple',
    },
  }),
  buildRoom({
    id: 'room_danang_premium',
    cinemaId: 'cinema_cgv_vincom_da_nang',
    name: 'Premium Hall',
    roomType: 'vip',
    totalRows: 5,
    totalColumns: 6,
    hiddenCoordinates: ['A3', 'B3', 'C3', 'D3', 'E3'],
    seatTypeOverrides: {
      D5: 'couple',
      D6: 'couple',
      E5: 'couple',
      E6: 'couple',
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
        seatCode: 'A2',
        status: 'booked',
        userId: 'user_nguyen_van_a',
        bookingId: 'booking_dune_paid',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'A3',
        status: 'booked',
        userId: 'user_nguyen_van_a',
        bookingId: 'booking_dune_paid',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'B3',
        status: 'held',
        userId: 'user_tran_thi_b',
        heldAt: toIsoDate(new Date()),
        holdExpiresAt: toIsoDate(new Date(Date.now() + 5 * 60 * 1000)),
      },
      {
        seatCode: 'F10',
        status: 'booked',
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
        seatCode: 'D8',
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
        seatCode: 'C7',
        status: 'booked',
        userId: 'user_tran_thi_b',
        bookingId: 'booking_interstellar_paid',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'C8',
        status: 'booked',
        userId: 'user_tran_thi_b',
        bookingId: 'booking_interstellar_paid',
        bookedAt: toIsoDate(new Date()),
      },
    ]),
  },
  {
    id: 'showtime_dune_ba_trieu_imax_afternoon',
    movieId: 'movie_dune_part_two',
    cinemaId: 'cinema_cgv_vincom_ba_trieu',
    roomId: 'room_ba_trieu_imax',
    startTime: toIsoDate(buildShowtimeDate(0, 14, 0)),
    endTime: toIsoDate(buildShowtimeDate(0, 16, 46)),
    format: 'IMAX Laser',
    language: 'English subtitle',
    basePrice: 105000,
    seatStates: buildSeatStates(roomLookup.room_ba_trieu_imax, [
      {
        seatCode: 'B2',
        status: 'booked',
        userId: 'user_nguyen_van_a',
        bookingId: 'booking_dune_imax_paid',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'B3',
        status: 'booked',
        userId: 'user_nguyen_van_a',
        bookingId: 'booking_dune_imax_paid',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'E10',
        status: 'held',
        userId: 'user_tran_thi_b',
        heldAt: toIsoDate(new Date()),
        holdExpiresAt: toIsoDate(new Date(Date.now() + 7 * 60 * 1000)),
      },
      {
        seatCode: 'H10',
        status: 'booked',
        userId: 'user_admin',
      },
    ]),
  },
  {
    id: 'showtime_deadpool_ba_trieu_late',
    movieId: 'movie_deadpool_wolverine',
    cinemaId: 'cinema_cgv_vincom_ba_trieu',
    roomId: 'room_ba_trieu_imax',
    startTime: toIsoDate(buildShowtimeDate(1, 21, 20)),
    endTime: toIsoDate(buildShowtimeDate(1, 23, 28)),
    format: 'Dolby Atmos',
    language: 'English subtitle',
    basePrice: 115000,
    seatStates: buildSeatStates(roomLookup.room_ba_trieu_imax, [
      {
        seatCode: 'G10',
        status: 'booked',
        userId: 'user_tran_thi_b',
        bookingId: 'booking_deadpool_ba_trieu_paid',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'G11',
        status: 'booked',
        userId: 'user_tran_thi_b',
        bookingId: 'booking_deadpool_ba_trieu_paid',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'H12',
        status: 'booked',
        userId: 'user_admin',
      },
    ]),
  },
  {
    id: 'showtime_inside_out_aeon_afternoon',
    movieId: 'movie_inside_out_2',
    cinemaId: 'cinema_cgv_aeon_long_bien',
    roomId: 'room_aeon_max',
    startTime: toIsoDate(buildShowtimeDate(1, 13, 15)),
    endTime: toIsoDate(buildShowtimeDate(1, 14, 51)),
    format: '2D Family',
    language: 'Vietnamese dub',
    basePrice: 85000,
    seatStates: buildSeatStates(roomLookup.room_aeon_max, [
      {
        seatCode: 'C2',
        status: 'booked',
        userId: 'user_tran_thi_b',
        bookingId: 'booking_inside_out_paid',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'C3',
        status: 'booked',
        userId: 'user_tran_thi_b',
        bookingId: 'booking_inside_out_paid',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'A2',
        status: 'booked',
        userId: 'user_admin',
      },
    ]),
  },
  {
    id: 'showtime_godzilla_aeon_evening',
    movieId: 'movie_godzilla_x_kong',
    cinemaId: 'cinema_cgv_aeon_long_bien',
    roomId: 'room_aeon_max',
    startTime: toIsoDate(buildShowtimeDate(3, 18, 40)),
    endTime: toIsoDate(buildShowtimeDate(3, 20, 35)),
    format: 'IMAX',
    language: 'English subtitle',
    basePrice: 98000,
    seatStates: buildSeatStates(roomLookup.room_aeon_max, [
      {
        seatCode: 'D9',
        status: 'booked',
        userId: 'user_nguyen_van_a',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'D10',
        status: 'booked',
        userId: 'user_nguyen_van_a',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'F9',
        status: 'held',
        userId: 'user_tran_thi_b',
        heldAt: toIsoDate(new Date()),
        holdExpiresAt: toIsoDate(new Date(Date.now() + 8 * 60 * 1000)),
      },
    ]),
  },
  {
    id: 'showtime_kungfu_beta_matinee',
    movieId: 'movie_kung_fu_panda_4',
    cinemaId: 'cinema_beta_my_dinh',
    roomId: 'room_beta_2',
    startTime: toIsoDate(buildShowtimeDate(2, 9, 30)),
    endTime: toIsoDate(buildShowtimeDate(2, 11, 4)),
    format: '2D Family',
    language: 'Vietnamese dub',
    basePrice: 78000,
    seatStates: buildSeatStates(roomLookup.room_beta_2, [
      {
        seatCode: 'C2',
        status: 'held',
        userId: 'user_nguyen_van_a',
        heldAt: toIsoDate(new Date()),
        holdExpiresAt: toIsoDate(new Date(Date.now() + 5 * 60 * 1000)),
      },
    ]),
  },
  {
    id: 'showtime_batman_beta_evening',
    movieId: 'movie_the_batman',
    cinemaId: 'cinema_beta_my_dinh',
    roomId: 'room_beta_1',
    startTime: toIsoDate(buildShowtimeDate(2, 19, 45)),
    endTime: toIsoDate(buildShowtimeDate(2, 22, 41)),
    format: '2D Atmos',
    language: 'English subtitle',
    basePrice: 95000,
    seatStates: buildSeatStates(roomLookup.room_beta_1, [
      {
        seatCode: 'A2',
        status: 'booked',
        userId: 'user_nguyen_van_a',
        bookingId: 'booking_batman_paid',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'A3',
        status: 'booked',
        userId: 'user_nguyen_van_a',
        bookingId: 'booking_batman_paid',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'F10',
        status: 'booked',
        userId: 'user_admin',
      },
    ]),
  },
  {
    id: 'showtime_godzilla_lotte_standard',
    movieId: 'movie_godzilla_x_kong',
    cinemaId: 'cinema_lotte_govap',
    roomId: 'room_govap_standard',
    startTime: toIsoDate(buildShowtimeDate(1, 17, 30)),
    endTime: toIsoDate(buildShowtimeDate(1, 19, 25)),
    format: '2D',
    language: 'English subtitle',
    basePrice: 92000,
    seatStates: buildSeatStates(roomLookup.room_govap_standard, [
      {
        seatCode: 'B2',
        status: 'booked',
        userId: 'user_nguyen_van_a',
        bookingId: 'booking_godzilla_paid',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'B3',
        status: 'booked',
        userId: 'user_nguyen_van_a',
        bookingId: 'booking_godzilla_paid',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'D7',
        status: 'held',
        userId: 'user_tran_thi_b',
        heldAt: toIsoDate(new Date()),
        holdExpiresAt: toIsoDate(new Date(Date.now() + 8 * 60 * 1000)),
      },
    ]),
  },
  {
    id: 'showtime_deadpool_lotte_gold',
    movieId: 'movie_deadpool_wolverine',
    cinemaId: 'cinema_lotte_govap',
    roomId: 'room_govap_gold',
    startTime: toIsoDate(buildShowtimeDate(3, 21, 0)),
    endTime: toIsoDate(buildShowtimeDate(3, 23, 8)),
    format: 'Premium 2D',
    language: 'English subtitle',
    basePrice: 125000,
    seatStates: buildSeatStates(roomLookup.room_govap_gold, [
      {
        seatCode: 'C7',
        status: 'booked',
        userId: 'user_tran_thi_b',
        bookingId: 'booking_deadpool_gold_paid',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'C8',
        status: 'booked',
        userId: 'user_tran_thi_b',
        bookingId: 'booking_deadpool_gold_paid',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'A7',
        status: 'booked',
        userId: 'user_admin',
      },
    ]),
  },
  {
    id: 'showtime_dune_danang_afternoon',
    movieId: 'movie_dune_part_two',
    cinemaId: 'cinema_cgv_vincom_da_nang',
    roomId: 'room_danang_3',
    startTime: toIsoDate(buildShowtimeDate(3, 15, 45)),
    endTime: toIsoDate(buildShowtimeDate(3, 18, 31)),
    format: '2D Atmos',
    language: 'English subtitle',
    basePrice: 95000,
    seatStates: buildSeatStates(roomLookup.room_danang_3, [
      {
        seatCode: 'A4',
        status: 'held',
        userId: 'user_tran_thi_b',
        heldAt: toIsoDate(new Date()),
        holdExpiresAt: toIsoDate(new Date(Date.now() + 10 * 60 * 1000)),
      },
    ]),
  },
  {
    id: 'showtime_inside_out_danang_morning',
    movieId: 'movie_inside_out_2',
    cinemaId: 'cinema_cgv_vincom_da_nang',
    roomId: 'room_danang_3',
    startTime: toIsoDate(buildShowtimeDate(4, 10, 15)),
    endTime: toIsoDate(buildShowtimeDate(4, 11, 51)),
    format: '2D Family',
    language: 'Vietnamese dub',
    basePrice: 80000,
    seatStates: buildSeatStates(roomLookup.room_danang_3),
  },
  {
    id: 'showtime_dune_danang_premium',
    movieId: 'movie_dune_part_two',
    cinemaId: 'cinema_cgv_vincom_da_nang',
    roomId: 'room_danang_premium',
    startTime: toIsoDate(buildShowtimeDate(4, 19, 20)),
    endTime: toIsoDate(buildShowtimeDate(4, 22, 6)),
    format: 'Premium 2D',
    language: 'English subtitle',
    basePrice: 130000,
    seatStates: buildSeatStates(roomLookup.room_danang_premium, [
      {
        seatCode: 'D5',
        status: 'booked',
        userId: 'user_tran_thi_b',
        bookingId: 'booking_dune_danang_paid',
        bookedAt: toIsoDate(new Date()),
      },
      {
        seatCode: 'D6',
        status: 'booked',
        userId: 'user_tran_thi_b',
        bookingId: 'booking_dune_danang_paid',
        bookedAt: toIsoDate(new Date()),
      },
    ]),
  },
  {
    id: 'showtime_inside_out_ba_trieu_noon',
    movieId: 'movie_inside_out_2',
    cinemaId: 'cinema_cgv_vincom_ba_trieu',
    roomId: 'room_ba_trieu_1',
    startTime: toIsoDate(buildShowtimeDate(0, 11, 20)),
    endTime: toIsoDate(buildShowtimeDate(0, 12, 56)),
    format: '2D Family',
    language: 'Vietnamese dub',
    basePrice: 82000,
    seatStates: buildSeatStates(roomLookup.room_ba_trieu_1),
  },
  {
    id: 'showtime_deadpool_govap_prime',
    movieId: 'movie_deadpool_wolverine',
    cinemaId: 'cinema_lotte_govap',
    roomId: 'room_govap_gold',
    startTime: toIsoDate(buildShowtimeDate(0, 19, 35)),
    endTime: toIsoDate(buildShowtimeDate(0, 21, 43)),
    format: 'Premium 2D',
    language: 'English subtitle',
    basePrice: 118000,
    seatStates: buildSeatStates(roomLookup.room_govap_gold),
  },
  {
    id: 'showtime_dune_ba_trieu_morning',
    movieId: 'movie_dune_part_two',
    cinemaId: 'cinema_cgv_vincom_ba_trieu',
    roomId: 'room_ba_trieu_imax',
    startTime: toIsoDate(buildShowtimeDate(1, 9, 20)),
    endTime: toIsoDate(buildShowtimeDate(1, 12, 6)),
    format: 'IMAX Laser',
    language: 'English subtitle',
    basePrice: 102000,
    seatStates: buildSeatStates(roomLookup.room_ba_trieu_imax),
  },
  {
    id: 'showtime_kungfu_aeon_afternoon',
    movieId: 'movie_kung_fu_panda_4',
    cinemaId: 'cinema_cgv_aeon_long_bien',
    roomId: 'room_aeon_2',
    startTime: toIsoDate(buildShowtimeDate(1, 15, 10)),
    endTime: toIsoDate(buildShowtimeDate(1, 16, 44)),
    format: '2D Family',
    language: 'Vietnamese dub',
    basePrice: 83000,
    seatStates: buildSeatStates(roomLookup.room_aeon_2),
  },
  {
    id: 'showtime_inside_out_beta_noon',
    movieId: 'movie_inside_out_2',
    cinemaId: 'cinema_beta_my_dinh',
    roomId: 'room_beta_2',
    startTime: toIsoDate(buildShowtimeDate(2, 12, 10)),
    endTime: toIsoDate(buildShowtimeDate(2, 13, 46)),
    format: '2D Family',
    language: 'Vietnamese dub',
    basePrice: 76000,
    seatStates: buildSeatStates(roomLookup.room_beta_2),
  },
  {
    id: 'showtime_dune_beta_afternoon',
    movieId: 'movie_dune_part_two',
    cinemaId: 'cinema_beta_my_dinh',
    roomId: 'room_beta_1',
    startTime: toIsoDate(buildShowtimeDate(2, 15, 30)),
    endTime: toIsoDate(buildShowtimeDate(2, 18, 16)),
    format: '2D Atmos',
    language: 'English subtitle',
    basePrice: 90000,
    seatStates: buildSeatStates(roomLookup.room_beta_1),
  },
  {
    id: 'showtime_kungfu_danang_family',
    movieId: 'movie_kung_fu_panda_4',
    cinemaId: 'cinema_cgv_vincom_da_nang',
    roomId: 'room_danang_3',
    startTime: toIsoDate(buildShowtimeDate(3, 10, 40)),
    endTime: toIsoDate(buildShowtimeDate(3, 12, 14)),
    format: '2D Family',
    language: 'Vietnamese dub',
    basePrice: 79000,
    seatStates: buildSeatStates(roomLookup.room_danang_3),
  },
  {
    id: 'showtime_deadpool_danang_noon',
    movieId: 'movie_deadpool_wolverine',
    cinemaId: 'cinema_cgv_vincom_da_nang',
    roomId: 'room_danang_premium',
    startTime: toIsoDate(buildShowtimeDate(3, 12, 25)),
    endTime: toIsoDate(buildShowtimeDate(3, 14, 33)),
    format: 'Premium 2D',
    language: 'English subtitle',
    basePrice: 112000,
    seatStates: buildSeatStates(roomLookup.room_danang_premium),
  },
  {
    id: 'showtime_godzilla_danang_noon',
    movieId: 'movie_godzilla_x_kong',
    cinemaId: 'cinema_cgv_vincom_da_nang',
    roomId: 'room_danang_3',
    startTime: toIsoDate(buildShowtimeDate(4, 13, 5)),
    endTime: toIsoDate(buildShowtimeDate(4, 15, 0)),
    format: '2D',
    language: 'English subtitle',
    basePrice: 92000,
    seatStates: buildSeatStates(roomLookup.room_danang_3),
  },
  {
    id: 'showtime_dune_ba_trieu_sunset',
    movieId: 'movie_dune_part_two',
    cinemaId: 'cinema_cgv_vincom_ba_trieu',
    roomId: 'room_ba_trieu_imax',
    startTime: toIsoDate(buildShowtimeDate(4, 17, 5)),
    endTime: toIsoDate(buildShowtimeDate(4, 19, 51)),
    format: 'IMAX Laser',
    language: 'English subtitle',
    basePrice: 108000,
    seatStates: buildSeatStates(roomLookup.room_ba_trieu_imax),
  },
  {
    id: 'showtime_inside_out_aeon_breakfast',
    movieId: 'movie_inside_out_2',
    cinemaId: 'cinema_cgv_aeon_long_bien',
    roomId: 'room_aeon_2',
    startTime: toIsoDate(buildShowtimeDate(5, 8, 55)),
    endTime: toIsoDate(buildShowtimeDate(5, 10, 31)),
    format: '2D Family',
    language: 'Vietnamese dub',
    basePrice: 78000,
    seatStates: buildSeatStates(roomLookup.room_aeon_2),
  },
  {
    id: 'showtime_batman_govap_prime',
    movieId: 'movie_the_batman',
    cinemaId: 'cinema_lotte_govap',
    roomId: 'room_govap_standard',
    startTime: toIsoDate(buildShowtimeDate(5, 18, 45)),
    endTime: toIsoDate(buildShowtimeDate(5, 21, 41)),
    format: '2D Atmos',
    language: 'English subtitle',
    basePrice: 98000,
    seatStates: buildSeatStates(roomLookup.room_govap_standard),
  },
  {
    id: 'showtime_deadpool_ba_trieu_matinee',
    movieId: 'movie_deadpool_wolverine',
    cinemaId: 'cinema_cgv_vincom_ba_trieu',
    roomId: 'room_ba_trieu_imax',
    startTime: toIsoDate(buildShowtimeDate(6, 15, 5)),
    endTime: toIsoDate(buildShowtimeDate(6, 17, 13)),
    format: 'Dolby Atmos',
    language: 'English subtitle',
    basePrice: 116000,
    seatStates: buildSeatStates(roomLookup.room_ba_trieu_imax),
  },
  {
    id: 'showtime_godzilla_beta_evening',
    movieId: 'movie_godzilla_x_kong',
    cinemaId: 'cinema_beta_my_dinh',
    roomId: 'room_beta_1',
    startTime: toIsoDate(buildShowtimeDate(6, 19, 30)),
    endTime: toIsoDate(buildShowtimeDate(6, 21, 25)),
    format: '2D',
    language: 'English subtitle',
    basePrice: 89000,
    seatStates: buildSeatStates(roomLookup.room_beta_1),
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
      seatSnapshotFromRoom(roomLookup.room_ba_trieu_1, 'A2', 'booked'),
      seatSnapshotFromRoom(roomLookup.room_ba_trieu_1, 'A3', 'booked'),
    ].filter(Boolean) as BookingSeatSnapshot[],
    totalPrice: 180000,
    status: 'booked',
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
      seatSnapshotFromRoom(roomLookup.room_govap_gold, 'C7', 'booked'),
      seatSnapshotFromRoom(roomLookup.room_govap_gold, 'C8', 'booked'),
    ].filter(Boolean) as BookingSeatSnapshot[],
    totalPrice: 270000,
    status: 'booked',
    paymentMethod: 'vnpay_sandbox',
    createdAt: toIsoDate(new Date()),
    paidAt: toIsoDate(new Date()),
  },
  {
    id: 'booking_dune_imax_paid',
    userId: 'user_nguyen_van_a',
    movieId: 'movie_dune_part_two',
    showtimeId: 'showtime_dune_ba_trieu_imax_afternoon',
    roomId: 'room_ba_trieu_imax',
    seats: [
      seatSnapshotFromRoom(roomLookup.room_ba_trieu_imax, 'B2', 'booked'),
      seatSnapshotFromRoom(roomLookup.room_ba_trieu_imax, 'B3', 'booked'),
    ].filter(Boolean) as BookingSeatSnapshot[],
    totalPrice: 180000,
    status: 'booked',
    paymentMethod: 'mock_gateway',
    createdAt: toIsoDate(new Date()),
    paidAt: toIsoDate(new Date()),
  },
  {
    id: 'booking_deadpool_ba_trieu_paid',
    userId: 'user_tran_thi_b',
    movieId: 'movie_deadpool_wolverine',
    showtimeId: 'showtime_deadpool_ba_trieu_late',
    roomId: 'room_ba_trieu_imax',
    seats: [
      seatSnapshotFromRoom(roomLookup.room_ba_trieu_imax, 'G10', 'booked'),
      seatSnapshotFromRoom(roomLookup.room_ba_trieu_imax, 'G11', 'booked'),
    ].filter(Boolean) as BookingSeatSnapshot[],
    totalPrice: 270000,
    status: 'booked',
    paymentMethod: 'momo_sandbox',
    createdAt: toIsoDate(new Date()),
    paidAt: toIsoDate(new Date()),
  },
  {
    id: 'booking_inside_out_paid',
    userId: 'user_tran_thi_b',
    movieId: 'movie_inside_out_2',
    showtimeId: 'showtime_inside_out_aeon_afternoon',
    roomId: 'room_aeon_max',
    seats: [
      seatSnapshotFromRoom(roomLookup.room_aeon_max, 'C2', 'booked'),
      seatSnapshotFromRoom(roomLookup.room_aeon_max, 'C3', 'booked'),
    ].filter(Boolean) as BookingSeatSnapshot[],
    totalPrice: 180000,
    status: 'booked',
    paymentMethod: 'mock_gateway',
    createdAt: toIsoDate(new Date()),
    paidAt: toIsoDate(new Date()),
  },
  {
    id: 'booking_batman_paid',
    userId: 'user_nguyen_van_a',
    movieId: 'movie_the_batman',
    showtimeId: 'showtime_batman_beta_evening',
    roomId: 'room_beta_1',
    seats: [
      seatSnapshotFromRoom(roomLookup.room_beta_1, 'A2', 'booked'),
      seatSnapshotFromRoom(roomLookup.room_beta_1, 'A3', 'booked'),
    ].filter(Boolean) as BookingSeatSnapshot[],
    totalPrice: 180000,
    status: 'booked',
    paymentMethod: 'vnpay_sandbox',
    createdAt: toIsoDate(new Date()),
    paidAt: toIsoDate(new Date()),
  },
  {
    id: 'booking_godzilla_paid',
    userId: 'user_nguyen_van_a',
    movieId: 'movie_godzilla_x_kong',
    showtimeId: 'showtime_godzilla_lotte_standard',
    roomId: 'room_govap_standard',
    seats: [
      seatSnapshotFromRoom(roomLookup.room_govap_standard, 'B2', 'booked'),
      seatSnapshotFromRoom(roomLookup.room_govap_standard, 'B3', 'booked'),
    ].filter(Boolean) as BookingSeatSnapshot[],
    totalPrice: 180000,
    status: 'booked',
    paymentMethod: 'mock_gateway',
    createdAt: toIsoDate(new Date()),
    paidAt: toIsoDate(new Date()),
  },
  {
    id: 'booking_deadpool_gold_paid',
    userId: 'user_tran_thi_b',
    movieId: 'movie_deadpool_wolverine',
    showtimeId: 'showtime_deadpool_lotte_gold',
    roomId: 'room_govap_gold',
    seats: [
      seatSnapshotFromRoom(roomLookup.room_govap_gold, 'C7', 'booked'),
      seatSnapshotFromRoom(roomLookup.room_govap_gold, 'C8', 'booked'),
    ].filter(Boolean) as BookingSeatSnapshot[],
    totalPrice: 270000,
    status: 'booked',
    paymentMethod: 'momo_sandbox',
    createdAt: toIsoDate(new Date()),
    paidAt: toIsoDate(new Date()),
  },
  {
    id: 'booking_dune_danang_paid',
    userId: 'user_tran_thi_b',
    movieId: 'movie_dune_part_two',
    showtimeId: 'showtime_dune_danang_premium',
    roomId: 'room_danang_premium',
    seats: [
      seatSnapshotFromRoom(roomLookup.room_danang_premium, 'D5', 'booked'),
      seatSnapshotFromRoom(roomLookup.room_danang_premium, 'D6', 'booked'),
    ].filter(Boolean) as BookingSeatSnapshot[],
    totalPrice: 270000,
    status: 'booked',
    paymentMethod: 'vnpay_sandbox',
    createdAt: toIsoDate(new Date()),
    paidAt: toIsoDate(new Date()),
  },
];

const normalizeUserProfile = (user: BackendUser): UserProfile => ({
  id: user.id,
  name: user.name,
  displayName: user.displayName,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  role: user.role,
  dateOfBirth: user.dateOfBirth,
  gender: user.gender,
  address: user.address,
  country: user.country,
  bio: user.bio,
  notificationPreferences: user.notificationPreferences,
  preferences: user.preferences,
  createdAt: user.createdAt,
});

const buildRoomSeatId = (cell: {
  type: string;
  seatCode: string;
}) => `${cell.type}_${cell.seatCode.toUpperCase()}`;

const mapBackendMovie = (movie: BackendMovie): Movie => ({
  id: movie._id,
  title: movie.title,
  description: movie.description || '',
  duration: movie.duration,
  genre: movie.genres?.length ? movie.genres : movie.genre || [],
  poster: getMoviePosterPath(movie) || '',
  releaseDate: movie.releaseDate,
  status: movie.status,
  language: movie.language || 'Phụ đề',
  rating: movie.rating || 'T13',
  formats: movie.formats?.length ? movie.formats : ['2D'],
  featuredNote: movie.featuredNote || 'Đang mở bán trên hệ thống.',
});

const mapBackendCinema = (cinema: BackendCinema): Cinema => ({
  id: cinema._id,
  brand: cinema.brand,
  name: cinema.name,
  city: cinema.city,
  address: cinema.address,
  hotline: 'Đang cập nhật',
  features: ['Đang cập nhật tiện ích'],
  imageUrl: cinema.imageUrl,
  location: cinema.location,
});

const mapBackendRoom = (room: BackendRoom): Room => ({
  id: room._id,
  cinemaId: room.cinemaId,
  name: room.name,
  roomType: room.roomType,
  totalRows: room.totalRows,
  totalColumns: room.totalColumns,
  activeSeatCount: room.activeSeatCount,
  seatLayout: (room.seatLayout || []).map((row: any) =>
    (row.seats || []).map((seat: any) => ({
      seatCode: (seat.seatCode || '').toUpperCase(),
      type: seat.type || 'space',
      label: seat.label || '',
      status: seat.status || 'active',
      priceType: seat.priceType || 'regular',
      capacity: seat.capacity ?? (seat.type === 'couple' ? 2 : (!['empty', 'aisle', 'space'].includes(seat.type) ? 1 : 0)),
      size: seat.size ?? 1,
      rowLabel: seat.rowLabel || row.rowLabel || '',
      rowIndex: seat.rowIndex ?? 0,
      columnIndex: seat.columnIndex ?? 0,
      coupleGroupId: seat.coupleGroupId ?? null,
    })),
  ),
});

const getMinimumSeatPrice = (room: Room | undefined) => {
  if (!room) {
    return seatPriceMap.standard;
  }

  const prices = room.seatLayout
    .flat()
    .filter((cell) => !['empty', 'aisle', 'space', 'disabled'].includes(cell.type) && cell.type)
    .map((cell) => seatPriceMap[cell.type as SeatType]);

  return prices.length > 0 ? Math.min(...prices) : seatPriceMap.standard;
};

const mapBackendShowtime = (
  showtime: BackendShowtimeDetail,
  room: Room | undefined,
): Showtime => ({
  id: showtime._id,
  movieId: showtime.movie._id,
  cinemaId: showtime.cinema._id,
  roomId: showtime.room._id,
  startTime: showtime.startTime,
  endTime: showtime.endTime,
  format: showtime.movie.formats?.[0] || '2D',
  language: showtime.movie.language || 'Phụ đề',
  basePrice: getMinimumSeatPrice(room),
  seatStates: (showtime.seatLayout || []).flatMap((row) =>
    (row.seats || [])
      .filter((seat) => !['empty', 'aisle', 'space'].includes(seat.type))
      .map((seat) => ({
        seatCode: (seat.seatCode || '').toUpperCase(),
        label: seat.label || seat.seatCode || '',
        rowLabel: seat.rowLabel || row.rowLabel || '',
        rowIndex: seat.rowIndex ?? 0,
        columnIndex: seat.columnIndex ?? 0,
        type: (seat.type || 'standard') as SeatType,
        capacity: seat.capacity ?? 1,
        coupleGroupId: seat.coupleGroupId ?? null,
        status: (seat.status || 'available') as SeatReservationStatus,
        userId: seat.userId ?? null,
        bookingId: seat.bookingId ?? null,
        heldAt: seat.heldAt ?? null,
        holdExpiresAt: seat.holdExpiresAt ?? null,
        bookedAt: seat.bookedAt ?? null,
      })),
  ),
});

const buildMovieMutationPayload = (input: MovieInput): BackendMovieMutationPayload => ({
  title: input.title.trim(),
  description: input.description.trim(),
  duration: input.duration,
  genres: input.genre.map((item) => item.trim()).filter(Boolean),
  posterUrl: input.poster.trim(),
  releaseDate: input.releaseDate,
  status: input.status,
  language: input.language.trim(),
  rating: input.rating.trim(),
  formats: input.formats.map((item) => item.trim()).filter(Boolean),
  featuredNote: input.featuredNote.trim(),
});

const normalizeBackendPaymentMethod = (
  paymentMethod: BackendBooking['paymentMethod'],
): PaymentMethod | null => {
  switch (paymentMethod) {
    case 'momo_sandbox':
    case 'vnpay_sandbox':
      return paymentMethod;
    case 'MOCK_GATEWAY':
      return 'mock_gateway';
    default:
      return null;
  }
};

const mapBackendBooking = (
  booking: BackendBooking,
  currentUserId: string,
): Booking => ({
  id: booking.bookingId,
  userId: currentUserId,
  movieId: booking.movie?.id || '',
  showtimeId: booking.showtime?.id || '',
  roomId: booking.room?.id || '',
  seats: booking.seats.map((seat) => ({
    seatCode: seat.seatCode.toUpperCase(),
    seatLabel: seat.seatLabel,
    seatType: seat.seatType as SeatType,
    status: seat.status as Extract<SeatReservationStatus, 'held' | 'booked'>,
    price: seat.price,
    coupleGroupId: seat.coupleGroupId ?? null,
  })),
  totalPrice: booking.totalPrice,
  status: booking.status,
  paymentMethod: normalizeBackendPaymentMethod(booking.paymentMethod),
  createdAt: booking.createdAt,
  paidAt: booking.paidAt,
  paymentExpiresAt: booking.paymentExpiresAt,
});

const mapBackendDraftCheckout = (
  booking: BackendBooking,
  currentUserId: string,
): DraftCheckout | null => {
  if (!booking.movie || !booking.showtime || !booking.room) {
    return null;
  }

  return {
    id: booking.bookingId,
    userId: currentUserId,
    showtimeId: booking.showtime.id,
    movieId: booking.movie.id,
    roomId: booking.room.id,
    seatCodes: booking.seats.map((seat) => seat.seatCode.toUpperCase()),
    seats: booking.seats.map((seat) => ({
      seatCode: seat.seatCode.toUpperCase(),
      seatLabel: seat.seatLabel,
      seatType: seat.seatType as SeatType,
      status: seat.status as Extract<SeatReservationStatus, 'held' | 'booked'>,
      price: seat.price,
      coupleGroupId: seat.coupleGroupId ?? null,
    })),
    totalPrice: booking.totalPrice,
    heldUntil: booking.paymentExpiresAt || toIsoDate(new Date(Date.now() + 5 * 60 * 1000)),
  };
};

const sortByDateAscending = <T extends { startTime: string }>(items: T[]) =>
  [...items].sort(
    (first, second) =>
      new Date(first.startTime).getTime() - new Date(second.startTime).getTime(),
  );

const getRequestErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  if (error instanceof Error) {
    const normalizedMessage = error.message.toLowerCase();

    if (
      normalizedMessage.includes('network request failed') ||
      normalizedMessage.includes('failed to fetch')
    ) {
      return `Không kết nối được tới backend (${API_BASE_URL}). Kiểm tra backend đã chạy chưa và URL API của frontend đã đúng chưa.`;
    }

    return error.message;
  }

  return fallback;
};

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [draftCheckout, setDraftCheckout] = useState<DraftCheckout | null>(null);
  const [brands, setBrands] = useState<BackendCinemaBrand[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('bootstrapping');

  const adminUser = currentUser?.role === 'admin' ? currentUser : null;
  const isAuthenticated = authStatus === 'authenticated' && !!authToken && !!currentUser;
  const isAdmin = isAuthenticated && currentUser?.role === 'admin';

  const resetLocalDomainState = () => {
    setMovies([]);
    setCinemas([]);
    setRooms([]);
    setShowtimes([]);
    setBookings([]);
    setDraftCheckout(null);
    setBrands([]);
  };

  const clearSessionState = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setAuthStatus('unauthenticated');
    setBookings([]);
    setDraftCheckout(null);
  };

  const persistAuthToken = async (token: string, refreshToken?: string) => {
    try {
      await saveTokens({ accessToken: token, refreshToken });
    } catch (error) {
      console.warn(getRequestErrorMessage(error, 'Không thể lưu phiên đăng nhập.'));
    }
  };

  const removePersistedAuthToken = async () => {
    try {
      await clearTokens();
    } catch (error) {
      console.warn(getRequestErrorMessage(error, 'Không thể xóa phiên đăng nhập đã lưu.'));
    }
  };

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

  const mapBackendShowtimeListItem = (
    showtime: BackendShowtimeListItem,
    room: Room | undefined,
  ): Showtime => ({
    id: showtime._id,
    movieId: showtime.movie._id,
    cinemaId: showtime.cinema._id,
    roomId: showtime.room._id,
    startTime: showtime.startTime,
    endTime: showtime.endTime,
    format: showtime.movie.formats?.[0] || '2D',
    language: showtime.movie.language || 'Phụ đề',
    basePrice: getMinimumSeatPrice(room),
    seatStates: [],
  });

  const syncCatalogState = async () => {
    const [moviesResponse, cinemasResponse, roomsResponse, showtimesResponse, cinemaOptionsResponse] =
      await Promise.all([
        fetchMovies(),
        fetchCinemas(),
        fetchRooms(),
        fetchShowtimes(),
        fetchCinemaOptions(),
      ]);
    const nextMovies = moviesResponse.items.map(mapBackendMovie);
    const nextCinemas = cinemasResponse.items.map(mapBackendCinema);
    const nextBrands = cinemaOptionsResponse.brands || [];
    const nextRoomDetails = await Promise.all(
      roomsResponse.items.map((room) => fetchRoomById(room._id)),
    );
    const nextRooms = nextRoomDetails.map(mapBackendRoom);
    const roomMap = new Map(nextRooms.map((room) => [room.id, room]));
    const nextShowtimes = sortByDateAscending(
      showtimesResponse.items
        .filter((showtime) => showtime.movie && showtime.cinema && showtime.room)
        .map((showtime) =>
          mapBackendShowtimeListItem(showtime, roomMap.get(showtime.room._id)),
        ),
    );

    setMovies(nextMovies);
    setCinemas(nextCinemas);
    setRooms(nextRooms);
    setShowtimes(nextShowtimes);
    setBrands(nextBrands);
  };

  const refreshShowtime = async (showtimeId: string) => {
    try {
      const showtimeDetail = await fetchShowtimeById(showtimeId);
      let room = rooms.find((r) => r.id === showtimeDetail.room._id);
      
      if (!room) {
        const roomDetail = await fetchRoomById(showtimeDetail.room._id);
        room = mapBackendRoom(roomDetail);
      }

      const updatedShowtime = mapBackendShowtime(showtimeDetail, room);
      setShowtimes((current) =>
        current.map((st) => (st.id === showtimeId ? updatedShowtime : st)),
      );
    } catch (error) {
      console.warn('Không thể refresh thông tin ghế của suất chiếu.', error);
    }
  };

  const syncRemoteState = async (token: string, user: UserProfile) => {
    const [, bookingsResponse] = await Promise.all([
      syncCatalogState(),
      fetchMyBookings(token),
    ]);
    const nextBookings = bookingsResponse.items.map((booking) =>
      mapBackendBooking(booking, user.id),
    );

    setBookings(nextBookings);
  };

  const refreshRemoteState = async () => {
    if (!authToken || !currentUser) {
      return;
    }

    await syncRemoteState(authToken, currentUser);
  };

  const refreshData = async () => {
    try {
      if (authToken && currentUser) {
        await refreshRemoteState();
      } else {
        await loadPublicCatalogState();
      }
    } catch (error) {
      console.warn('Không thể refresh dữ liệu từ backend.', error);
    }
  };

  const loadPublicCatalogState = async () => {
    try {
      await syncCatalogState();
      setBookings([]);
      setDraftCheckout(null);
    } catch (error) {
      console.warn(getRequestErrorMessage(error, 'Không thể đồng bộ dữ liệu public từ backend.'));
      resetLocalDomainState();
    }
  };

  const authenticateWithToken = async (
    token: string,
    options: { persistSession?: boolean; refreshToken?: string } = {},
  ) => {
    const remoteUser = await fetchCurrentUser(token);
    const nextUser = normalizeUserProfile(remoteUser);
    const persistSession = options.persistSession ?? true;

    if (nextUser.role !== 'user') {
      await removePersistedAuthToken();
      clearSessionState();
      throw new Error(ADMIN_ACCOUNT_LOGIN_MESSAGE);
    }

    try {
      await syncRemoteState(token, nextUser);
    } catch (error) {
      const message = getRequestErrorMessage(
        error,
        'Không thể đồng bộ dữ liệu backend sau khi đăng nhập.',
      );
      console.warn(message);
    }

    setAuthToken(token);
    setCurrentUser(nextUser);
    setAuthStatus('authenticated');
    if (persistSession) {
      await persistAuthToken(token, options.refreshToken);
    } else {
      await removePersistedAuthToken();
    }

    return nextUser;
  };

  const login = async (input: {
    email: string;
    password: string;
    persistSession?: boolean;
  }): Promise<AuthActionResult> => {
    try {
      const response = await loginUser({
        email: input.email,
        password: input.password,
      });
      const user = await authenticateWithToken(response.accessToken, {
        persistSession: input.persistSession,
        refreshToken: response.refreshToken,
      });
      return { ok: true, user };
    } catch (error) {
      return {
        ok: false,
        error: getRequestErrorMessage(error, 'Không thể đăng nhập vào hệ thống.'),
      };
    }
  };

  const register = async (input: {
    name: string;
    email: string;
    password: string;
    persistSession?: boolean;
  }): Promise<AuthActionResult> => {
    try {
      const response = await registerUser({
        name: input.name,
        email: input.email,
        password: input.password,
      });
      const user = await authenticateWithToken(response.accessToken, {
        persistSession: input.persistSession,
        refreshToken: response.refreshToken,
      });
      return { ok: true, user };
    } catch (error) {
      return {
        ok: false,
        error: getRequestErrorMessage(error, 'Không thể tạo tài khoản mới.'),
      };
    }
  };

  const createAdminAccount = async (input: {
    name: string;
    email: string;
    password: string;
  }): Promise<CreateAdminAccountResult> => {
    if (!authToken || !currentUser || currentUser.role !== 'admin') {
      return {
        ok: false,
        error: 'Cần đăng nhập bằng tài khoản admin để tạo admin mới.',
      };
    }

    try {
      const remoteAdmin = await createAdminUser(authToken, {
        name: input.name,
        email: input.email,
        password: input.password,
      });

      return {
        ok: true,
        admin: normalizeUserProfile(remoteAdmin),
      };
    } catch (error) {
      return {
        ok: false,
        error: getRequestErrorMessage(error, 'Không thể tạo tài khoản admin mới.'),
      };
    }
  };

  const logout = async () => {
    if (authToken && draftCheckout) {
      try {
        await cancelBookingRequest(authToken, draftCheckout.id);
      } catch (error) {
        console.warn(
          getRequestErrorMessage(error, 'Không thể hủy phiên thanh toán trên backend.'),
        );
      }
    }

    // Revoke session phía backend trước khi xóa token local
    if (authToken) {
      try {
        const storedRefreshToken = await getRefreshToken();
        if (storedRefreshToken) {
          await logoutUser(authToken, storedRefreshToken);
        }
      } catch (error) {
        // Backend có thể đã hết phiên, vẫn tiếp tục xóa local
        console.warn(
          getRequestErrorMessage(error, 'Không thể revoke session trên backend.'),
        );
      }
    }

    await removePersistedAuthToken();
    clearSessionState();
    await loadPublicCatalogState();
  };

  const updateProfile = async (payload: Partial<BackendUser>): Promise<AuthActionResult> => {
    try {
      const updatedUser = await updateUserProfile(payload);
      const normalized = normalizeUserProfile(updatedUser);
      setCurrentUser(normalized);
      return { ok: true, user: normalized };
    } catch (error) {
      return {
        ok: false,
        error: getRequestErrorMessage(error, 'Không thể cập nhật thông tin cá nhân.'),
      };
    }
  };

  const updateNotificationPreferences = async (payload: any): Promise<AuthActionResult> => {
    try {
      const updatedUser = await updateUserNotificationPreferences(payload);
      const normalized = normalizeUserProfile(updatedUser);
      setCurrentUser(normalized);
      return { ok: true, user: normalized };
    } catch (error) {
      return {
        ok: false,
        error: getRequestErrorMessage(error, 'Không thể cập nhật cấu hình nhận thông báo.'),
      };
    }
  };

  const updatePreferences = async (payload: any): Promise<AuthActionResult> => {
    try {
      const updatedUser = await updateUserPreferences(payload);
      const normalized = normalizeUserProfile(updatedUser);
      setCurrentUser(normalized);
      return { ok: true, user: normalized };
    } catch (error) {
      return {
        ok: false,
        error: getRequestErrorMessage(error, 'Không thể cập nhật tuỳ chỉnh giao diện.'),
      };
    }
  };

  const deleteAccount = async (payload: any): Promise<AuthActionResult> => {
    try {
      await deleteUserAccount(payload);
      await logout();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: getRequestErrorMessage(error, 'Không thể xoá tài khoản.'),
      };
    }
  };

  const uploadAvatar = async (formData: FormData): Promise<AuthActionResult> => {
    try {
      const updatedUser = await uploadUserAvatar(formData);
      const normalized = normalizeUserProfile(updatedUser);
      setCurrentUser(normalized);
      return { ok: true, user: normalized };
    } catch (error) {
      return {
        ok: false,
        error: getRequestErrorMessage(error, 'Không thể tải ảnh đại diện lên.'),
      };
    }
  };

  const changePassword = async (payload: any): Promise<AuthActionResult> => {
    try {
      await changeUserPassword(payload);
      await logout();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: getRequestErrorMessage(error, 'Không thể thay đổi mật khẩu.'),
      };
    }
  };

  useEffect(() => {
    let active = true;

    const bootstrapAuthState = async () => {
      try {
        const storedToken = await getAccessToken();

        if (!active) {
          return;
        }

        if (!storedToken) {
          clearSessionState();
          await loadPublicCatalogState();
          return;
        }

        try {
          const storedRefreshToken = await getRefreshToken();
          await authenticateWithToken(storedToken, { refreshToken: storedRefreshToken ?? undefined });
        } catch (error) {
          console.warn(getRequestErrorMessage(error, 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.'));
          await removePersistedAuthToken();

          if (!active) {
            return;
          }

          clearSessionState();
          await loadPublicCatalogState();
        }
      } catch (error) {
        console.warn(getRequestErrorMessage(error, 'Không thể khởi tạo phiên đăng nhập đã lưu.'));

        if (active) {
          clearSessionState();
          await loadPublicCatalogState();
        }
      }
    };

    bootstrapAuthState();

    return () => {
      active = false;
    };
  }, []);

  const upsertMovie = async (input: MovieInput): Promise<MovieMutationResult> => {
    if (!authToken || !currentUser || currentUser.role !== 'admin') {
      return {
        ok: false,
        error: 'Cần đăng nhập bằng tài khoản admin để lưu phim.',
      };
    }

    try {
      const remoteMovie = input.id
        ? await updateMovieRequest(authToken, input.id, buildMovieMutationPayload(input))
        : await createMovieRequest(authToken, buildMovieMutationPayload(input));

      await refreshRemoteState();

      return {
        ok: true,
        movie: mapBackendMovie(remoteMovie),
      };
    } catch (error) {
      return {
        ok: false,
        error: getRequestErrorMessage(error, 'Không thể lưu phim.'),
      };
    }
  };

  const deleteMovie = async (movieId: string): Promise<DeleteMovieResult> => {
    if (!authToken || !currentUser || currentUser.role !== 'admin') {
      return {
        ok: false,
        error: 'Cần đăng nhập bằng tài khoản admin để xóa phim.',
      };
    }

    try {
      await deleteMovieRequest(authToken, movieId);
      await refreshRemoteState();

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: getRequestErrorMessage(error, 'Không thể xóa phim.'),
      };
    }
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

  const upsertRoom = async (input: RoomInput): Promise<RoomMutationResult> => {
    if (!authToken || !currentUser || currentUser.role !== 'admin') {
      return {
        ok: false,
        error: 'Cần đăng nhập bằng tài khoản admin để lưu phòng chiếu.',
      };
    }

    const currentRoom = input.id ? rooms.find((room) => room.id === input.id) : null;
    const hiddenCoordinates = currentRoom ? getHiddenCoordinatesFromRoom(currentRoom) : [];

    try {
      const remoteRoom = input.id
        ? await updateRoomRequest(authToken, input.id, {
            cinemaId: input.cinemaId,
            name: input.name,
            roomType: input.roomType as 'standard' | 'vip' | 'gold' | 'imax',
            totalRows: input.totalRows,
            totalColumns: input.totalColumns,
            hiddenCoordinates,
          })
        : await createRoomRequest(authToken, {
            cinemaId: input.cinemaId,
            name: input.name,
            roomType: input.roomType as 'standard' | 'vip' | 'gold' | 'imax',
            totalRows: input.totalRows,
            totalColumns: input.totalColumns,
            hiddenCoordinates,
          });

      await refreshRemoteState();

      return {
        ok: true,
        room: mapBackendRoom(remoteRoom),
      };
    } catch (error) {
      return {
        ok: false,
        error: getRequestErrorMessage(error, 'Không thể lưu phòng chiếu.'),
      };
    }
  };

  const deleteRoom = async (roomId: string): Promise<DeleteRoomResult> => {
    if (!authToken || !currentUser || currentUser.role !== 'admin') {
      return {
        ok: false,
        error: 'Cần đăng nhập bằng tài khoản admin để xóa phòng chiếu.',
      };
    }

    try {
      await deleteRoomRequest(authToken, roomId);
      await refreshRemoteState();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: getRequestErrorMessage(error, 'Không thể xóa phòng chiếu.'),
      };
    }
  };

  const createShowtimeSchedule = async (
    input: ShowtimeScheduleInput,
  ): Promise<ShowtimeScheduleMutationResult> => {
    if (!authToken || !currentUser || currentUser.role !== 'admin') {
      return {
        ok: false,
        error: 'Cần đăng nhập bằng tài khoản admin để tạo suất chiếu.',
      };
    }

    try {
      const response = await createShowtimeScheduleRequest(authToken, input);
      await refreshRemoteState();

      return {
        ok: true,
        createdCount: response.createdCount,
      };
    } catch (error) {
      return {
        ok: false,
        error: getRequestErrorMessage(error, 'Không thể tạo lịch suất chiếu.'),
      };
    }
  };

  const saveRoomLayout = async ({
    roomId,
    totalRows,
    totalColumns,
    hiddenCoordinates,
  }: SaveRoomLayoutInput): Promise<RoomMutationResult> => {
    if (!authToken || !currentUser || currentUser.role !== 'admin') {
      return {
        ok: false,
        error: 'Cần đăng nhập bằng tài khoản admin để lưu sơ đồ ghế.',
      };
    }

    const room = rooms.find((item) => item.id === roomId);

    if (!room) {
      return {
        ok: false,
        error: 'Không tìm thấy phòng chiếu để lưu.',
      };
    }

    try {
      const remoteRoom = await updateRoomRequest(authToken, roomId, {
        cinemaId: room.cinemaId,
        name: room.name,
        roomType: room.roomType as 'standard' | 'vip' | 'gold' | 'imax',
        totalRows,
        totalColumns,
        hiddenCoordinates,
      });

      clearDraftIfMatchesShowtime(
        showtimes.find((showtime) => showtime.roomId === roomId)?.id ?? '',
      );
      await refreshRemoteState();

      return {
        ok: true,
        room: mapBackendRoom(remoteRoom),
      };
    } catch (error) {
      return {
        ok: false,
        error: getRequestErrorMessage(error, 'Không thể lưu sơ đồ ghế.'),
      };
    }
  };

  const releaseDraftCheckout = async () => {
    if (!draftCheckout) {
      return;
    }

    if (authToken) {
      try {
        await cancelBookingRequest(authToken, draftCheckout.id);
        setDraftCheckout(null);
        await refreshRemoteState();
        return;
      } catch (error) {
        console.warn(getRequestErrorMessage(error, 'Không thể hủy phiên thanh toán.'));
      }
    }

    const seatCodeSet = new Set(
      draftCheckout.seatCodes.map((item) => item.toUpperCase()),
    );

    setShowtimes((current) =>
      current.map((showtime) => {
        if (showtime.id !== draftCheckout.showtimeId) {
          return showtime;
        }

        return {
          ...showtime,
          seatStates: showtime.seatStates.map((seat) =>
            seatCodeSet.has(seat.seatCode.toUpperCase()) &&
            seat.status === 'held' &&
            seat.userId === draftCheckout.userId
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

  const startCheckout = async (showtimeId: string, seatCodes: string[]) => {
    if (!currentUser) {
      return {
        ok: false,
        error: 'Cần đăng nhập để đặt vé.',
      };
    }

    const activeUser = currentUser;
    const showtime = showtimes.find((item) => item.id === showtimeId);
    const room = rooms.find((item) => item.id === showtime?.roomId);

    if (!showtime || !room) {
      return {
        ok: false,
        error: 'Không tìm thấy suất chiếu hoặc phòng chiếu.',
      };
    }

    if (seatCodes.length === 0) {
      return {
        ok: false,
        error: 'Cần chọn ít nhất một ghế để tiếp tục.',
      };
    }

    const selectedSet = new Set(seatCodes.map((item) => item.toUpperCase()));
    const unavailableSeat = showtime.seatStates.find(
      (seat) =>
        selectedSet.has(seat.seatCode.toUpperCase()) &&
        seat.status !== 'available',
    );

    if (unavailableSeat) {
      return {
        ok: false,
        error: `Ghế ${unavailableSeat.label} hiện không khả dụng.`,
      };
    }

    const edgeSeatConflict = getEdgeSeatSelectionConflict(
      room.seatLayout,
      showtime.seatStates,
      seatCodes,
    );

    if (edgeSeatConflict) {
      return {
        ok: false,
        error: edgeSeatConflict.message,
      };
    }

    if (draftCheckout) {
      await releaseDraftCheckout();
    }

    if (authToken) {
      try {
        const remoteBooking = await createBookingRequest(authToken, {
          showtimeId,
          seatCodes,
        });
        const remoteDraftCheckout = mapBackendDraftCheckout(remoteBooking, activeUser.id);

        if (!remoteDraftCheckout) {
          return {
            ok: false,
            error: 'Không thể tạo dữ liệu thanh toán từ backend.',
          };
        }

        setDraftCheckout(remoteDraftCheckout);

        try {
          await refreshRemoteState();
        } catch (error) {
          console.warn(getRequestErrorMessage(error, 'Không thể đồng bộ lại dữ liệu.'));
        }

        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          error: getRequestErrorMessage(error, 'Không thể khởi tạo phiên thanh toán.'),
        };
      }
    }

    const heldUntil = toIsoDate(new Date(Date.now() + 5 * 60 * 1000));

    setShowtimes((current) =>
      current.map((item) =>
        item.id === showtimeId
          ? {
              ...item,
              seatStates: item.seatStates.map((seat) =>
                selectedSet.has(seat.seatCode.toUpperCase())
                  ? {
                      ...seat,
                      status: 'held',
                      userId: activeUser.id,
                      heldAt: toIsoDate(new Date()),
                      holdExpiresAt: heldUntil,
                    }
                  : seat,
              ),
            }
          : item,
      ),
    );

    const seats = seatCodes
      .map((code) => seatSnapshotFromRoom(room, code, 'held'))
      .filter(Boolean) as BookingSeatSnapshot[];

    const movie = movies.find((item) => item.id === showtime.movieId);

    setDraftCheckout({
      id: makeId('draft'),
      userId: activeUser.id,
      showtimeId,
      movieId: movie?.id ?? '',
      roomId: room.id,
      seatCodes: seatCodes.map((item) => item.toUpperCase()),
      seats,
      totalPrice: seats.reduce((sum, seat) => sum + seat.price, 0),
      heldUntil,
    });

    return { ok: true };
  };

  const confirmDraftCheckout = async (paymentMethod: PaymentMethod) => {
    if (!draftCheckout) {
      return null;
    }

    if (!currentUser) {
      return null;
    }

    const activeUser = currentUser;

    if (authToken) {
      const latestBill = await fetchPaymentBill(authToken, draftCheckout.id);
      const remotePaymentMethod =
        paymentMethod === 'vnpay_sandbox' ? 'vnpay_sandbox' : 'momo_sandbox';

      await payBookingBill(authToken, draftCheckout.id, {
        paymentMethod: remotePaymentMethod,
        billId: latestBill.paymentAuth.billId,
        paidAmount: latestBill.paymentAuth.paidAmount,
        currency: latestBill.paymentAuth.currency,
        issuedAt: latestBill.paymentAuth.issuedAt,
        expiresAt: latestBill.paymentAuth.expiresAt,
        signature: latestBill.paymentAuth.signature,
      });

      const confirmedBooking = await fetchMyBookingById(authToken, draftCheckout.id);
      setDraftCheckout(null);

      try {
        await refreshRemoteState();
      } catch (error) {
        console.warn(getRequestErrorMessage(error, 'Không thể đồng bộ lại dữ liệu.'));
      }

      return mapBackendBooking(confirmedBooking, activeUser.id);
    }

    const bookingId = makeId('booking');
    const seatCodeSet = new Set(
      draftCheckout.seatCodes.map((item) => item.toUpperCase()),
    );
    const paidAt = toIsoDate(new Date());

    setShowtimes((current) =>
      current.map((showtime) =>
        showtime.id === draftCheckout.showtimeId
          ? {
              ...showtime,
              seatStates: showtime.seatStates.map((seat) =>
                seatCodeSet.has(seat.seatCode.toUpperCase())
                  ? {
                      ...seat,
                      status: 'booked',
                      bookingId,
                      userId: activeUser.id,
                      bookedAt: paidAt,
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
      userId: activeUser.id,
      movieId: draftCheckout.movieId,
      showtimeId: draftCheckout.showtimeId,
      roomId: draftCheckout.roomId,
      seats: draftCheckout.seats.map((seat) => ({ ...seat, status: 'booked' as const })),
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
    authToken,
    authStatus,
    isAuthenticated,
    isAdmin,
    users: currentUser ? [currentUser] : [],
    movies,
    cinemas,
    rooms,
    showtimes: sortByDateAscending(showtimes),
    bookings: [...bookings].sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    ),
    draftCheckout,
    brands,
    login,
    register,
    createAdminAccount,
    logout,
    updateProfile,
    updateNotificationPreferences,
    updatePreferences,
    deleteAccount,
    uploadAvatar,
    changePassword,
    upsertMovie,
    deleteMovie,
    upsertCinema,
    deleteCinema,
    upsertRoom,
    deleteRoom,
    createShowtimeSchedule,
    saveRoomLayout,
    startCheckout,
    releaseDraftCheckout,
    confirmDraftCheckout,
    refreshShowtime,
    refreshData,
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
