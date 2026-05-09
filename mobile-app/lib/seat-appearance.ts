import { type Room, type RoomSeat, type ShowtimeSeatState } from '@/lib/app-store';

export type SeatVisualVariant = 'regular' | 'vip' | 'couple';
export type SeatVisualStatus =
  | 'available'
  | 'selected'
  | 'held'
  | 'booked'
  | 'disabled';

export const seatVariantTokens: Record<
  SeatVisualVariant,
  {
    accent: string;
    accentSoft: string;
    label: string;
    previewWide: boolean;
  }
> = {
  regular: {
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
  booked: {
    fill: '#F05B4F',
    border: '#D74439',
    text: '#FFF8F6',
    label: 'Ghế đã bán',
    description: 'Ghế đã thanh toán xong, không thể chọn.',
  },
  disabled: {
    fill: '#E2E8F0',
    border: '#CBD5E1',
    text: '#64748B',
    label: 'Ghế không sử dụng',
    description: 'Ghế đã bị khóa hoặc hư hỏng.',
  },
};

const premiumRoomPattern = /\b(gold|premium|vip|imax)\b/i;

export const roomHasVipSeats = (room?: Pick<Room, 'name' | 'roomType'> | null) => {
  if (!room) {
    return false;
  }

  const premiumTypes = ['vip', 'gold', 'imax'];
  return (
    premiumTypes.includes(room.roomType?.toLowerCase()) ||
    premiumRoomPattern.test(room.name)
  );
};

export const getSeatVisualVariant = (
  seat: Pick<RoomSeat, 'type'>,
  room?: Pick<Room, 'name' | 'roomType'> | null,
): SeatVisualVariant => {
  if (seat.type === 'space' || seat.type === 'disabled') {
    return 'regular';
  }

  if (seat.type === 'couple') {
    return 'couple';
  }

  if (seat.type === 'vip') {
    return 'vip';
  }

  return roomHasVipSeats(room) ? 'vip' : 'regular';
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

  if (seatState.status === 'booked') {
    return 'booked';
  }

  return 'disabled';
};

export const buildSeatVariantLookup = (room?: Room | null) => {
  const lookup: Partial<Record<string, SeatVisualVariant>> = {};

  if (!room) {
    return lookup;
  }

  room.seatLayout.flat().forEach((seat) => {
    if (seat.type === 'space') {
      return;
    }

    lookup[seat.seatCode.toUpperCase()] = getSeatVisualVariant(seat, room);
  });

  return lookup;
};

export const formatSeatVisualLabel = (variant: SeatVisualVariant) =>
  seatVariantTokens[variant].label;
