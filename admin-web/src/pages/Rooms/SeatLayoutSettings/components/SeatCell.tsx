import React from "react";
import { Seat, SeatType, SEAT_TYPE_CONFIG, NON_SEAT_TYPES } from "../types";
import { getSeatDisplayLabel } from "../../../../utils/seatDisplay";

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
  const getNormalizedType = (type: string): SeatType => {
    const t = String(type || "").trim().toLowerCase();
    if (t === "standard" || t === "normal" || t === "regular") return "regular";
    if (t === "double" || t === "pair" || t === "couple") return "couple";
    if (t === "vip") return "vip";
    if (t === "empty") return "empty";
    if (t === "aisle") return "aisle";
    if (t === "disabled") return "disabled";
    if (t === "space") return "space";
    return "regular";
  };

  const normalizedType = getNormalizedType(seat.type);
  const config = SEAT_TYPE_CONFIG[normalizedType] || SEAT_TYPE_CONFIG.regular;
  const displayLabel = getSeatDisplayLabel(seat);

  const isNonSeat = NON_SEAT_TYPES.includes(normalizedType);
  const isDisabledSeat = normalizedType === "disabled" || String(seat.status).trim().toLowerCase() === "disabled";

  const getWidth = (): string => {
    if (normalizedType === "couple") return "84px";
    if (normalizedType === "aisle") return "48px";
    return "40px";
  };

  const HEIGHT = "40px";

  const getBackground = (): string => {
    if (normalizedType === "space") return "transparent";
    if (normalizedType === "empty") return "transparent";
    if (normalizedType === "aisle") return "#0c4a6e";
    if (isDisabledSeat) return "#475569";
    return config.color;
  };

  const getBorder = (): string => {
    if (isSelected) return "2px solid #3b82f6";
    if (normalizedType === "space") return "1px dashed #374151";
    if (normalizedType === "empty") return "1px dotted #4b5563";
    if (normalizedType === "aisle") return "1px solid #0369a1";
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
        {normalizedType === "aisle" && (
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
        {displayLabel}
      </span>

      {/* VIP indicator dot */}
      {normalizedType === "vip" && !isDisabledSeat && (
        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse" />
      )}

      {/* Couple heart indicator */}
      {normalizedType === "couple" && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] text-pink-300">
          ♥
        </div>
      )}
    </div>
  );
};

export default SeatCell;
