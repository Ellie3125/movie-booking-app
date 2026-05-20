import React from "react";
import { Seat, SEAT_TYPE_CONFIG, NON_SEAT_TYPES } from "../types";

interface SeatCellProps {
  seat: Seat;
  onClick: () => void;
  isPreview?: boolean;
  isSelected?: boolean;
}

const SeatCell: React.FC<SeatCellProps> = ({
  seat,
  onClick,
  isPreview,
  isSelected,
}) => {
  const config = SEAT_TYPE_CONFIG[seat.type] || SEAT_TYPE_CONFIG.regular;

  const isNonSeat = NON_SEAT_TYPES.includes(seat.type);
  const isDisabledSeat = seat.type === "disabled" || seat.status === "disabled";

  const getWidth = (): string => {
    if (seat.type === "couple") return "84px";
    if (seat.type === "aisle") return "48px";
    return "40px";
  };

  const HEIGHT = "40px";

  const getBackground = (): string => {
    if (seat.type === "space") return "transparent";
    if (seat.type === "empty") return "transparent";
    if (seat.type === "aisle") return "#0c4a6e";
    if (isDisabledSeat) return "#475569";
    return config.color;
  };

  const getBorder = (): string => {
    if (isSelected) return "2px solid #3b82f6";
    if (seat.type === "space") return "1px dashed #374151";
    if (seat.type === "empty") return "1px dotted #4b5563";
    if (seat.type === "aisle") return "1px solid #0369a1";
    return "1px solid transparent";
  };

  // ─── NON-SEAT (space / empty / aisle) ──────────────────────
  if (isNonSeat) {
    return (
      <div
        onClick={onClick}
        className={`relative rounded-md flex items-center justify-center transition-all ${
          isPreview ? "" : "hover:brightness-125 cursor-pointer"
        } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
        style={{
          width: getWidth(),
          height: HEIGHT,
          background: getBackground(),
          border: getBorder(),
          flexShrink: 0,
        }}
      >
        {seat.type === "aisle" && (
          <span className="text-[9px] font-medium text-sky-400/60 select-none">
            ≡
          </span>
        )}
      </div>
    );
  }

  // ─── REAL SEAT ─────────────────────────────────────────────
  return (
    <div
      onClick={isDisabledSeat && isPreview ? undefined : onClick}
      className={`
        relative flex items-center justify-center transition-all rounded-lg
        ${isDisabledSeat ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
        ${isPreview ? "hover:brightness-110" : "hover:scale-105 active:scale-95"}
      `}
      style={{
        width: getWidth(),
        height: HEIGHT,
        backgroundColor: getBackground(),
        color: "white",
        boxShadow: isSelected
          ? "0 0 0 2px #3b82f6, inset 0 -3px 0 rgba(0,0,0,0.15)"
          : "inset 0 -3px 0 rgba(0,0,0,0.15)",
        border: getBorder(),
        flexShrink: 0,
      }}
    >
      <span
        className={`text-[10px] font-bold select-none whitespace-nowrap px-0.5 ${
          isDisabledSeat ? "line-through opacity-70" : ""
        }`}
      >
        {seat.label || seat.seatCode}
      </span>

      {/* VIP indicator dot */}
      {seat.type === "vip" && !isDisabledSeat && (
        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse" />
      )}

      {/* Couple heart indicator */}
      {seat.type === "couple" && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] text-pink-300">
          ♥
        </div>
      )}
    </div>
  );
};

export default SeatCell;
