import { useState, useEffect } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import RoomSelector from "./components/RoomSelector";
import SeatToolbar from "./components/SeatToolbar";
import SeatLayoutEditor from "./components/SeatLayoutEditor";
import { roomService } from "../../../services/roomService";
import Button from "../../../components/ui/button/Button";
import toast from "react-hot-toast";
import {
  Seat,
  RowData,
  SelectedSeat,
  SeatType,
  NON_SEAT_TYPES,
  createDefaultSeat,
} from "./types";

const SeatLayoutSettingsPage = () => {
  const { roomId: urlRoomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roomId, setRoomId] = useState<string | undefined>(urlRoomId);
  const [layout, setLayout] = useState<RowData[]>([]);
  const [numberingDirection, setNumberingDirection] = useState<"ltr" | "rtl">("ltr");
  const [editMode, setEditMode] = useState<SeatType>("regular");
  const [isPreview, setIsPreview] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

  // ─── RECALCULATE ON DIRECTION CHANGE ──────────────────────
  useEffect(() => {
    if (layout.length > 0) {
      const newLayout = layout.map((row) => ({
        ...row,
        seats: recalculateRowCodes(row.rowLabel, row.seats),
      }));
      if (JSON.stringify(newLayout) !== JSON.stringify(layout)) {
        setLayout(newLayout);
      }
    }
  }, [numberingDirection]);

  // ─── FETCH LAYOUT ON ROOM SELECT ──────────────────────────
  useEffect(() => {
    if (roomId) {
      fetchRoomLayout(roomId);
    }
  }, [roomId]);

  const fetchRoomLayout = async (id: string) => {
    setLoading(true);
    try {
      const response = await roomService.getSeatLayout(id);
      let data = response?.data || response;

      // Defensive: transform old array-of-arrays format
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
        data = data.map((rowArray: any[], idx: number) => ({
          rowLabel: String.fromCharCode(65 + idx),
          seats: rowArray.map((s: any, sIdx: number) => {
            const type =
              s.seatType === "standard" || s.seatType === "regular"
                ? "regular"
                : s.seatType === "aisle"
                ? "aisle"
                : s.seatType === "empty"
                ? "empty"
                : s.seatType || "space";
            const rowLabel = String.fromCharCode(65 + idx);
            return {
              label: s.seatLabel || s.coordinate?.coordinateLabel || "",
              rowLabel,
              seatCode:
                s.coordinate?.coordinateLabel ||
                `${rowLabel}${sIdx + 1}`,
              rowIndex: idx,
              columnIndex: sIdx,
              type,
              status: s.status || "active",
              priceType:
                s.priceType ||
                (type === "couple" ? "couple" : type === "vip" ? "vip" : "regular"),
              capacity:
                s.capacity ||
                (type === "couple" ? 2 : NON_SEAT_TYPES.includes(type) ? 0 : 1),
              size: s.size || (type === "couple" ? 2 : 1),
              coupleGroupId: s.coupleGroupId || null,
            };
          }),
        }));
      }

      // Ensure each seat has rowLabel
      if (Array.isArray(data)) {
        data = data.map((row: any) => ({
          ...row,
          seats: (row.seats || []).map((seat: any) => ({
            ...seat,
            rowLabel: seat.rowLabel || row.rowLabel,
          })),
        }));
      }

      setLayout(data || []);
    } catch (error) {
      console.error("Error fetching room layout:", error);
    } finally {
      setLoading(false);
    }
  };

  // ─── RECALCULATE ROW CODES ────────────────────────────────
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

  // ─── HANDLE SEAT CLICK (apply edit mode) ──────────────────
  const handleSeatClick = (rIdx: number, cIdx: number) => {
    if (isPreview) return;

    const newLayout = [...(layout || [])];
    const row = { ...newLayout[rIdx] };
    if (!row) return;

    const seats = [...(row.seats || [])];
    const seat = { ...seats[cIdx] };
    if (!seat) return;

    const rowLabel = row.rowLabel;

    if (NON_SEAT_TYPES.includes(editMode)) {
      // Converting to non-seat type
      seats[cIdx] = {
        ...seat,
        type: editMode,
        status: "active",
        capacity: 0,
        label: "",
        seatCode: "",
        coupleGroupId: null,
        size: 1,
        priceType: undefined,
        rowLabel,
      };
    } else if (editMode === "disabled") {
      seats[cIdx] = {
        ...seat,
        type: "disabled",
        status: "disabled",
        capacity: 0,
        coupleGroupId: null,
        size: 1,
        rowLabel,
      };
    } else {
      // regular, vip
      seats[cIdx] = {
        ...seat,
        type: editMode,
        status: "active",
        capacity: 1,
        priceType: editMode === "vip" ? "vip" : "regular",
        coupleGroupId: null,
        size: 1,
        rowLabel,
      };
    }

    row.seats = recalculateRowCodes(row.rowLabel, seats);
    newLayout[rIdx] = row;
    setLayout(newLayout);
  };

  // ─── GENERATE LAYOUT ─────────────────────────────────────
  const handleGenerateLayout = (rows: number, cols: number) => {
    const newLayout: RowData[] = [];
    for (let i = 0; i < rows; i++) {
      const rowLabel = String.fromCharCode(65 + i);
      const seats: Seat[] = [];
      for (let j = 0; j < cols; j++) {
        seats.push(createDefaultSeat(rowLabel, i, j, "regular"));
      }
      newLayout.push({
        rowLabel,
        seats: recalculateRowCodes(rowLabel, seats),
      });
    }
    setLayout(newLayout);
    setSelectedSeats([]);
    toast.success(`Đã tạo sơ đồ mới: ${rows} hàng × ${cols} cột`);
  };

  // ─── ADD ROW ──────────────────────────────────────────────
  const handleAddRow = () => {
    const rowsCount = layout?.length || 0;
    const nextRowLabel = String.fromCharCode(65 + rowsCount);
    const colsCount = layout[0]?.seats?.length || 10;

    const seats: Seat[] = Array.from({ length: colsCount }, (_, i) =>
      createDefaultSeat(nextRowLabel, rowsCount, i, "regular")
    );

    const newRow: RowData = {
      rowLabel: nextRowLabel,
      seats: recalculateRowCodes(nextRowLabel, seats),
    };
    setLayout([...layout, newRow]);
  };

  // ─── SAVE ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!roomId) return;
    setSaving(true);

    const finalLayout = layout.map((row) => ({
      ...row,
      seats: recalculateRowCodes(row.rowLabel, row.seats),
    }));

    try {
      await roomService.updateSeatLayout(roomId, finalLayout);
      setLayout(finalLayout);
      toast.success("Lưu sơ đồ ghế thành công!");
    } catch (error: any) {
      console.error("Save error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi lưu sơ đồ ghế";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── RESET ────────────────────────────────────────────────
  const handleReset = () => {
    if (roomId) {
      fetchRoomLayout(roomId);
      setSelectedSeats([]);
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] p-4 md:p-6 2xl:p-10">
      <PageMeta
        title="Thiết lập Sơ đồ ghế"
        description="Quản lý layout, loại ghế và lối đi cho từng phòng chiếu"
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Quản lý Sơ đồ ghế
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cấu hình layout, loại ghế và lối đi cho từng phòng chiếu
          </p>
        </div>
        <Button
          variant="outline"
          startIcon={<ArrowLeftOutlined />}
          onClick={() => navigate("/rooms")}
        >
          Quay lại danh sách phòng
        </Button>
      </div>

      <RoomSelector onRoomSelect={setRoomId} selectedRoomId={roomId} />

      {roomId ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 relative">
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          )}
          <div className="xl:col-span-3">
            <SeatLayoutEditor
              layout={layout}
              setLayout={setLayout}
              onSeatClick={handleSeatClick}
              isPreview={isPreview}
              numberingDirection={numberingDirection}
              selectedSeats={selectedSeats}
              setSelectedSeats={setSelectedSeats}
              editMode={editMode}
            />
          </div>
          <div className="xl:col-span-1">
            <SeatToolbar
              editMode={editMode}
              setEditMode={setEditMode}
              onSave={handleSave}
              onReset={handleReset}
              onPreview={() => setIsPreview(!isPreview)}
              isPreview={isPreview}
              onAddRow={handleAddRow}
              onGenerate={handleGenerateLayout}
              numberingDirection={numberingDirection}
              setNumberingDirection={setNumberingDirection}
              saving={saving}
              layout={layout}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-20 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-2">
            Chưa chọn phòng chiếu
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Vui lòng chọn Rạp và Phòng chiếu ở trên để bắt đầu cấu hình sơ đồ
            ghế.
          </p>
        </div>
      )}
    </div>
  );
};

export default SeatLayoutSettingsPage;
