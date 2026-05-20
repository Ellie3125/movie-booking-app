import React, { useMemo, useState, useRef, useCallback } from "react";
import {
  PlusOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  HeartOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";
import SeatCell from "./SeatCell";
import {
  Seat,
  RowData,
  SelectedSeat,
  SeatType,
  NON_SEAT_TYPES,
  createDefaultSeat,
  generateCoupleGroupId,
} from "../types";

interface SeatLayoutEditorProps {
  layout: RowData[];
  setLayout: (layout: RowData[]) => void;
  onSeatClick: (rIdx: number, cIdx: number) => void;
  isPreview: boolean;
  numberingDirection: "ltr" | "rtl";
  selectedSeats: SelectedSeat[];
  setSelectedSeats: React.Dispatch<React.SetStateAction<SelectedSeat[]>>;
  editMode: SeatType;
}

// ─── HOVER CENTER SEAT WRAPPER ──────────────────────────────────
// Hover trỏ chuột vào chính giữa ghế mới hiện nút thêm/xoá
interface HoverSeatProps {
  seat: Seat;
  rIdx: number;
  cIdx: number;
  isPreview: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onAddLeft: () => void;
  onAddRight: () => void;
  onRemove: () => void;
}

const HoverSeat: React.FC<HoverSeatProps> = ({
  seat,
  isPreview,
  isSelected,
  onSelect,
  onAddLeft,
  onAddRight,
  onRemove,
}) => {
  const [showActions, setShowActions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInCenterRef = useRef(false);

  // Huỷ tất cả timer khi unmount
  React.useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isPreview) return;
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = Math.abs(e.clientX - centerX);
      const distY = Math.abs(e.clientY - centerY);

      // Chuột nằm trong vùng 14px từ tâm
      if (distX <= 14 && distY <= 14) {
        if (!isInCenterRef.current) {
          isInCenterRef.current = true;
          // Huỷ timer ẩn nếu có
          if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
          }
          // Đặt timer chờ 500ms rồi mới hiện
          if (!showTimerRef.current && !showActions) {
            showTimerRef.current = setTimeout(() => {
              setShowActions(true);
              showTimerRef.current = null;
            }, 500);
          }
        }
      } else {
        // Chuột rời khỏi vùng tâm nhưng vẫn trong ô ghế
        if (isInCenterRef.current) {
          isInCenterRef.current = false;
          if (showTimerRef.current) {
            clearTimeout(showTimerRef.current);
            showTimerRef.current = null;
          }
        }
      }
    },
    [isPreview, showActions]
  );

  const handleMouseLeave = useCallback(() => {
    isInCenterRef.current = false;
    // Huỷ timer hiện nếu chưa kịp hiện
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    // Ẩn nhanh sau 150ms
    hideTimerRef.current = setTimeout(() => setShowActions(false), 150);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <SeatCell
        seat={seat}
        onClick={onSelect}
        isPreview={isPreview}
        isSelected={isSelected}
      />

      {/* Quick action buttons — hiện khi hover giữ lâu ở tâm ghế */}
      {!isPreview && showActions && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1 z-20"
          onMouseEnter={() => {
            if (hideTimerRef.current) {
              clearTimeout(hideTimerRef.current);
              hideTimerRef.current = null;
            }
          }}
          onMouseLeave={() => {
            setShowActions(false);
          }}
        >
          <button
            className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-md transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onAddLeft();
              setShowActions(false);
            }}
            title="Thêm ghế trái"
          >
            <LeftOutlined style={{ fontSize: 9 }} />
          </button>
          <button
            className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-md transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
              setShowActions(false);
            }}
            title="Xoá ghế này"
          >
            <DeleteOutlined style={{ fontSize: 9 }} />
          </button>
          <button
            className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-md transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onAddRight();
              setShowActions(false);
            }}
            title="Thêm ghế phải"
          >
            <RightOutlined style={{ fontSize: 9 }} />
          </button>
        </div>
      )}
    </div>
  );
};

