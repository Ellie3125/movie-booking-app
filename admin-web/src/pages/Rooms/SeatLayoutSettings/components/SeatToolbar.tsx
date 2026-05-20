import React from "react";
import Button from "../../../../components/ui/button/Button";
import {
  SaveOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  PlusOutlined,
  TableOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import InputField from "../../../../components/form/input/InputField";
import {
  SeatType,
  RowData,
  SEAT_TYPE_CONFIG,
  SELLABLE_TYPES,
} from "../types";

interface SeatToolbarProps {
  editMode: SeatType;
  setEditMode: (mode: SeatType) => void;
  onSave: () => void;
  onReset: () => void;
  onPreview: () => void;
  isPreview: boolean;
  onAddRow: () => void;
  onGenerate: (rows: number, cols: number) => void;
  numberingDirection: "ltr" | "rtl";
  setNumberingDirection: (dir: "ltr" | "rtl") => void;
  saving: boolean;
  layout: RowData[];
}

const SeatToolbar: React.FC<SeatToolbarProps> = ({
  editMode,
  setEditMode,
  onSave,
  onReset,
  onPreview,
  isPreview,
  onAddRow,
  onGenerate,
  numberingDirection,
  setNumberingDirection,
  saving,
  layout,
}) => {
  const [rows, setRows] = React.useState(8);
  const [cols, setCols] = React.useState(12);

  const handleGenerate = () => {
    onGenerate(rows, cols);
  };

  // ─── EXPORT JSON ──────────────────────────────────────────
  const handleExportJSON = () => {
    const exportData = {
      seatLayout: (layout || []).map((row) => ({
        rowLabel: row.rowLabel,
        seats: row.seats.map((seat) => ({
          label: seat.label || "",
          rowLabel: seat.rowLabel || row.rowLabel,
          seatCode: seat.seatCode || "",
          rowIndex: seat.rowIndex,
          columnIndex: seat.columnIndex,
          type: seat.type,
          status: seat.status || "active",
          priceType: seat.priceType || "regular",
          capacity: seat.capacity ?? 1,
          size: seat.size ?? 1,
          coupleGroupId: seat.coupleGroupId || null,
        })),
      })),
    };

    console.log("📋 Exported seatLayout JSON:", JSON.stringify(exportData, null, 2));

    // Download as file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `seat-layout-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ─── SEAT STATISTICS ─────────────────────────────────────
  const seatStats = React.useMemo<Record<string, number>>(() => {
    const stats: Record<string, number> = {};
    let totalActive = 0;

    (layout || []).forEach((row) => {
      row.seats.forEach((seat) => {
        stats[seat.type] = (stats[seat.type] || 0) + 1;
        if (
          SELLABLE_TYPES.includes(seat.type as SeatType) &&
          seat.status === "active"
        ) {
          totalActive += seat.capacity || 0;
        }
      });
    });

    stats._totalActive = totalActive;
    return stats;
  }, [layout]);

  const allTypes: SeatType[] = [
    "regular",
    "vip",
    "couple",
    "disabled",
    "space",
  ];

  return (
    <div className="space-y-5">
      {/* ─── EDITOR TOOLS ────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
          Công cụ chỉnh sửa
        </h3>

        {/* Seat type palette */}
        <div className="mb-5">
          <label className="mb-2.5 block text-sm font-medium text-gray-800 dark:text-white/90">
            Loại ghế / Đối tượng:
          </label>
          <div className="flex flex-col gap-1.5">
            {allTypes.map((type) => {
              const cfg = SEAT_TYPE_CONFIG[type];
              const isSelected = editMode === type;
              const count = seatStats[type] || 0;

              return (
                <button
                  key={type}
                  onClick={() => setEditMode(type)}
                  disabled={isPreview}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg border text-sm transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/50 text-blue-600 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/[0.03]"
                  } ${isPreview ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className="text-base flex-shrink-0 w-5 text-center"
                    style={{
                      color:
                        cfg.color === "transparent" ? "#94a3b8" : cfg.color,
                    }}
                  >
                    {cfg.icon}
                  </span>
                  <span className="font-medium flex-1 text-left">{cfg.label}</span>
                  {count > 0 && (
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full font-mono">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px w-full bg-gray-200 dark:bg-gray-800 my-4" />

        {/* Quick actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            startIcon={<PlusOutlined />}
            onClick={onAddRow}
            disabled={isPreview}
            className="w-full"
          >
            Thêm hàng mới
          </Button>
          <Button
            variant="outline"
            startIcon={<ReloadOutlined />}
            onClick={onReset}
            disabled={isPreview}
            className="w-full"
          >
            Đặt lại mặc định
          </Button>
        </div>

        <div className="h-px w-full bg-gray-200 dark:bg-gray-800 my-4" />

        {/* Quick generate */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-white/90">
            Khởi tạo nhanh:
          </label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">
                Số hàng
              </label>
              <InputField
                type="number"
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                min={1}
                max={26}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">
                Số cột
              </label>
              <InputField
                type="number"
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
                min={1}
                max={30}
                className="h-9"
              />
            </div>
          </div>
          <Button
            variant="outline"
            startIcon={<TableOutlined />}
            onClick={handleGenerate}
            disabled={isPreview}
            className="w-full text-xs"
          >
            Tạo sơ đồ lưới
          </Button>
        </div>

        <div className="h-px w-full bg-gray-200 dark:bg-gray-800 my-4" />

        {/* Naming direction */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-white/90">
            Hướng đánh số ghế:
          </label>
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => setNumberingDirection("ltr")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                numberingDirection === "ltr"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Trái → Phải
            </button>
            <button
              onClick={() => setNumberingDirection("rtl")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                numberingDirection === "rtl"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Phải → Trái
            </button>
          </div>
        </div>
      </div>

      {/* ─── ACTIONS ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] space-y-2">
        <Button
          variant={isPreview ? "primary" : "outline"}
          startIcon={isPreview ? <EditOutlined /> : <EyeOutlined />}
          onClick={onPreview}
          className="w-full"
        >
          {isPreview ? "Chế độ Chỉnh sửa" : "Xem trước (Preview)"}
        </Button>
        <Button
          variant="success"
          startIcon={<SaveOutlined />}
          onClick={onSave}
          disabled={isPreview || saving}
          className="w-full"
        >
          {saving ? "Đang lưu..." : "Lưu sơ đồ"}
        </Button>
        <Button
          variant="outline"
          startIcon={<DownloadOutlined />}
          onClick={handleExportJSON}
          disabled={!layout || layout.length === 0}
          className="w-full"
        >
          Xuất JSON
        </Button>
      </div>




      {/* ─── INSTRUCTIONS ────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">
          Hướng dẫn
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2 leading-relaxed">
          <p>
            • Chọn loại ghế ở trên, sau đó click vào ô trong sơ đồ để áp dụng.
          </p>
          <p>
            •{" "}
            <strong className="text-gray-700 dark:text-gray-300">
              Ghép Couple:
            </strong>{" "}
            Click chọn 2 ghế liền kề cùng hàng → nút "Ghép couple" sẽ xuất hiện.
          </p>
          <p>
            •{" "}
            <strong className="text-gray-700 dark:text-gray-300">
              Tách Couple:
            </strong>{" "}
            Click vào ghế couple → nút "Tách ghế" sẽ xuất hiện.
          </p>
          <p>
            •{" "}
            <strong className="text-gray-700 dark:text-gray-300">
              Khoảng trống / Lối đi:
            </strong>{" "}
            Tạo khoảng trống hoặc lối đi không có số ghế.
          </p>
          <p>
            •{" "}
            <strong className="text-gray-700 dark:text-gray-300">
              Nhãn ghế:
            </strong>{" "}
            Sẽ tự động đánh lại khi bạn thêm/xoá ghế.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeatToolbar;
