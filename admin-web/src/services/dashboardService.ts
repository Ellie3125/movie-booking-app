import api from '../api/axios';

// ── Types ────────────────────────────────────────────────────────────────────

export interface RevenueChartPoint {
  month: string;   // e.g. "Jan", "Feb", …
  year: number;
  revenue: number;
  bookings: number;
}

export interface BookingStatusStats {
  PENDING_PAYMENT: number;
  CONFIRMED: number;
  CANCELLED: number;
}

export interface TopMovie {
  movieId: string;
  title: string;
  poster: string;
  totalBookings: number;
  revenue: number;
}

export interface TopCinema {
  cinemaId: string;
  name: string;
  city: string;
  totalBookings: number;
  revenue: number;
}

export interface DashboardSummary {
  totalMovies: number;
  totalCinemas: number;
  totalRooms: number;
  totalShowtimes: number;
  totalUsers: number;
  totalBookings: number;
  totalTicketsSold: number;
  totalRevenue: number;
}

export interface DashboardStats {
  summary: DashboardSummary;
  bookingStatusStats: BookingStatusStats;
  revenueChart: RevenueChartPoint[];
  topMovies: TopMovie[];
  topCinemas: TopCinema[];
}

// ── API call ──────────────────────────────────────────────────────────────────

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<{ success: boolean; message: string; data: DashboardStats }>(
    '/dashboard/stats',
  );
  return response.data.data;
};