const SeatLayoutEditor: React.FC<SeatLayoutEditorProps> = ({
  layout,
  setLayout,
  onSeatClick,
  isPreview,
  numberingDirection,
  selectedSeats,
  setSelectedSeats,
  editMode,
}) => {
  // ─── SEAT RECALCULATION ─────────────────────────────────────
  const recalculateRowCodes = (label: string, seats: Seat[]): Seat[] => {
    // Count total seat numbers (couple = 2, others = 1)
    let totalSeatNumbers = 0;
    (seats || []).forEach((s) => {
      if (s && !NON_SEAT_TYPES.includes(s.type)) {
        totalSeatNumbers += s.type === "couple" ? 2 : 1;
      }
    });

    let currentNum = numberingDirection === "ltr" ? 1 : totalSeatNumbers;
    const step = numberingDirection === "ltr" ? 1 : -1;

    return (seats || []).map((seat, idx) => {
      if (!seat) return seat;

      const updatedSeat: Seat = { ...seat, columnIndex: idx, rowLabel: label };

      if (NON_SEAT_TYPES.includes(seat.type)) {
        updatedSeat.label = "";
        updatedSeat.seatCode = "";
        updatedSeat.capacity = 0;
        updatedSeat.priceType = undefined;
        return updatedSeat;
      }

      // regular, vip, couple, disabled
      if (seat.type === "couple") {
        if (numberingDirection === "ltr") {
          updatedSeat.label = `${label}${currentNum}-${label}${currentNum + 1}`;
          updatedSeat.seatCode = `${label}${currentNum}-${label}${currentNum + 1}`;
          currentNum += 2;
        } else {
          updatedSeat.label = `${label}${currentNum - 1}-${label}${currentNum}`;
          updatedSeat.seatCode = `${label}${currentNum - 1}-${label}${currentNum}`;
          currentNum -= 2;
        }
        updatedSeat.capacity = 2;
        updatedSeat.size = 2;
        updatedSeat.priceType = "couple";
      } else {
        updatedSeat.label = `${label}${currentNum}`;
        updatedSeat.seatCode = `${label}${currentNum}`;
        currentNum += step;
        updatedSeat.capacity = seat.type === "disabled" ? 0 : 1;
        updatedSeat.size = 1;
        updatedSeat.priceType = seat.type === "vip" ? "vip" : "regular";
      }

      return updatedSeat;
    });
  };

  // ─── ADD SEAT ──────────────────────────────────────────────
  const addSeatToRow = (rIdx: number, atIndex?: number) => {
    const newLayout = [...layout];
    const row = { ...newLayout[rIdx] };
    const seats = [...row.seats];
    const insertIdx = atIndex !== undefined ? atIndex : seats.length;

    const newSeat = createDefaultSeat(row.rowLabel, rIdx, insertIdx);
    seats.splice(insertIdx, 0, newSeat);
    row.seats = recalculateRowCodes(row.rowLabel, seats);
    newLayout[rIdx] = row;
    setLayout(newLayout);
  };

  // ─── REMOVE SEAT ──────────────────────────────────────────
  const removeSeatFromRow = (rIdx: number, cIdx: number) => {
    const newLayout = [...layout];
    const row = { ...newLayout[rIdx] };
    const seats = [...row.seats];
    seats.splice(cIdx, 1);
    row.seats = recalculateRowCodes(row.rowLabel, seats);
    newLayout[rIdx] = row;
    setLayout(newLayout);
  };

  // ─── DELETE ROW ────────────────────────────────────────────
  const deleteRow = (rIdx: number) => {
    setLayout(layout.filter((_, i) => i !== rIdx));
  };

  // ─── SEAT CLICK HANDLER ───────────────────────────────────
  const handleSeatSelect = (rIdx: number, cIdx: number) => {
    if (isPreview) return;

    const seat = layout[rIdx]?.seats[cIdx];
    if (!seat) return;

    // If editMode differs from current seat type → CONVERT (apply editMode)
    if (seat.type !== editMode) {
      setSelectedSeats([]);
      onSeatClick(rIdx, cIdx);
      return;
    }

    // Same type → enter SELECT mode (for couple merge/split)
    // For non-seat types, no selection needed
    if (NON_SEAT_TYPES.includes(seat.type)) {
      return;
    }

    const isAlreadySelected = selectedSeats.some(
      (s) => s.rowIndex === rIdx && s.columnIndex === cIdx
    );

    if (isAlreadySelected) {
      setSelectedSeats((prev) =>
        prev.filter((s) => !(s.rowIndex === rIdx && s.columnIndex === cIdx))
      );
    } else {
      const newSelected = [...selectedSeats, { rowIndex: rIdx, columnIndex: cIdx }];
      if (newSelected.length > 2) {
        newSelected.shift();
      }
      setSelectedSeats(newSelected);
    }
  };

  // ─── COUPLE MERGE CHECK ────────────────────────────────────
  const canMergeCouple = useMemo((): boolean => {
    if (selectedSeats.length !== 2) return false;
    const [a, b] = selectedSeats;
    if (a.rowIndex !== b.rowIndex) return false;
    if (Math.abs(a.columnIndex - b.columnIndex) !== 1) return false;
    const seatA = layout[a.rowIndex]?.seats[a.columnIndex];
    const seatB = layout[b.rowIndex]?.seats[b.columnIndex];
    if (!seatA || !seatB) return false;
    if (NON_SEAT_TYPES.includes(seatA.type) || NON_SEAT_TYPES.includes(seatB.type))
      return false;
    if (seatA.type === "couple" || seatB.type === "couple") return false;
    return true;
  }, [selectedSeats, layout]);

  // ─── IS SELECTED SEAT A COUPLE? ───────────────────────────
  const canSplitCouple = useMemo((): boolean => {
    if (selectedSeats.length !== 1) return false;
    const { rowIndex, columnIndex } = selectedSeats[0];
    const seat = layout[rowIndex]?.seats[columnIndex];
    return seat?.type === "couple";
  }, [selectedSeats, layout]);

  // ─── MERGE COUPLE ─────────────────────────────────────────
  const handleMergeCouple = () => {
    if (!canMergeCouple) return;

    const [a, b] = selectedSeats;
    const leftIdx = Math.min(a.columnIndex, b.columnIndex);
    const rightIdx = Math.max(a.columnIndex, b.columnIndex);
    const rIdx = a.rowIndex;

    const newLayout = [...layout];
    const row = { ...newLayout[rIdx] };
    const seats = [...row.seats];

    const groupId = generateCoupleGroupId();

    seats[leftIdx] = {
      ...seats[leftIdx],
      type: "couple",
      capacity: 2,
      size: 2,
      priceType: "couple",
      coupleGroupId: groupId,
    };

    seats.splice(rightIdx, 1);

    row.seats = recalculateRowCodes(row.rowLabel, seats);
    newLayout[rIdx] = row;
    setLayout(newLayout);
    setSelectedSeats([]);
  };

  // ─── SPLIT COUPLE ─────────────────────────────────────────
  const handleSplitCouple = () => {
    if (!canSplitCouple) return;

    const { rowIndex: rIdx, columnIndex: cIdx } = selectedSeats[0];
    const newLayout = [...layout];
    const row = { ...newLayout[rIdx] };
    const seats = [...row.seats];

    seats[cIdx] = {
      ...seats[cIdx],
      type: "regular",
      capacity: 1,
      size: 1,
      priceType: "regular",
      coupleGroupId: null,
    };

    const newSeat = createDefaultSeat(row.rowLabel, rIdx, cIdx + 1);
    seats.splice(cIdx + 1, 0, newSeat);

    row.seats = recalculateRowCodes(row.rowLabel, seats);
    newLayout[rIdx] = row;
    setLayout(newLayout);
    setSelectedSeats([]);
  };

  // ─── CHECK IF A SEAT IS SELECTED ──────────────────────────
  const isSeatSelected = (rIdx: number, cIdx: number): boolean => {
    return selectedSeats.some(
      (s) => s.rowIndex === rIdx && s.columnIndex === cIdx
    );
  };

  // ─── EMPTY STATE ──────────────────────────────────────────
  if (!layout || layout.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-white/[0.03] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Chưa có dữ liệu sơ đồ ghế. Hãy dùng "Tạo sơ đồ lưới" hoặc thêm hàng mới.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] rounded-2xl overflow-hidden border border-gray-700 shadow-xl relative">
      {/* ─── FLOATING ACTION BAR (couple merge/split) ────────── */}
      {!isPreview && (canMergeCouple || canSplitCouple) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 bg-gray-900/95 backdrop-blur-sm rounded-full border border-gray-600 shadow-2xl">
          {canMergeCouple && (
            <button
              onClick={handleMergeCouple}
              className="flex items-center gap-2 px-4 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold rounded-full transition-colors"
            >
              <HeartOutlined /> Ghép couple
            </button>
          )}
          {canSplitCouple && (
            <button
              onClick={handleSplitCouple}
              className="flex items-center gap-2 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-full transition-colors"
            >
              <DisconnectOutlined /> Tách ghế
            </button>
          )}
          <button
            onClick={() => setSelectedSeats([])}
            className="px-3 py-1.5 text-gray-400 hover:text-white text-xs rounded-full transition-colors"
          >
            Huỷ
          </button>
        </div>
      )}

      {/* ─── SCREEN INDICATOR ────────────────────────────── */}
      <div className="py-10 px-6 text-center relative overflow-hidden">
        <div className="w-[85%] h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto rounded-full mb-4 shadow-[0_0_24px_rgba(59,130,246,0.7)]" />
        <span className="text-gray-500 uppercase tracking-[0.5em] text-[11px] font-black">
          MÀN HÌNH
        </span>
      </div>

      {/* ─── SEAT GRID ───────────────────────────────────────── */}
      <div className="p-4 md:p-8 overflow-auto flex flex-col items-center justify-center min-h-[400px]">
        <div className="inline-block">
          {(layout || []).map((row, rIdx) => {
            if (!row) return null;
            return (
              <div key={rIdx} className="flex items-center mb-2 group relative">
                {/* Row Label */}
                <div className="w-10 h-10 flex items-center justify-between font-black text-gray-500 mr-6 text-sm">
                  <span>{row.rowLabel || "?"}</span>
                  <span className="h-4 w-[1.5px] bg-gray-700 ml-3" />
                </div>

                {/* Seats */}
                <div className="flex gap-1">
                  {(row?.seats || []).map((seat, cIdx) => {
                    if (!seat) return null;

                    return (
                      <HoverSeat
                        key={`${rIdx}-${cIdx}`}
                        seat={seat}
                        rIdx={rIdx}
                        cIdx={cIdx}
                        isPreview={isPreview}
                        isSelected={isSeatSelected(rIdx, cIdx)}
                        onSelect={() => handleSeatSelect(rIdx, cIdx)}
                        onAddLeft={() => addSeatToRow(rIdx, cIdx)}
                        onAddRight={() => addSeatToRow(rIdx, cIdx + 1)}
                        onRemove={() => removeSeatFromRow(rIdx, cIdx)}
                      />
                    );
                  })}
                </div>

                {/* Row actions (always visible on hover for row-level ops) */}
                {!isPreview && (
                  <div className="ml-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => addSeatToRow(rIdx)}
                      className="w-6 h-6 flex items-center justify-center rounded-full text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                      title="Thêm vào cuối hàng"
                    >
                      <PlusOutlined style={{ fontSize: 11 }} />
                    </button>
                    <div className="w-px h-3 bg-gray-200 dark:bg-gray-700" />
                    <button
                      onClick={() => deleteRow(rIdx)}
                      className="w-6 h-6 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      title="Xoá hàng này"
                    >
                      <DeleteOutlined style={{ fontSize: 11 }} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── FOOTER TIP ────────────────────────────────── */}
      <div className="bg-gray-50 dark:bg-white/[0.02] p-3 border-t border-gray-200 dark:border-gray-800 text-center">
        <span className="text-[11px] italic text-gray-500 dark:text-gray-400">
          Tip: Click đổi loại ghế. Trỏ chuột vào giữa ghế ~0.5s để hiện nút thêm/xoá. Chọn 2 ghế cùng loại liền kề → "Ghép couple".
        </span>
      </div>
    </div>
  );
};

export default SeatLayoutEditor;
