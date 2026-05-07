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
  
  const getWidth = () => {
    if (seat.type === "space") return `calc(${seat.size || 1} * 36px)`;
    if (seat.type === "couple") return "82px"; // 2 seats (36*2) + gap (10)
    return "36px";
  };

  const getBackground = () => {
    if (seat.type === "space") return "transparent";
    if (seat.status === "disabled" || seat.type === "disabled") return "#ef4444";
    return config.color;
  };

  if (seat.type === "space") {
    return (
      <div 
        onClick={onClick}
        className="h-9 cursor-pointer transition-all hover:bg-gray-100/50 rounded-lg"
        style={{ width: getWidth(), flexShrink: 0 }}
      />
    );
  }

  return (
    <div
      title={seat.label || seat.seatCode}
      onClick={onClick}
        className={`
          relative h-9 flex items-center justify-center cursor-pointer transition-all rounded-lg shadow-sm
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
        <span className="text-[10px] font-bold select-none truncate px-1">
          {seat.label || seat.seatCode}
        </span>
        
        {seat.type === "vip" && (
          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse" />
        )}
      </div>
  );
};

export default SeatCell;
