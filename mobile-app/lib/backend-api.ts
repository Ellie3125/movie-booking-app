import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { clearTokens, getAccessToken, getRefreshToken, saveAccessToken, saveTokens } from './tokenStorage';

// ─── URL Resolution ───────────────────────────────────────────────────────────

const resolveExpoHost = (): string | null => {
  const rawHostUri = Constants.expoConfig?.hostUri ?? Constants.linkingUri ?? '';
  const normalizedHostUri = rawHostUri.replace(/^[a-z]+:\/\//i, '');
  const host = normalizedHostUri.split('/')[0]?.split(':')[0]?.trim();

  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return null;
  }

  return host;
};

const resolveBaseUrl = (): string => {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '');
  }

  const expoHost = resolveExpoHost();

  if (expoHost) {
    return `http://${expoHost}:5000/api/v1`;
  }

  return Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api/v1'
    : 'http://127.0.0.1:5000/api/v1';
};

export const API_BASE_URL = resolveBaseUrl();

// ─── Types ────────────────────────────────────────────────────────────────────

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
  genres?: string[];
  genre?: string[];
  posterUrl?: string;
  poster_path?: string;
  posterPath?: string;
  poster?: string;
  releaseDate: string;
  status: 'now_showing' | 'coming_soon' | 'ended';
  language?: string;
  rating?: string;
  formats?: string[];
  featuredNote?: string;
};

export type BackendMovieMutationPayload = {
  title: string;
  description: string;
  duration: number;
  genres: string[];
  posterUrl: string;
  releaseDate: string;
  status: 'now_showing' | 'coming_soon' | 'ended';
  language: string;
  rating: string;
  formats: string[];
  featuredNote: string;
};

export type BackendCinema = {
  _id: string;
  brand: string;
  name: string;
  city: string;
  address: string;
  imageUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  location?: {
    type: string;
    coordinates: number[];
  };
};

export type BackendCinemaBrand = {
  _id: string;
  name: string;
  code: string;
  logo: string;
  description?: string;
  status: string;
};

export type BackendAvatarOption = {
  name: string;
  url: string;
};

export type BackendNearbyCinema = BackendCinema & {
  distanceKm: number;
};

export type BackendRoomSeat = {
  cellType: 'seat' | 'space';
  coordinate: {
    rowIndex: number;
    columnIndex: number;
    coordinateLabel: string;
  };
  seatLabel: string | null;
  seatType: 'standard' | 'couple' | null;
  priceModifier: number;
};

export type BackendRoom = {
  _id: string;
  cinemaId: string;
  name: string;
  roomType: 'standard' | 'vip' | 'gold' | 'imax';
  totalRows: number;
  totalColumns: number;
  activeSeatCount: number;
  seatLayout: any[]; // Updated to any[] to handle row-based structure
};

export type BackendRoomSummary = Omit<BackendRoom, 'seatLayout'>;

export type BackendRoomMutationPayload = {
  cinemaId: string;
  name: string;
  roomType: 'standard' | 'vip' | 'gold' | 'imax';
  totalRows: number;
  totalColumns: number;
  hiddenCoordinates: string[];
};

export type BackendShowtimeSeatState = {
  seatCode: string;
  label: string;
  rowLabel: string;
  rowIndex: number;
  columnIndex: number;
  type: 'regular' | 'vip' | 'couple' | 'empty' | 'aisle' | 'disabled' | 'space';
  capacity: number;
  coupleGroupId: string | null;
  status: 'available' | 'held' | 'booked' | 'disabled' | 'active';
  priceType?: string;
  size?: number;
  userId: string | null;
  bookingId: string | null;
  heldAt: string | null;
  holdExpiresAt: string | null;
  bookedAt: string | null;
};

export type BackendShowtimeSeatRow = {
  rowLabel: string;
  seats: BackendShowtimeSeatState[];
};

export type BackendShowtimeListItem = {
  _id: string;
  movie: {
    _id: string;
    title: string;
    duration: number;
    posterUrl?: string;
    poster_path?: string;
    posterPath?: string;
    poster?: string;
    status: 'now_showing' | 'coming_soon' | 'ended';
    language?: string;
    formats?: string[];
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
    roomType: 'standard' | 'vip' | 'gold' | 'imax';
    totalColumns: number;
  };
  startTime: string;
  endTime: string;
};

export type BackendShowtimeDetail = BackendShowtimeListItem & {
  seatLayout: BackendShowtimeSeatRow[];
};

export type BackendShowtimeSchedulePayload = {
  movieId: string;
  cinemaId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  showsPerDay: number;
};

export type BackendShowtimeScheduleResult = {
  createdCount: number;
  items: BackendShowtimeDetail[];
};

