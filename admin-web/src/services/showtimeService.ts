import api from '../api/axios';

export interface Movie {
  _id: string;
  title: string;
  duration: number;
  poster?: string;
}

export interface Cinema {
  _id: string;
  name: string;
  brand: string;
  city: string;
}

export interface Room {
  _id: string;
  name: string;
  cinemaId: string;
  roomType: 'standard' | 'vip' | 'gold' | 'imax';
}

export interface BulkCreatePayload {
  movieId: string;
  cinemaIds: string[];
  roomIds: string[];
  startDate: string;
  endDate: string;
  mode: 'MANUAL' | 'AUTO';
  startTimes?: string[];
  showsPerDay?: number;
  openingTime?: string;
  closingTime?: string;
  cleaningMinutes?: number;
  basePrice: number;
  dryRun?: boolean;
}

export interface ShowtimeSlot {
  movieId: string;
  cinemaId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  price: number;
  status: 'OK' | 'CONFLICT';
  conflictInfo?: {
    startTime: string;
    endTime: string;
  };
  roomName: string;
  date: string;
}

export interface BulkCreateResponse {
  total?: number;
  okCount?: number;
  conflictCount?: number;
  slots?: ShowtimeSlot[];
  createdCount?: number;
  skippedCount?: number;
  items?: any[];
  conflicts?: ShowtimeSlot[];
}

export const fetchMovies = async () => {
  const response = await api.get('/movies');
  return response.data.data.items;
};

export const fetchBrands = async () => {
  const response = await api.get('/cinema-brands');
  return response.data.data.items;
};

export const fetchCities = async () => {
  const response = await api.get('/meta/provinces');
  return response.data.data;
};

export const fetchCinemas = async (brand?: string, city?: string) => {
  const params: any = {};
  if (brand) params.brand = brand;
  if (city) params.city = city;
  const response = await api.get('/cinemas', { params });
  return response.data.data.items;
};

export const fetchRooms = async (cinemaId?: string) => {
  const params: any = {};
  if (cinemaId) params.cinemaId = cinemaId;
  const response = await api.get('/rooms', { params });
  return response.data.data.items;
};

export const createMovie = async (data: any) => {
  const response = await api.post('/movies', data);
  return response.data.data;
};

export const bulkCreateShowtimes = async (payload: BulkCreatePayload): Promise<BulkCreateResponse> => {
  const response = await api.post('/showtimes/bulk-create', payload);
  return response.data.data;
};

export const getShowtimes = async (params?: any) => {
  const response = await api.get('/showtimes', { params });
  return response.data;
};

export const getShowtimeById = async (id: string) => {
  const response = await api.get(`/showtimes/${id}`);
  return response.data;
};

export const updateShowtime = async (id: string, data: any) => {
  const response = await api.put(`/showtimes/${id}`, data);
  return response.data;
};

export const deleteShowtime = async (id: string) => {
  const response = await api.delete(`/showtimes/${id}`);
  return response.data;
};
