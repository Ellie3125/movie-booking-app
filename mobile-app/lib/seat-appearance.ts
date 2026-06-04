/**
 * Autonomous Decisions:
 * - Giữ nguyên AzureColors làm token gốc (khớp với toàn bộ app theme)
 * - Thêm getSeatStyle() là single source of truth cho seat color logic
 * - seatVariantTokens và seatStatusTokens giữ để tương thích ngược (admin/display)
 *
 * Deviations:
 * - Không dùng VibrantColors cho seat rendering nữa (đã có AzureColors đầy đủ)
 *
 * Trade-offs:
 * - getSeatStyle() ưu tiên status trước variant (selected/booked/held override type colors)
 * - VIP giữ green border ngay cả khi selected để user vẫn nhận ra type
 *
 * Context/Notes:
 * - Dùng bởi: seat-layout-grid.tsx (user mode), components/booking/seats.tsx (Legend + MiniMap)
 * - Admin mode KHÔNG dùng getSeatStyle() (admin có palette riêng)
 */

import { AzureColors } from '@/constants/theme';
import { type Room, type RoomSeat, type ShowtimeSeatState } from '@/lib/app-store';

export type SeatVisualVariant = 'regular' | 'vip' | 'couple';
export type SeatVisualStatus =
  | 'available'
  | 'selected'
  | 'held'
  | 'booked'
  | 'disabled';

/* ── Variant tokens (dùng cho legend label + previewWide) ── */

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
    accent: AzureColors.primary,
    accentSoft: AzureColors.normalSeat,
    label: 'Ghế thường',
    previewWide: false,
  },
  vip: {
    accent: AzureColors.vipBorder,
    accentSoft: AzureColors.normalSeat,
    label: 'Ghế VIP',
    previewWide: false,
  },
  couple: {
    accent: AzureColors.secondary,
    accentSoft: AzureColors.coupleSeat,
    label: 'Ghế cặp đôi',
    previewWide: true,
  },
};

/* ── Status tokens (dùng cho documentation/display) ── */

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
    fill: AzureColors.normalSeat,
    border: AzureColors.border,
    text: AzureColors.textPrimary,
    label: 'Ghế còn trống',
    description: 'Có thể chọn ngay.',
  },
  selected: {
    fill: AzureColors.selectedSeat,
    border: AzureColors.selectedSeat,
    text: '#FFFFFF',                    // white trên amber #D97706 — contrast đủ tốt
    label: 'Ghế đang chọn',
    description: 'Ghế bạn đang giữ trong phiên hiện tại.',
  },
  held: {
    fill: AzureColors.bookedSeat,
    border: AzureColors.bookedSeat,
    text: '#FFFFFF',
    label: 'Ghế đang được giữ',
    description: 'Đang được giữ tạm trong phiên của người khác.',
  },
  booked: {
    fill: AzureColors.bookedSeat,
    border: AzureColors.bookedSeat,
    text: '#FFFFFF',
    label: 'Ghế đã bán',
    description: 'Ghế đã thanh toán xong, không thể chọn.',
  },
  disabled: {
    fill: AzureColors.disabledSurface,
    border: AzureColors.border,
    text: AzureColors.textSecondary,
    label: 'Ghế không sử dụng',
    description: 'Ghế đã bị khóa hoặc hư hỏng.',
  },
};

/* ── getSeatStyle() — Single source of truth cho seat rendering ── */

export type SeatStyleResult = {
  /** Màu nền ghế */
  bg: string;
  /** Màu chữ / icon label */
  text: string;
  /** Màu border (transparent nếu không có) */
  borderColor: string;
  /** Độ dày border */
  borderWidth: number;
  /** Opacity tổng của ghế (1 = bình thường, < 1 = mờ) */
  opacity: number;
};

/**
 * Trả về style tổng hợp cho một ghế dựa trên variant + status.
 *
 * Priority order:
 * 1. selected → luôn dùng màu primary (navy)
 * 2. booked / held → luôn dùng màu bookedSeat (grey)
 * 3. disabled → mờ
 * 4. available → dựa theo variant (regular / vip / couple)
 */
