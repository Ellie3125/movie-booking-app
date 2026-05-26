import React from "react";
import {
  UserOutlined,
  CrownOutlined,
  HeartOutlined,
  ColumnWidthOutlined,
  LockOutlined,
  BorderOutlined,
  DashOutlined,
} from "@ant-design/icons";

// ─── SEAT TYPE (khớp backend SEAT_TYPE) ─────────────────────────
export type SeatType =
  | "regular"
  | "vip"
  | "couple"
  | "empty"
  | "aisle"
  | "disabled"
  | "space";

// ─── SEAT STATUS (khớp backend SEAT_STATUS) ─────────────────────
export type SeatStatus = "active" | "disabled" | "inactive";

// ─── SEAT INTERFACE (khớp RoomSeatSchema) ───────────────────────
export interface Seat {
  label?: string;
  rowLabel: string;
  seatCode: string;
  rowIndex: number;
  columnIndex: number;
  type: SeatType;
  status: SeatStatus;
  priceType?: "regular" | "vip" | "couple";
  capacity: number;
  size: number;
  coupleGroupId?: string | null;
}

// ─── ROW INTERFACE (khớp RoomRowSchema) ─────────────────────────
export interface RowData {
  rowLabel: string;
  seats: Seat[];
}

// ─── SELECTED SEAT (cho multi-select) ───────────────────────────
export interface SelectedSeat {
  rowIndex: number;
  columnIndex: number;
}

// ─── SEAT TYPE CONFIG ───────────────────────────────────────────
export interface SeatTypeConfig {
  label: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}

// Các type KHÔNG phải ghế thực (không có seatCode / label)
export const NON_SEAT_TYPES: SeatType[] = ["space", "aisle", "empty"];

// Các type là ghế bán được (tính vào activeSeatCount)
export const SELLABLE_TYPES: SeatType[] = ["regular", "vip", "couple"];

export const SEAT_TYPE_CONFIG: Record<SeatType, SeatTypeConfig> = {
  regular: {
    label: "Thường",
    color: "#4c6ef5",
    icon: React.createElement(UserOutlined),
    description: "Ghế thường, giá chuẩn",
  },
  vip: {
    label: "VIP",
    color: "#f59e0b",
    icon: React.createElement(CrownOutlined),
    description: "Ghế VIP, giá cao hơn",
  },
  couple: {
    label: "Couple",
    color: "#f472b6",
    icon: React.createElement(HeartOutlined),
    description: "Ghế đôi, chiếm 2 cột",
  },
  empty: {
    label: "Trống",
    color: "transparent",
    icon: React.createElement(BorderOutlined),
    description: "Ô trống, không có ghế",
  },
  aisle: {
    label: "Lối đi",
    color: "#bae6fd",
    icon: React.createElement(DashOutlined),
    description: "Lối đi, rộng hơn",
  },
  disabled: {
    label: "Hỏng/Khoá",
    color: "#94a3b8",
    icon: React.createElement(LockOutlined),
    description: "Ghế hỏng hoặc bị khoá",
  },
  space: {
    label: "Khoảng trống",
    color: "transparent",
    icon: React.createElement(ColumnWidthOutlined),
    description: "Khoảng trống layout",
  },
};

// ─── HELPER: Tạo 1 seat mặc định ───────────────────────────────
export function createDefaultSeat(
  rowLabel: string,
  rowIndex: number,
  columnIndex: number,
  type: SeatType = "regular"
): Seat {
  const isNonSeat = NON_SEAT_TYPES.includes(type);
  return {
    label: isNonSeat ? "" : `${rowLabel}${columnIndex + 1}`,
    rowLabel,
    seatCode: isNonSeat ? "" : `${rowLabel}${columnIndex + 1}`,
    rowIndex,
    columnIndex,
    type,
    status: type === "disabled" ? "disabled" : "active",
    priceType: type === "vip" ? "vip" : type === "couple" ? "couple" : "regular",
    capacity: type === "couple" ? 2 : isNonSeat || type === "disabled" ? 0 : 1,
    size: type === "couple" ? 2 : 1,
    coupleGroupId: null,
  };
}

// ─── HELPER: Generate UUID đơn giản ─────────────────────────────
export function generateCoupleGroupId(): string {
  return `CPL_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