export type BackendBookingSeat = {
  seatCode: string;
  seatLabel: string;
  seatType: 'standard' | 'vip' | 'couple';
  status: 'held' | 'paid';
  price: number;
  coupleGroupId: string | null;
};

export type BackendBooking = {
  bookingId: string;
  bookingCode: string | null;
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'expired';
  paymentStatus: 'pending' | 'success' | 'failed' | 'expired' | 'refunded';
  paymentMethod:
    | 'momo_sandbox'
    | 'vnpay_sandbox'
    | 'MOMO_SANDBOX'
    | 'VNPAY_SANDBOX'
    | 'MOCK_GATEWAY'
    | null;
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
    posterUrl?: string;
    poster_path?: string;
    posterPath?: string;
    poster?: string;
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
    roomType: 'standard' | 'vip' | 'gold' | 'imax';
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
  seats: BackendBookingSeat[];
  amount: number;
  currency: string;
  expiredAt: string | null;
};

export type BackendPaymentSession = {
  bookingId: string;
  paymentId: string;
  amount: number;
  currency: string;
  expiredAt: string | null;
  paymentUrl: string;
};

export type BackendTicket = {
  ticketId: string;
  ticketCode: string;
  status: string;
  price: number;
  issuedAt: string;
  seat: {
    seatCode: string;
    seatLabel: string;
    seatType: 'standard' | 'vip' | 'couple';
    coupleGroupId: string | null;
  };
  booking: {
    id: string;
    bookingCode: string | null;
    status: 'pending_payment' | 'confirmed' | 'cancelled' | 'expired';
    paymentStatus: 'pending' | 'success' | 'failed' | 'expired' | 'refunded';
    paymentMethod:
      | 'momo_sandbox'
      | 'vnpay_sandbox'
      | 'MOMO_SANDBOX'
      | 'VNPAY_SANDBOX'
      | 'MOCK_GATEWAY'
      | null;
    totalPrice: number;
    currency: string;
    paidAt: string | null;
    createdAt: string;
  } | null;
  movie: {
    id: string;
    title: string;
    duration: number;
    posterUrl?: string;
    poster_path?: string;
    posterPath?: string;
    poster?: string;
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
    roomType: 'standard' | 'vip' | 'gold' | 'imax';
    totalRows: number;
    totalColumns: number;
  } | null;
  showtime: {
    id: string;
    startTime: string;
    endTime: string;
  } | null;
};

// ─── Axios Instance ───────────────────────────────────────────────────────────

