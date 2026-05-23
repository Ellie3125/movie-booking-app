import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Button, 
  Space, 
  Card, 
  Divider, 
  message, 
  Spin, 
  Radio, 
  Tooltip, 
  Typography,
  Empty,
} from "antd";
import { 
  SaveOutlined, 
  ArrowLeftOutlined, 
  PlusOutlined, 
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  UserOutlined,
  CrownOutlined,
  HeartOutlined,
  StopOutlined
} from "@ant-design/icons";
import { roomService } from "../../services/roomService";
import { cinemaService } from "../../services/cinemaService";
import PageMeta from "../../components/common/PageMeta";

const { Title, Text } = Typography;

type SeatType = "regular" | "vip" | "couple" | "space";

interface Seat {
  seatCode: string;
  rowIndex: number;
  columnIndex: number;
  type: SeatType;
  status: "active" | "disabled";
  priceLevel: string;
  coupleGroupId: string | null;
}

interface Row {
  rowLabel: string;
  seats: Seat[];
}

const SEAT_TYPE_CONFIG: Record<SeatType, { label: string; color: string; icon: any }> = {
  regular: { label: "Thường", color: "#64748b", icon: <UserOutlined /> },
  vip: { label: "VIP", color: "#f59e0b", icon: <CrownOutlined /> },
  couple: { label: "Couple", color: "#ec4899", icon: <HeartOutlined /> },
  space: { label: "Khoảng trống", color: "transparent", icon: <StopOutlined /> },
};

