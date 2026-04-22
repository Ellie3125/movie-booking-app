import { Platform } from 'react-native';

type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

type ApiErrorDetail = {
  path: string;
  message: string;
};

type ApiErrorResponse = {
  success: false;
  message: string;
  error?: string;
  details?: ApiErrorDetail[];
};

export class ApiRequestError extends Error {
  statusCode: number;
  code: string;
  details: ApiErrorDetail[];

  constructor(
    message: string,
    statusCode: number,
    code = 'API_REQUEST_FAILED',
    details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export type BackendUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: string;
  updatedAt?: string;
};

export type BackendAuthResponse = {
  user: BackendUser;
  accessToken: string;
  refreshToken?: string;
};

export type BackendMovie = {
  _id: string;
  title: string;
  description: string;
  duration: number;
  genre: string[];
  poster: string;
  releaseDate: string;
  status: 'now_showing' | 'coming_soon' | 'ended';
};

export type BackendCinema = {
  _id: string;
  brand: string;
  name: string;
  city: string;
  address: string;
};

export type BackendRoomSeat = {
  cellType: 'seat' | 'empty';
  coordinate: {
    rowIndex: number;
    columnIndex: number;
    coordinateLabel: string;
  };
  seatLabel: string | null;
  seatType: 'standard' | 'vip' | 'couple' | 'accessible' | null;
  priceModifier: number;
};

export type BackendRoom = {
  _id: string;
  cinemaId: string;
  name: string;
  screenLabel: string;
  totalRows: number;
  totalColumns: number;
  activeSeatCount: number;
  seatLayout: BackendRoomSeat[][];
};

export type BackendRoomSummary = Omit<BackendRoom, 'seatLayout'>;

export type BackendRoomMutationPayload = {
  cinemaId: string;
  name: string;
  screenLabel: string;
  totalRows: number;
  totalColumns: number;
  hiddenCoordinates: string[];
};

export type BackendShowtimeSeatState = {
  seatCoordinate: string;
  seatLabel: string;
  seatType: 'standard' | 'vip' | 'couple' | 'accessible';
  status: 'available' | 'held' | 'reserved' | 'paid';
  userId: string | null;
  bookingId: string | null;
  heldAt: string | null;
  holdExpiresAt: string | null;
  paidAt: string | null;
};

export type BackendShowtimeListItem = {
  _id: string;
  movie: {
    _id: string;
    title: string;
    duration: number;
    poster: string;
    status: 'now_showing' | 'coming_soon' | 'ended';
  };
  cinema: {
    _id: string;
    name: string;
    brand: string;
    city: string;
    address: string;
  };
  room: {
    _id: string;
    name: string;
    screenLabel: string;
    totalColumns: number;
  };
  startTime: string;
  endTime: string;
};

export type BackendShowtimeDetail = BackendShowtimeListItem & {
  seatStates: BackendShowtimeSeatState[];
};

export type BackendBookingSeat = {
  seatCoordinate: string;
  seatLabel: string;
  seatType: 'standard' | 'vip' | 'couple' | 'accessible';
  status: 'held' | 'paid';
  price: number;
};

export type BackendBooking = {
  bookingId: string;
  bookingCode: string | null;
  status: 'held' | 'paid' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'expired';
  paymentMethod: 'cash' | 'momo_sandbox' | 'vnpay_sandbox' | null;
  currency: string;
  totalPrice: number;
  ticketCount: number;
  createdAt: string;
  paidAt: string | null;
  paymentExpiresAt: string | null;
  movie: {
    id: string;
    title: string;
    duration: number;
    poster: string;
    status: 'now_showing' | 'coming_soon' | 'ended';
  } | null;
  cinema: {
    id: string;
    name: string;
    brand: string;
    city: string;
    address: string;
  } | null;
  room: {
    id: string;
    name: string;
    screenLabel: string;
    totalRows: number;
    totalColumns: number;
  } | null;
  showtime: {
    id: string;
    startTime: string;
    endTime: string;
  } | null;
  seats: BackendBookingSeat[];
};

export type BackendBill = {
  bookingId: string;
  bookingCode: string | null;
  movie: {
    id: string;
    title: string;
    duration: number;
    poster: string;
    status: 'now_showing' | 'coming_soon' | 'ended';
  } | null;
  cinema: {
    id: string;
    name: string;
    brand: string;
    city: string;
    address: string;
  } | null;
  room: {
    id: string;
    name: string;
    screenLabel: string;
    totalRows: number;
    totalColumns: number;
  } | null;
  showtime: {
    id: string;
    startTime: string;
    endTime: string;
  } | null;
  seats: BackendBookingSeat[];
  ticketCount: number;
  totalPrice: number;
  currency: string;
  status: 'held' | 'paid' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'expired';
  paymentExpiresAt: string | null;
  paymentAuth: {
    algorithm: 'HMAC-SHA256';
    fields: string[];
    billId: string;
    paidAmount: number;
    currency: string;
    issuedAt: number;
    expiresAt: number;
    rawData: string;
    signature: string;
  };
};

export type BackendPaymentResult = {
  bookingId: string;
  bookingCode: string | null;
  transactionCode: string;
  status: 'held' | 'paid' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'expired';
  paymentMethod: 'cash' | 'momo_sandbox' | 'vnpay_sandbox';
  paidAmount: number;
  currency: string;
  paidAt: string;
  ticketCount: number;
  tickets: Array<{
    ticketCode: string;
    status: string;
    seat: {
      seatCoordinate: string;
      seatLabel: string;
      seatType: 'standard' | 'vip' | 'couple' | 'accessible';
    };
    price: number;
    issuedAt: string;
  }>;
};

export type BackendTicket = {
  ticketId: string;
  ticketCode: string;
  status: string;
  price: number;
  issuedAt: string;
  seat: {
    seatCoordinate: string;
    seatLabel: string;
    seatType: 'standard' | 'vip' | 'couple' | 'accessible';
  };
  booking: {
    id: string;
    bookingCode: string | null;
    status: 'held' | 'paid' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'expired';
    paymentMethod: 'cash' | 'momo_sandbox' | 'vnpay_sandbox' | null;
    totalPrice: number;
    currency: string;
    paidAt: string | null;
    createdAt: string;
  } | null;
  movie: {
    id: string;
    title: string;
    duration: number;
    poster: string;
    status: 'now_showing' | 'coming_soon' | 'ended';
  } | null;
  cinema: {
    id: string;
    name: string;
    brand: string;
    city: string;
    address: string;
  } | null;
  room: {
    id: string;
    name: string;
    screenLabel: string;
    totalRows: number;
    totalColumns: number;
  } | null;
  showtime: {
    id: string;
    startTime: string;
    endTime: string;
  } | null;
};

const resolveBaseUrl = () => {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '');
  }

  return Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api/v1'
    : 'http://localhost:5000/api/v1';
};

