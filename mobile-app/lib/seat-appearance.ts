import { type Room, type RoomSeat, type ShowtimeSeatState } from '@/lib/app-store';

export type SeatVisualVariant = 'standard' | 'vip' | 'couple';
export type SeatVisualStatus =
  | 'available'
  | 'selected'
  | 'held'
  | 'reserved'
  | 'paid';

export const seatVariantTokens: Record<
  SeatVisualVariant,
  {
    accent: string;
    accentSoft: string;
    label: string;
    previewWide: boolean;
  }
> = {
  standard: {
    accent: '#1D8B4D',
    accentSoft: 'rgba(29, 139, 77, 0.22)',
    label: 'Ghế thường',
    previewWide: false,
  },
  vip: {
    accent: '#F0C14A',
    accentSoft: 'rgba(240, 193, 74, 0.24)',
    label: 'Ghế VIP',
    previewWide: false,
  },
  couple: {
    accent: '#D46B9A',
    accentSoft: 'rgba(212, 107, 154, 0.24)',
    label: 'Ghế cặp đôi',
    previewWide: true,
  },
};

export const seatStatusTokens: Record<
  SeatVisualStatus,
  {
    fill: string;
    border: string;
    text: string;
    label: string;
    description: string;
  }
> = {
  available: {
    fill: '#2CC56F',
    border: '#24A85D',
    text: '#FFFDF8',
    label: 'Ghế còn trống',
    description: 'Có thể chọn ngay.',
  },
  selected: {
    fill: '#1573D6',
    border: '#115FB4',
    text: '#F7FBFF',
    label: 'Ghế đang chọn',
    description: 'Ghế bạn đang giữ trong phiên hiện tại.',
  },
  held: {
    fill: '#8FD2FF',
    border: '#58B4F0',
    text: '#18405C',
    label: 'Ghế đang được giữ',
    description: 'Đang được giữ tạm trong phiên của người khác.',
  },
  reserved: {
    fill: '#FFD667',
    border: '#E3B63F',
    text: '#54361A',
    label: 'Ghế đã đặt trước',
    description: 'Ghế đã được khóa hoặc đặt trước.',
  },
  paid: {
    fill: '#F05B4F',
    border: '#D74439',
    text: '#FFF8F6',
    label: 'Ghế đã bán',
    description: 'Ghế đã thanh toán xong, không thể chọn.',
  },
};

const premiumRoomPattern = /\b(gold|premium|vip)\b/i;

export const roomHasVipSeats = (room?: Pick<Room, 'name' | 'screenLabel'> | null) => {
  if (!room) {
    return false;
  }

  return premiumRoomPattern.test(`${room.name} ${room.screenLabel}`);
};

export const getSeatVisualVariant = (
  seat: Pick<RoomSeat, 'cellType' | 'seatType'>,
  room?: Pick<Room, 'name' | 'screenLabel'> | null,
): SeatVisualVariant => {
  if (seat.cellType !== 'seat') {
    return 'standard';
  }

  if (seat.seatType === 'couple') {
    return 'couple';
  }

  return roomHasVipSeats(room) ? 'vip' : 'standard';
};

export const getSeatVisualStatus = ({
  selected,
  seatState,
}: {
  selected: boolean;
  seatState?: Pick<ShowtimeSeatState, 'status'> | null;
}): SeatVisualStatus => {
  if (selected) {
    return 'selected';
  }

  if (!seatState || seatState.status === 'available') {
    return 'available';
  }

  if (seatState.status === 'held') {
    return 'held';
  }

  if (seatState.status === 'reserved') {
    return 'reserved';
  }

  return 'paid';
};

export const buildSeatVariantLookup = (room?: Room | null) => {
  const lookup: Partial<Record<string, SeatVisualVariant>> = {};

  if (!room) {
    return lookup;
  }

  room.seatLayout.flat().forEach((seat) => {
    if (seat.cellType !== 'seat') {
      return;
    }

    lookup[seat.coordinate.coordinateLabel.toUpperCase()] = getSeatVisualVariant(seat, room);
  });

  return lookup;
};

export const formatSeatVisualLabel = (variant: SeatVisualVariant) =>
  seatVariantTokens[variant].label;