export default function SeatLayout() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [cinema, setCinema] = useState<any>(null);
  const [layout, setLayout] = useState<Row[]>([]);
  const [editMode, setEditMode] = useState<SeatType>("regular");
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!roomId) return;
      setLoading(true);
      try {
        const roomData = await roomService.getRoomById(roomId);
        setRoom(roomData.data);
        
        const cinemaData = await cinemaService.getCinemas();
        const foundCinema = cinemaData.data?.items.find((c: any) => c._id === roomData.data.cinemaId);
        setCinema(foundCinema);
        
        setLayout(roomData.data.seatLayout || []);
      } catch (error) {
        message.error("Lỗi khi tải dữ liệu phòng");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roomId]);

  const handleSave = async () => {
    if (!roomId) return;
    setSaving(true);
    try {
      await roomService.updateSeatLayout(roomId, layout);
      message.success("Lưu sơ đồ ghế thành công");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi lưu sơ đồ ghế");
    } finally {
      setSaving(false);
    }
  };

  const updateSeat = (rowIndex: number, colIndex: number, updates: Partial<Seat>) => {
    const newLayout = [...layout];
    const row = { ...newLayout[rowIndex] };
    const seats = [...row.seats];
    const seat = { ...seats[colIndex], ...updates };
    
    // Auto handle couple logic if type changes
    if (updates.type && updates.type !== "couple" && seat.coupleGroupId) {
      // Split couple if type changed from couple to something else
      const groupId = seat.coupleGroupId;
      seat.coupleGroupId = null;
      // Also update the partner
      seats.forEach((s, idx) => {
        if (s.coupleGroupId === groupId && idx !== colIndex) {
          seats[idx] = { ...s, coupleGroupId: null, type: "regular" };
        }
      });
    }

    seats[colIndex] = seat;
    row.seats = seats;
    newLayout[rowIndex] = row;
    setLayout(newLayout);
  };

  const handleSeatClick = (rowIndex: number, colIndex: number) => {
    if (isPreview) return;
    
    if (editMode === "couple") {
      updateSeat(rowIndex, colIndex, { type: "couple", coupleGroupId: `COUPLE_${Date.now()}` });
      return;
    }

    updateSeat(rowIndex, colIndex, { type: editMode });
  };

  const addRow = () => {
    const nextRowLabel = String.fromCharCode(65 + layout.length);
    const newRow: Row = {
      rowLabel: nextRowLabel,
      seats: Array.from({ length: layout[0]?.seats.length || 10 }, (_, i) => ({
        seatCode: `${nextRowLabel}${i + 1}`,
        rowIndex: layout.length,
        columnIndex: i,
        type: "regular",
        status: "active",
        priceLevel: "regular",
        coupleGroupId: null
      }))
    };
    setLayout([...layout, newRow]);
  };

  const deleteRow = (idx: number) => {
    setLayout(layout.filter((_, i) => i !== idx));
  };

  const addSeatToRow = (rowIndex: number) => {
    const newLayout = [...layout];
    const row = { ...newLayout[rowIndex] };
    const nextColIndex = row.seats.length;
    row.seats = [...row.seats, {
      seatCode: `${row.rowLabel}${nextColIndex + 1}`,
      rowIndex: rowIndex,
      columnIndex: nextColIndex,
      type: "regular",
      status: "active",
      priceLevel: "regular",
      coupleGroupId: null
    }];
    newLayout[rowIndex] = row;
    setLayout(newLayout);
  };

  const removeSeatFromRow = (rowIndex: number) => {
    const newLayout = [...layout];
    const row = { ...newLayout[rowIndex] };
    if (row.seats.length > 0) {
      row.seats = row.seats.slice(0, -1);
      newLayout[rowIndex] = row;
      setLayout(newLayout);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Spin size="large" tip="Đang tải dữ liệu..." /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageMeta 
        title={`Cấu hình ghế - ${room?.name}`} 
        description={`Thiết lập sơ đồ ghế cho phòng ${room?.name} tại ${cinema?.name}`}
      />
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/rooms")} className="mb-2">Quay lại</Button>
          <Title level={3} className="m-0">Thiết lập Sơ đồ ghế: {room?.name}</Title>
          <Text type="secondary">{cinema?.name} • <span className="uppercase">{room?.roomType}</span></Text>
        </div>
        <Space>
          <Button 
            type={isPreview ? "primary" : "default"} 
            icon={isPreview ? <EditOutlined /> : <EyeOutlined />}
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? "Chế độ Chỉnh sửa" : "Xem trước (Preview)"}
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSave} 
            loading={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            Lưu sơ đồ
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Toolbar */}
        {!isPreview && (
          <div className="lg:col-span-1 space-y-4">
            <Card title="Công cụ chỉnh sửa" size="small" className="shadow-sm">
              <div className="mb-4">
                <Text strong className="block mb-2">Loại ghế đang chọn:</Text>
                <Radio.Group 
                  value={editMode} 
                  onChange={(e) => setEditMode(e.target.value)}
                  className="flex flex-col gap-2"
                >
                  {Object.entries(SEAT_TYPE_CONFIG).map(([type, cfg]) => (
                    <Radio.Button key={type} value={type} className="w-full h-10 flex items-center gap-2">
                      <span style={{ color: cfg.color }}>{cfg.icon}</span> {cfg.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>
              <Divider />
              <div className="space-y-2">
                <Button block icon={<PlusOutlined />} onClick={addRow}>Thêm hàng ghế</Button>
              </div>
            </Card>

            <Card title="Chú thích" size="small" className="shadow-sm">
               <div className="space-y-3">
                  {Object.entries(SEAT_TYPE_CONFIG).map(([type, cfg]) => (
                    <div key={type} className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center text-white text-xs"
                        style={{ 
                          backgroundColor: cfg.color === "transparent" ? "#fff" : cfg.color,
                          border: cfg.color === "transparent" ? "1px dashed #d9d9d9" : "none",
                          color: cfg.color === "#f1f5f9" ? "#64748b" : "white"
                        }}
                      >
                        {cfg.color !== "transparent" && cfg.icon}
                      </div>
                      <Text className="text-sm">{cfg.label}</Text>
                    </div>
                  ))}
               </div>
            </Card>
          </div>
        )}

        {/* Editor Area */}
        <div className={isPreview ? "lg:col-span-4" : "lg:col-span-3"}>
          <Card className="shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
            <div className="bg-gray-800 p-4 text-center">
              <div className="w-3/4 h-2 bg-gray-600 mx-auto rounded-full mb-2"></div>
              <Text className="text-gray-400 uppercase tracking-widest text-xs font-bold">MÀN HÌNH CHÍNH</Text>
            </div>
            
            <div className="p-8 overflow-auto flex flex-col items-center min-h-[500px]">
              {layout.length === 0 ? (
                <Empty description="Chưa có dữ liệu sơ đồ ghế" />
              ) : (
                <div className="inline-block">
                  {layout.map((row, rIdx) => (
                    <div key={rIdx} className="flex items-center mb-3 group">
                      <div className="w-10 h-8 flex items-center justify-center font-bold text-gray-500 mr-4">
                        {row.rowLabel}
                      </div>
                      
                      <div className="flex gap-2">
                        {row.seats.map((seat, cIdx) => {
                          const config = SEAT_TYPE_CONFIG[seat.type];

                          return (
                            <div key={cIdx} className={`${seat.type === "space" ? "w-8 h-8" : ""}`}>
                              {seat.type !== "space" && (
                                <Tooltip title={seat.seatCode}>
                                  <div
                                    onClick={() => handleSeatClick(rIdx, cIdx)}
                                    className={`
                                      relative h-8 flex items-center justify-center cursor-pointer transition-all hover:scale-110 rounded
                                      ${seat.type === "couple" ? "w-[72px]" : "w-8"}
                                    `}
                                    style={{
                                      backgroundColor: config.color,
                                      border: "none",
                                      color: "white",
                                      boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.2)"
                                    }}
                                  >
                                    <span className="text-[10px] font-bold">
                                      {seat.type === "couple" ? "COUPLE" : seat.seatCode}
                                    </span>
                                  </div>
                                </Tooltip>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {!isPreview && (
                        <div className="ml-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="small" icon={<PlusOutlined />} onClick={() => addSeatToRow(rIdx)} />
                          <Button size="small" icon={<DeleteOutlined />} onClick={() => removeSeatFromRow(rIdx)} danger />
                          <Divider type="vertical" />
                          <Button size="small" icon={<DeleteOutlined />} onClick={() => deleteRow(rIdx)} danger type="text">Xoá hàng</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 border-t text-center">
              <Text type="secondary" className="text-xs italic">Click vào ghế để áp dụng mode chỉnh sửa. Chế độ Preview sẽ ẩn các công cụ quản lý.</Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
