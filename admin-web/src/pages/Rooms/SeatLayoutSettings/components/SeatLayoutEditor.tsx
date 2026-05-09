import React from "react";
import { PlusOutlined, DeleteOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import SeatCell from "./SeatCell";
import { SeatType } from "./SeatToolbar";

interface Seat {
  label?: string;
  seatCode: string;
  rowIndex: number;
  columnIndex: number;
  type: SeatType;
  status: "active" | "disabled";
  priceType?: string;
  capacity?: number;
  size?: number;
  coupleGroupId?: string | null;
}

interface Row {
  rowLabel: string;
  seats: Seat[];
}

interface SeatLayoutEditorProps {
  layout: Row[];
  setLayout: (layout: Row[]) => void;
  onSeatClick: (rIdx: number, cIdx: number) => void;
  isPreview: boolean;
  numberingDirection: "ltr" | "rtl";
}

const SeatLayoutEditor: React.FC<SeatLayoutEditorProps> = ({
  layout,
  setLayout,
  onSeatClick,
  isPreview,
  numberingDirection
}) => {
  
  const addSeatToRow = (rIdx: number, atIndex?: number) => {
    const newLayout = [...layout];
    const row = { ...newLayout[rIdx] };
    const seats = [...row.seats];
    
    const insertIdx = atIndex !== undefined ? atIndex : seats.length;
    
    const newSeat: Seat = {
      label: "",
      seatCode: `NEW_${Date.now()}`, 
      rowIndex: rIdx,
      columnIndex: insertIdx,
      type: "regular",
      status: "active",
      priceType: "regular",
      capacity: 1,
      size: 1
    };
    
    seats.splice(insertIdx, 0, newSeat);
    row.seats = recalculateRowCodes(row.rowLabel, seats);
    newLayout[rIdx] = row;
    setLayout(newLayout);
  };

  const removeSeatFromRow = (rIdx: number, cIdx: number) => {
    const newLayout = [...layout];
    const row = { ...newLayout[rIdx] };
    const seats = [...row.seats];
    
    seats.splice(cIdx, 1);
    row.seats = recalculateRowCodes(row.rowLabel, seats);
    newLayout[rIdx] = row;
    setLayout(newLayout);
  };

  const deleteRow = (rIdx: number) => {
    setLayout(layout.filter((_, i) => i !== rIdx));
  };

  const recalculateRowCodes = (label: string, seats: Seat[]): Seat[] => {
    const saleableSeats = (seats || []).filter(s => s && !["space", "empty", "hidden", "aisle"].includes(s.type));
    const count = saleableSeats.length;
    
    let currentNum = numberingDirection === "ltr" ? 1 : count;
    const step = numberingDirection === "ltr" ? 1 : -1;

    return (seats || []).map((seat, idx) => {
      if (!seat) return seat;
      
      const updatedSeat = { ...seat, columnIndex: idx };

      if (["space", "empty", "hidden", "aisle"].includes(seat.type) || seat.seatCode?.startsWith("HIDDEN")) {
        updatedSeat.label = "";
        updatedSeat.capacity = 0;
        updatedSeat.priceType = undefined;
        return updatedSeat;
      }

      // regular, vip, couple, disabled
      if (seat.type === "couple") {
        const nextNum = currentNum + step;
        if (numberingDirection === "ltr") {
          updatedSeat.label = `${label}${currentNum}-${label}${nextNum}`;
          currentNum += 2;
        } else {
          updatedSeat.label = `${label}${nextNum}-${label}${currentNum}`;
          currentNum -= 2;
        }
        updatedSeat.capacity = 2;
        updatedSeat.priceType = "couple";
      } else {
        updatedSeat.label = `${label}${currentNum}`;
        currentNum += step;
        updatedSeat.capacity = (seat.type === "disabled") ? 0 : 1;
        updatedSeat.priceType = (seat.type === "vip") ? "vip" : "regular";
      }

      updatedSeat.seatCode = `${label}${idx + 1}`; // Technical unique ID for this position
      return updatedSeat;
    });
  };

  if (!layout || layout.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-white/[0.03] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 mt-2">Chưa có dữ liệu sơ đồ ghế. Hãy thêm hàng mới ở cột bên phải.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0f1e] rounded-2xl overflow-hidden border border-gray-800 shadow-xl relative">
      {/* Screen Indicator */}
      <div className="py-12 px-6 text-center relative overflow-hidden">
         <div className="w-2/3 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto rounded-full mb-4 shadow-[0_0_20px_rgba(59,130,246,0.8)]"></div>
         <span className="text-gray-500 uppercase tracking-[0.5em] text-[11px] font-black">
           MÀN HÌNH CHÍNH
         </span>
      </div>
      
      <div className="p-4 md:p-10 overflow-auto flex flex-col items-center min-h-[500px]">
        <div className="inline-block">
          {(layout || []).map((row, rIdx) => {
            if (!row) return null;
            return (
            <div key={rIdx} className="flex items-center mb-5 group relative">
              {/* Row Label */}
              <div className="w-12 h-9 flex items-center justify-between font-black text-gray-500 mr-8 text-sm">
                <span>{row.rowLabel || "?"}</span>
                <span className="h-4 w-[1.5px] bg-gray-700 ml-4"></span>
              </div>
              
              <div className="flex gap-2.5">
                {(row?.seats || []).map((seat, cIdx) => {
                  if (!seat) return null;
                  
                  return (
                    <div key={`${rIdx}-${cIdx}`} className="relative group/seat">
                      <SeatCell 
                        seat={seat} 
                        onClick={() => onSeatClick(rIdx, cIdx)}
                        isPreview={isPreview}
                      />
                      
                      {!isPreview && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/seat:opacity-100 transition-opacity flex gap-1 z-10">
                          <button 
                            className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-500 text-white hover:bg-brand-600 shadow-theme-sm transition-colors"
                            onClick={() => addSeatToRow(rIdx, cIdx)}
                            title="Thêm ghế trái"
                          >
                            <LeftOutlined style={{fontSize: 10}} />
                          </button>
                          <button 
                            className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-theme-sm transition-colors"
                            onClick={() => removeSeatFromRow(rIdx, cIdx)}
                            title="Xoá ghế này"
                          >
                            <DeleteOutlined style={{fontSize: 10}} />
                          </button>
                          <button 
                            className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-500 text-white hover:bg-brand-600 shadow-theme-sm transition-colors"
                            onClick={() => addSeatToRow(rIdx, cIdx + 1)}
                            title="Thêm ghế phải"
                          >
                            <RightOutlined style={{fontSize: 10}} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isPreview && (
                <div className="ml-8 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-theme-sm border border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={() => addSeatToRow(rIdx)} 
                    className="w-7 h-7 flex items-center justify-center rounded-full text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                    title="Thêm vào cuối hàng"
                  >
                    <PlusOutlined />
                  </button>
                  <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
                  <button 
                    onClick={() => deleteRow(rIdx)} 
                    className="w-7 h-7 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    title="Xoá hàng này"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              )}
            </div>
          )})}
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-white/[0.02] p-4 border-t border-gray-200 dark:border-gray-800 text-center">
        <span className="text-[12px] italic text-gray-500 dark:text-gray-400">
          Tip: Ở chế độ chỉnh sửa, di chuột lên ghế để thấy nút thêm/xoá nhanh.
        </span>
      </div>
    </div>
  );
};

export default SeatLayoutEditor;