// Flag để tránh loop vô hạn khi đang refresh
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const notifyRefreshSubscribers = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: gắn accessToken vào header
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: auto-refresh khi 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Chỉ retry nếu 401, chưa retry trước đó, và không phải chính endpoint refresh-token
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh-token');
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
      if (isRefreshing) {
        // Đang refresh → queue request, chờ token mới
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            if (originalRequest.headers) {
              (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Gọi endpoint refresh-token với axios instance gốc (không interceptor)
        const refreshResponse = await axios.post<ApiSuccessResponse<BackendAuthResponse>>(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          refreshResponse.data.data;

        await saveTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        notifyRefreshSubscribers(newAccessToken);

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch {
        // Refresh thất bại → xóa token, để UI xử lý
        await clearTokens();
        notifyRefreshSubscribers('');
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Chuyển lỗi axios thành ApiRequestError
    if (error.response) {
      const body = error.response.data as ApiErrorResponse;
      throw new ApiRequestError(
        body?.message || 'API request failed',
        error.response.status,
        body?.error || 'API_REQUEST_FAILED',
        Array.isArray(body?.details) ? body.details : [],
      );
    }

    return Promise.reject(error);
  },
);

// ─── Request Helper ───────────────────────────────────────────────────────────

async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string; // backward-compat: token override (admin-web pattern)
    params?: Record<string, string | number>;
  } = {},
): Promise<T> {
  const config: AxiosRequestConfig = {
    url: path,
    method: (options.method ?? 'GET') as AxiosRequestConfig['method'],
    params: options.params,
  };

  if (options.body !== undefined) {
    config.data = options.body;
  }

  // Nếu caller truyền token tường minh (vd admin-web pattern), override
  if (options.token) {
    config.headers = { Authorization: `Bearer ${options.token}` };
  }

  const response = await apiClient.request<ApiSuccessResponse<T>>(config);
  return response.data.data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return apiRequest<BackendAuthResponse>('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export async function createAdminUser(
  token: string,
  payload: {
    name: string;
    email: string;
    password: string;
  },
) {
  return apiRequest<BackendUser>('/auth/admins', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function loginUser(payload: { email: string; password: string }) {
  return apiRequest<BackendAuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export async function fetchCurrentUser(token: string) {
  return apiRequest<BackendUser>('/auth/me', { token });
}

export async function refreshAuthToken(refreshToken: string) {
  return apiRequest<BackendAuthResponse>('/auth/refresh-token', {
    method: 'POST',
    body: { refreshToken },
  });
}

export async function logoutUser(token: string, refreshToken: string) {
  return apiRequest<{ loggedOut: boolean }>('/auth/logout', {
    method: 'POST',
    token,
    body: { refreshToken },
  });
}

export async function updateUserProfile(payload: Partial<BackendUser>) {
  return apiRequest<BackendUser>('/auth/update-profile', {
    method: 'PATCH',
    body: payload,
  });
}

export async function updateUserNotificationPreferences(payload: any) {
  return apiRequest<BackendUser>('/auth/update-notifications', {
    method: 'PATCH',
    body: payload,
  });
}

export async function updateUserPreferences(payload: any) {
  return apiRequest<BackendUser>('/auth/update-preferences', {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteUserAccount(payload: any) {
  return apiRequest<{ message: string }>('/auth/delete-account', {
    method: 'DELETE',
    body: payload,
  });
}

export async function changeUserPassword(payload: any) {
  return apiRequest<{ message: string }>('/auth/change-password', {
    method: 'PATCH',
    body: payload,
  });
}

export async function uploadUserAvatar(formData: FormData) {
  const response = await apiClient.post<ApiSuccessResponse<BackendUser>>('/auth/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
}

// ─── Movies ───────────────────────────────────────────────────────────────────

export async function fetchMovies() {
  return apiRequest<{ items: BackendMovie[]; total: number }>('/movies');
}

export async function createMovie(token: string, payload: BackendMovieMutationPayload) {
  return apiRequest<BackendMovie>('/movies', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updateMovie(
  token: string,
  movieId: string,
  payload: BackendMovieMutationPayload,
) {
  return apiRequest<BackendMovie>(`/movies/${movieId}`, {
    method: 'PUT',
    token,
    body: payload,
  });
}

export async function deleteMovie(token: string, movieId: string) {
  return apiRequest<null>(`/movies/${movieId}`, {
    method: 'DELETE',
    token,
  });
}

// ─── Cinemas ──────────────────────────────────────────────────────────────────

export async function fetchCinemas() {
  return apiRequest<{ items: BackendCinema[]; total: number }>('/cinemas');
}

export async function fetchNearbyCinemas(lat: number, lng: number) {
  return apiRequest<BackendNearbyCinema[]>('/cinemas/nearby', {
    params: { lat, lng },
  });
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

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
    body: payload,
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
    body: payload,
  });
}

export async function deleteRoom(token: string, roomId: string) {
  return apiRequest<null>(`/rooms/${roomId}`, {
    method: 'DELETE',
    token,
  });
}

// ─── Showtimes ────────────────────────────────────────────────────────────────

export async function fetchShowtimes() {
  return apiRequest<{ items: BackendShowtimeListItem[]; total: number }>('/showtimes');
}

export async function fetchShowtimeById(showtimeId: string) {
  return apiRequest<BackendShowtimeDetail>(`/showtimes/${showtimeId}`);
}

export async function createShowtimeSchedule(
  token: string,
  payload: BackendShowtimeSchedulePayload,
) {
  return apiRequest<BackendShowtimeScheduleResult>('/showtimes/batch', {
    method: 'POST',
    token,
    body: payload,
  });
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function fetchMyBookings(token: string) {
  return apiRequest<{ items: BackendBooking[]; total: number }>('/bookings', { token });
}

export async function fetchMyBookingById(token: string, bookingId: string) {
  return apiRequest<BackendBooking>(`/bookings/${bookingId}`, { token });
}

export async function createBooking(
  token: string,
  payload: { showtimeId: string; seatCodes: string[] },
) {
  return apiRequest<BackendBooking>('/bookings', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function cancelBooking(token: string, bookingId: string) {
  return apiRequest<BackendBooking>(`/bookings/${bookingId}/cancel`, {
    method: 'POST',
    token,
  });
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function fetchPaymentBill(token: string, bookingId: string) {
  return apiRequest<BackendBill>(`/payments/bills/${bookingId}`, { token });
}

export async function payBookingBill(
  token: string,
  bookingId: string,
  payload: { returnUrl?: string } = {},
) {
  return apiRequest<BackendPaymentSession>(`/payments/bills/${bookingId}/pay`, {
    method: 'POST',
    token,
    body: payload,
  });
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export async function fetchMyTickets(token: string) {
  return apiRequest<{ items: BackendTicket[]; total: number }>('/tickets', { token });
}

export async function fetchCinemaOptions() {
  return apiRequest<{ brands: BackendCinemaBrand[]; provinces: string[] }>('/meta/cinema-options');
}

export async function fetchAvatarOptions() {
  return apiRequest<BackendAvatarOption[]>('/meta/avatars');
}