const API_BASE_URL = resolveBaseUrl();

async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const responseBody = (await response.json()) as ApiSuccessResponse<T> | ApiErrorResponse;

  if (!response.ok || !responseBody.success) {
    throw new ApiRequestError(
      responseBody.message || 'API request failed',
      response.status,
      'error' in responseBody && responseBody.error
        ? responseBody.error
        : 'API_REQUEST_FAILED',
      'details' in responseBody && Array.isArray(responseBody.details)
        ? responseBody.details
        : [],
    );
  }

  return responseBody.data;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return apiRequest<BackendAuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: { email: string; password: string }) {
  return apiRequest<BackendAuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchCurrentUser(token: string) {
  return apiRequest<BackendUser>('/auth/me', { token });
}

export async function fetchMovies() {
  return apiRequest<{ items: BackendMovie[]; total: number }>('/movies');
}

export async function fetchCinemas() {
  return apiRequest<{ items: BackendCinema[]; total: number }>('/cinemas');
}

export async function fetchRooms() {
  return apiRequest<{ items: BackendRoomSummary[]; total: number }>('/rooms');
}

export async function fetchRoomById(roomId: string) {
  return apiRequest<BackendRoom>(`/rooms/${roomId}`);
}

export async function createRoom(token: string, payload: BackendRoomMutationPayload) {
  return apiRequest<BackendRoom>('/rooms', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateRoom(
  token: string,
  roomId: string,
  payload: BackendRoomMutationPayload,
) {
  return apiRequest<BackendRoom>(`/rooms/${roomId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteRoom(token: string, roomId: string) {
  return apiRequest<null>(`/rooms/${roomId}`, {
    method: 'DELETE',
    token,
  });
}

export async function fetchShowtimes() {
  return apiRequest<{ items: BackendShowtimeListItem[]; total: number }>('/showtimes');
}

export async function fetchShowtimeById(showtimeId: string) {
  return apiRequest<BackendShowtimeDetail>(`/showtimes/${showtimeId}`);
}

export async function fetchMyBookings(token: string) {
  return apiRequest<{ items: BackendBooking[]; total: number }>('/bookings', {
    token,
  });
}

export async function fetchMyBookingById(token: string, bookingId: string) {
  return apiRequest<BackendBooking>(`/bookings/${bookingId}`, {
    token,
  });
}

export async function createBooking(
  token: string,
  payload: { showtimeId: string; seatCoordinates: string[] },
) {
  return apiRequest<BackendBooking>('/bookings', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function cancelBooking(token: string, bookingId: string) {
  return apiRequest<BackendBooking>(`/bookings/${bookingId}/cancel`, {
    method: 'POST',
    token,
  });
}

export async function fetchPaymentBill(token: string, bookingId: string) {
  return apiRequest<BackendBill>(`/payments/bills/${bookingId}`, {
    token,
  });
}

export async function payBookingBill(
  token: string,
  bookingId: string,
  payload: {
    paymentMethod: 'cash' | 'momo_sandbox' | 'vnpay_sandbox';
    billId: string;
    paidAmount: number;
    currency: string;
    issuedAt: number;
    expiresAt: number;
    signature: string;
  },
) {
  return apiRequest<BackendPaymentResult>(`/payments/bills/${bookingId}/pay`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function fetchMyTickets(token: string) {
  return apiRequest<{ items: BackendTicket[]; total: number }>('/tickets', {
    token,
  });
}

export { API_BASE_URL };
