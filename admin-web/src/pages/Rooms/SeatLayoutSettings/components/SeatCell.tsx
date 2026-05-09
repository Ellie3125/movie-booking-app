import React from "react";
import { SEAT_TYPE_CONFIG, SeatType } from "./SeatToolbar";

interface SeatCellProps {
  seat: {
    label?: string;
    seatCode: string;
    type: SeatType;
    status: string;
    size?: number;
  };
  onClick: () => void;
  isPreview?: boolean;
}

const SeatCell: React.FC<SeatCellProps> = ({ 
  seat, 
  onClick, 
  isPreview 
}) => {
  const config = SEAT_TYPE_CONFIG[seat.type as SeatType] || SEAT_TYPE_CONFIG.regular;
  
  const isSpacer = 
    seat.type === "space" || 
    seat.type === "empty" || 
    seat.type === "hidden" || 
    seat.type === "aisle" ||
    seat.status === "inactive" ||
    !seat.type ||
    seat.seatCode?.toUpperCase().includes("HIDDEN") ||
    seat.label?.toUpperCase().includes("HIDDEN") ||
    seat.label === "" ||
    !seat.label ||
    (seat.capacity === 0 && !["regular", "vip", "couple"].includes(seat.type));

  const getWidth = () => {
    if (seat.type === "couple") return "82px"; // 2 seats (36*2) + gap (10)
    return "36px";
  };

  const getBackground = () => {
    if (isSpacer) return "transparent";
    if (seat.status === "disabled" || seat.type === "disabled") return "#475569"; // Slate 600
    return config.color;
  };

  // If it's a spacer, render a transparent div
  if (isSpacer) {
    return (
      <div 
        onClick={onClick}
        className={`h-9 rounded-lg ${isPreview ? "" : "hover:bg-white/5 cursor-pointer"}`}
        style={{ width: getWidth(), flexShrink: 0 }}
      />
    );
  }

  const isDisabled = seat.status === "disabled" || seat.type === "disabled";

  return (
    <div
      title={seat.label || seat.seatCode}
      onClick={isDisabled && isPreview ? undefined : onClick}
      className={`
        relative h-9 flex items-center justify-center transition-all rounded-lg shadow-sm
        ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
        ${isPreview ? "hover:brightness-110" : "hover:scale-105 active:scale-95"}
      `}
      style={{
        width: getWidth(),
        backgroundColor: getBackground(),
        color: "white",
        boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.15)",
        height: "36px",
        flexShrink: 0
      }}
    >
      <span className="text-[10px] font-bold select-none whitespace-nowrap px-1">
        {seat.label || seat.seatCode}
      </span>
      
      {seat.type === "vip" && !isDisabled && (
        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse" />
      )}
    </div>
  );
};

export default SeatCell;
