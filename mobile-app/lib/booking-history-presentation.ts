export type BookingHistoryStatus =
  | 'held'
  | 'paid'
  | 'booked'
  | 'cancelled'
  | 'pending_payment'
  | 'confirmed'
  | 'expired';

export type BookingHistoryStatusTone = 'success' | 'warning' | 'danger' | 'neutral';

type BookingHistoryStatusPresentation = {
  label: string;
  tone: BookingHistoryStatusTone;
  backgroundColor: string;
  textColor: string;
  disabled: boolean;
};

const STATUS_PRESENTATION: Record<BookingHistoryStatus, BookingHistoryStatusPresentation> = {
  confirmed: {
    label: 'Đã xác nhận',
    tone: 'success',
    backgroundColor: '#DCFCE7',
    textColor: '#007432',
    disabled: false,
  },
  paid: {
    label: 'Đã thanh toán',
    tone: 'success',
    backgroundColor: '#DCFCE7',
    textColor: '#007432',
    disabled: false,
  },
  booked: {
    label: 'Đã đặt',
    tone: 'success',
    backgroundColor: '#DCFCE7',
    textColor: '#007432',
    disabled: false,
  },
  held: {
    label: 'Chờ thanh toán',
    tone: 'warning',
    backgroundColor: '#F3E7D4',
    textColor: '#714600',
    disabled: false,
  },
  pending_payment: {
    label: 'Chờ thanh toán',
    tone: 'warning',
    backgroundColor: '#F3E7D4',
    textColor: '#714600',
    disabled: false,
  },
  cancelled: {
    label: 'Đã hủy',
    tone: 'danger',
    backgroundColor: '#FCEBEC',
    textColor: '#9B3436',
    disabled: true,
  },
  expired: {
    label: 'Hết hạn',
    tone: 'danger',
    backgroundColor: '#FCEBEC',
    textColor: '#9B3436',
    disabled: true,
  },
};

export const getBookingHistoryStatusPresentation = (
  status: BookingHistoryStatus,
) => STATUS_PRESENTATION[status];

export const isBookingHistoryDetailDisabled = (status: BookingHistoryStatus) =>
  STATUS_PRESENTATION[status].disabled;
