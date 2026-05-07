import React from "react";
import Button from "../../../../components/ui/button/Button";
import { 
  UserOutlined, 
  CrownOutlined, 
  HeartOutlined, 
  ColumnWidthOutlined, 
  StopOutlined,
  SaveOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  PlusOutlined,
  LockOutlined,
  TableOutlined
} from "@ant-design/icons";
import InputField from "../../../../components/form/input/InputField";

export type SeatType = "regular" | "vip" | "couple" | "disabled" | "space";

export const SEAT_TYPE_CONFIG: Record<SeatType, { label: string; color: string; icon: any }> = {
  regular: { label: "Thường", color: "#4f46e5", icon: <UserOutlined /> }, // Indigo
  vip: { label: "VIP", color: "#fbbf24", icon: <CrownOutlined /> }, // Amber/Gold
  couple: { label: "Couple", color: "#f472b6", icon: <HeartOutlined /> }, // Pink
  disabled: { label: "Hỏng/Khoá", color: "#ef4444", icon: <LockOutlined /> },
  space: { label: "Khoảng trống", color: "#f1f5f9", icon: <ColumnWidthOutlined /> },
};

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
  saving
}) => {
  const [rows, setRows] = React.useState(10);
  const [cols, setCols] = React.useState(12);

  const handleGenerate = () => {
    onGenerate(rows, cols);
  };
  return (
    <div className="space-y-6">
      {/* Editor Tools */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">Công cụ chỉnh sửa</h3>
        
        <div className="mb-6">
          <label className="mb-3 block text-sm font-medium text-gray-800 dark:text-white/90">
            Loại ghế / Đối tượng:
          </label>
          <div className="flex flex-col gap-2">
            {Object.entries(SEAT_TYPE_CONFIG).map(([type, cfg]) => {
              const isSelected = editMode === type;
              return (
                <button
                  key={type}
                  onClick={() => setEditMode(type as SeatType)}
                  disabled={isPreview}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                    isSelected 
                      ? "border-brand-500 bg-brand-50/50 text-brand-600 dark:border-brand-500/50 dark:bg-brand-500/10 dark:text-brand-400" 
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/[0.03]"
                  } ${isPreview ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span className="text-lg" style={{ color: cfg.color === "transparent" ? "#94a3b8" : cfg.color }}>{cfg.icon}</span> 
                  <span className="font-medium">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="h-px w-full bg-gray-200 dark:bg-gray-800 my-5"></div>
        
        <div className="space-y-3">
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

        <div className="h-px w-full bg-gray-200 dark:bg-gray-800 my-5"></div>

        <div>
          <label className="mb-3 block text-sm font-medium text-gray-800 dark:text-white/90">
            Khởi tạo nhanh (Grid):
          </label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Số hàng</label>
              <InputField 
                type="number" 
                value={rows} 
                onChange={(e) => setRows(Number(e.target.value))} 
                min={1} 
                className="h-9"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Số cột</label>
              <InputField 
                type="number" 
                value={cols} 
                onChange={(e) => setCols(Number(e.target.value))} 
                min={1} 
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

        <div className="h-px w-full bg-gray-200 dark:bg-gray-800 my-5"></div>

        <div>
          <label className="mb-3 block text-sm font-medium text-gray-800 dark:text-white/90">
            Hướng đánh số ghế:
          </label>
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => setNumberingDirection("ltr")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                numberingDirection === "ltr" 
                  ? "bg-white dark:bg-gray-700 shadow-sm text-brand-600 dark:text-brand-400" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Trái → Phải
            </button>
            <button
              onClick={() => setNumberingDirection("rtl")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                numberingDirection === "rtl" 
                  ? "bg-white dark:bg-gray-700 shadow-sm text-brand-600 dark:text-brand-400" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Phải → Trái
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] space-y-3">
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
      </div>

      {/* Instructions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">Hướng dẫn</h3>
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2 leading-relaxed">
          <p>• Chọn loại ghế ở trên, sau đó click vào ô trong sơ đồ để áp dụng.</p>
          <p>• <strong className="text-gray-700 dark:text-gray-300">Couple:</strong> Ghế đôi chiếm diện tích gấp đôi, sức chứa 2 người.</p>
          <p>• <strong className="text-gray-700 dark:text-gray-300">Khoảng trống:</strong> Tạo khoảng trống hoặc lối đi không có số ghế.</p>
          <p>• <strong className="text-gray-700 dark:text-gray-300">Nhãn ghế:</strong> Sẽ tự động đánh lại khi bạn thêm ghế mới.</p>
        </div>
      </div>
    </div>
  );
};

export default SeatToolbar;
