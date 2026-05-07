import { useState, useEffect } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import RoomSelector from "./components/RoomSelector";
import SeatToolbar, { SeatType } from "./components/SeatToolbar";
import SeatLayoutEditor from "./components/SeatLayoutEditor";
import { roomService } from "../../../services/roomService";
import Button from "../../../components/ui/button/Button";
import toast from "react-hot-toast";

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

interface RowData {
  rowLabel: string;
  seats: Seat[];
}

const SeatLayoutSettingsPage = () => {
  const { roomId: urlRoomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roomId, setRoomId] = useState<string | undefined>(urlRoomId);
  const [layout, setLayout] = useState<RowData[]>([]);
  const [numberingDirection, setNumberingDirection] = useState<"ltr" | "rtl">("ltr");

  useEffect(() => {
    if (layout.length > 0) {
      const newLayout = layout.map(row => ({
        ...row,
        seats: recalculateRowCodes(row.rowLabel, row.seats)
      }));
      // Only update if changed to avoid loops
      if (JSON.stringify(newLayout) !== JSON.stringify(layout)) {
        setLayout(newLayout);
      }
    }
  }, [numberingDirection]);
  const [editMode, setEditMode] = useState<SeatType>("regular");
  const [isPreview, setIsPreview] = useState(false);

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
      
      // Defensive check: If data is old Array-of-Arrays format, transform it
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
        data = data.map((rowArray: any[], idx: number) => ({
          rowLabel: String.fromCharCode(65 + idx),
          seats: rowArray.map((s: any, sIdx: number) => {
            const type = (s.seatType === 'standard' || s.seatType === 'regular') ? 'regular' : (s.seatType === 'aisle' || s.seatType === 'empty' ? 'space' : s.seatType);
            return {
              label: s.seatLabel || s.coordinate?.coordinateLabel,
              seatCode: s.coordinate?.coordinateLabel || `${String.fromCharCode(65 + idx)}${sIdx + 1}`,
              rowIndex: idx,
              columnIndex: sIdx,
              type: type,
              status: s.status || 'active',
              priceType: s.priceType || (type === 'couple' ? 'couple' : (type === 'vip' ? 'vip' : 'regular')),
              capacity: s.capacity || (type === 'couple' ? 2 : (type === 'space' ? 0 : 1)),
              size: s.size || 1,
              coupleGroupId: s.coupleGroupId || null
            };
          })
        }));
      }

      setLayout(data || []);
    } catch (error) {
      console.error("Error fetching room layout:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (rIdx: number, cIdx: number) => {
    if (isPreview) return;

    const newLayout = [...(layout || [])];
    const row = { ...newLayout[rIdx] };
    if (!row) return;
    
    const seats = [...(row.seats || [])];
    const seat = { ...seats[cIdx] };
    if (!seat) return;

    // Apply new type or status
    if (editMode === "disabled") {
      seats[cIdx] = { ...seat, status: "disabled", type: "disabled", capacity: 0, coupleGroupId: null };
    } else if (editMode === "space") {
      seats[cIdx] = { ...seat, type: "space", status: "active", capacity: 0, label: "", coupleGroupId: null };
    } else if (editMode === "couple") {
      // If setting to couple, we might need to pair it with next seat or just mark it
      // For now, let's just mark it and a simple ID
      const groupId = `GRP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      seats[cIdx] = { ...seat, type: "couple", status: "active", capacity: 2, priceType: "couple", coupleGroupId: groupId };
    } else {
      seats[cIdx] = { ...seat, type: editMode, status: "active", capacity: 1, priceType: editMode === "vip" ? "vip" : "regular", coupleGroupId: null };
    }

    row.seats = recalculateRowCodes(row.rowLabel, seats);
    newLayout[rIdx] = row;
    setLayout(newLayout);
  };

  const recalculateRowCodes = (label: string, seats: Seat[]): Seat[] => {
    const saleableSeats = (seats || []).filter(s => s && s.type !== "space");
    const count = saleableSeats.length;
    
    let currentNum = numberingDirection === "ltr" ? 1 : count;
    const step = numberingDirection === "ltr" ? 1 : -1;

    return (seats || []).map((seat, idx) => {
      if (!seat) return seat;
      
      const updatedSeat = { ...seat, columnIndex: idx };

      if (seat.type === "space") {
        updatedSeat.label = "";
        updatedSeat.capacity = 0;
        return updatedSeat;
      }

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

      updatedSeat.seatCode = `${label}${idx + 1}`;
      return updatedSeat;
    });
  };

  const handleGenerateLayout = (rows: number, cols: number) => {
    const newLayout: RowData[] = [];
    for (let i = 0; i < rows; i++) {
      const rowLabel = String.fromCharCode(65 + i);
      const seats: Seat[] = [];
      for (let j = 0; j < cols; j++) {
        seats.push({
          label: `${rowLabel}${j + 1}`,
          seatCode: `${rowLabel}${j + 1}`,
          rowIndex: i,
          columnIndex: j,
          type: "regular",
          status: "active",
          priceType: "regular",
          capacity: 1,
          size: 1,
          coupleGroupId: null
        });
      }
      newLayout.push({ rowLabel, seats });
    }
    setLayout(newLayout);
    toast.success(`Đã tạo sơ đồ mới: ${rows} hàng x ${cols} cột`);
  };

  const handleAddRow = () => {
    const rowsCount = layout?.length || 0;
    const nextRowLabel = String.fromCharCode(65 + rowsCount);
    const colsCount = layout[0]?.seats?.length || 10;
    
    const newRow: RowData = {
      rowLabel: nextRowLabel,
      seats: Array.from({ length: colsCount }, (_, i) => ({
        label: `${nextRowLabel}${i + 1}`,
        seatCode: `${nextRowLabel}${i + 1}`,
        rowIndex: rowsCount,
        columnIndex: i,
        type: "regular",
        status: "active",
        priceType: "regular",
        capacity: 1,
        size: 1,
        coupleGroupId: null
      }))
    };
    setLayout([...layout, newRow]);
  };

  const handleSave = async () => {
    if (!roomId) return;
    setSaving(true);
    
    // Final recalculation to ensure consistency
    const finalLayout = layout.map(row => ({
      ...row,
      seats: recalculateRowCodes(row.rowLabel, row.seats)
    }));

    try {
      await roomService.updateSeatLayout(roomId, finalLayout);
      setLayout(finalLayout);
      toast.success("Lưu sơ đồ ghế thành công!");
    } catch (error: any) {
      console.error("Save error:", error);
      const msg = error.response?.data?.message || error.message || "Lỗi khi lưu sơ đồ ghế";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (roomId) {
      fetchRoomLayout(roomId);
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
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          )}
          <div className="xl:col-span-3">
            <SeatLayoutEditor 
              layout={layout} 
              setLayout={setLayout} 
              onSeatClick={handleSeatClick}
              isPreview={isPreview}
              numberingDirection={numberingDirection}
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
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-20 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-2">Chưa chọn phòng chiếu</h3>
          <p className="text-gray-500 dark:text-gray-400">Vui lòng chọn Rạp và Phòng chiếu ở trên để bắt đầu cấu hình sơ đồ ghế.</p>
        </div>
      )}
    </div>
  );
};

export default SeatLayoutSettingsPage;