export const getSeatStyle = (
  variant: SeatVisualVariant,
  status: SeatVisualStatus,
): SeatStyleResult => {
  // ── Selected: override tất cả variant, dùng amber ấm ──
  if (status === 'selected') {
    return {
      bg: AzureColors.selectedSeat,   // #D97706 amber ấm
      text: '#FFFFFF',
      borderColor: AzureColors.selectedSeat,
      borderWidth: 0,
      opacity: 1,
    };
  }

  // ── Booked: không thể đặt, màu xám trung tính ──
  if (status === 'booked') {
    return {
      bg: AzureColors.bookedSeat,     // #B8C5D3
      text: 'rgba(255,255,255,0.7)',
      borderColor: 'transparent',
      borderWidth: 0,
      opacity: 1,
    };
  }

  // ── Held: đang giữ tạm bởi người khác ──
  if (status === 'held') {
    return {
      bg: AzureColors.bookedSeat,     // #B8C5D3 (giống booked nhưng mờ hơn)
      text: 'rgba(255,255,255,0.7)',
      borderColor: 'transparent',
      borderWidth: 0,
      opacity: 0.65,
    };
  }

  // ── Disabled: ghế bị khóa ──
  if (status === 'disabled') {
    return {
      bg: AzureColors.disabledSurface, // #E2EAF3
      text: AzureColors.mutedText,
      borderColor: 'transparent',
      borderWidth: 0,
      opacity: 0.45,
    };
  }

  // ── Available: dựa theo variant ──
  switch (variant) {
    case 'vip':
      return {
        bg: '#f59e0b',    // vàng cam
        text: '#FFFFFF',
        borderColor: 'transparent',
        borderWidth: 0,
        opacity: 1,
      };

    case 'couple':
      return {
        bg: '#f472b6',   // hồng
        text: '#FFFFFF',
        borderColor: 'transparent',
        borderWidth: 0,
        opacity: 1,
      };

    case 'regular':
    default:
      return {
        bg: '#4c6ef5',   // xanh dương
        text: '#FFFFFF',
        borderColor: 'transparent',
        borderWidth: 0,
        opacity: 1,
      };
  }
};

/* ── Màu cho Legend và MiniMap (tiện dùng trực tiếp) ── */

export const SEAT_LEGEND_COLORS = {
  normal: {
    bg: '#4c6ef5',
    border: 'transparent',
    text: '#FFFFFF',
  },
  vip: {
    bg: '#f59e0b',
    border: 'transparent',
    text: '#FFFFFF',
  },
  couple: {
    bg: '#f472b6',
    border: 'transparent',
    text: '#FFFFFF',
  },
  selected: {
    bg: AzureColors.selectedSeat,
    border: 'transparent',
    text: '#FFFFFF',
  },
  booked: {
    bg: AzureColors.bookedSeat,
    border: 'transparent',
    text: 'rgba(255,255,255,0.7)',
  },
} as const;

/* ── Helpers ── */

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
  const type = String(seat.type || '').trim().toLowerCase();
  if (type === 'space' || type === 'disabled') {
    return 'regular';
  }

  if (type === 'couple' || type === 'double' || type === 'pair') {
    return 'couple';
  }

  if (type === 'vip') {
    return 'vip';
  }

  if (type === 'regular' || type === 'standard' || type === 'normal') {
    return 'regular';
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

  const status = String(seatState?.status || '').trim().toLowerCase();

  if (!seatState || status === 'available') {
    return 'available';
  }

  if (status === 'held' || status === 'holding') {
    return 'held';
  }

  if (status === 'booked' || status === 'sold') {
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
    const typeLower = String(seat.type || '').trim().toLowerCase();
    if (['space', 'empty', 'aisle'].includes(typeLower)) {
      return;
    }

    lookup[seat.seatCode.toUpperCase()] = getSeatVisualVariant(seat, room);
  });

  return lookup;
};

export const formatSeatVisualLabel = (variant: SeatVisualVariant) =>
  seatVariantTokens[variant].label;

/**
 * Shadow ấm cho ghế đang được chọn (amber glow).
 * Dùng trong seat-layout-grid.tsx thay AzureShadow.floating.
 */
export const SELECTED_SEAT_SHADOW = {
  shadowColor: '#D97706',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.45,
  shadowRadius: 8,
  elevation: 5,
} as const;
