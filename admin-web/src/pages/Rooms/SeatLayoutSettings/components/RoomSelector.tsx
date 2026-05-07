import React, { useEffect, useState } from "react";
import { cinemaService } from "../../../../services/cinemaService";
import { roomService } from "../../../../services/roomService";
import Select from "../../../../components/form/Select";

interface RoomSelectorProps {
  onRoomSelect: (roomId: string) => void;
  selectedRoomId?: string;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({ onRoomSelect, selectedRoomId }) => {
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingCinemas, setLoadingCinemas] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>();

  useEffect(() => {
    const fetchCinemas = async () => {
      setLoadingCinemas(true);
      try {
        const response = await cinemaService.getCinemas();
        const items = response?.data?.items || response?.items || [];
        setCinemas(items);
      } catch (error) {
        console.error("Error fetching cinemas:", error);
      } finally {
        setLoadingCinemas(false);
      }
    };
    fetchCinemas();
  }, []);

  const handleCinemaChange = async (cinemaId: string) => {
    setSelectedCinemaId(cinemaId);
    setRooms([]);
    setLoadingRooms(true);
    try {
      const response = await roomService.getRooms({ cinemaId });
      const items = response?.data?.items || response?.items || [];
      setRooms(items);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoadingRooms(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-6">
      <div className="flex flex-col sm:flex-row gap-6 items-end">
        <div className="w-full sm:w-1/3">
          <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-white/90">
            Chọn Rạp Chiếu:
          </label>
          <Select
            placeholder={loadingCinemas ? "Đang tải..." : "Chọn rạp..."}
            onChange={handleCinemaChange}
            value={selectedCinemaId}
            options={cinemas.map(c => ({ value: c._id, label: c.name }))}
            disabled={loadingCinemas}
          />
        </div>

        <div className="w-full sm:w-1/3">
          <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-white/90">
            Chọn Phòng Chiếu:
          </label>
          <Select
            placeholder={loadingRooms ? "Đang tải..." : (selectedCinemaId ? "Chọn phòng..." : "Vui lòng chọn rạp trước")}
            disabled={!selectedCinemaId || loadingRooms}
            onChange={onRoomSelect}
            value={selectedRoomId || ""}
            options={rooms.map(r => ({ value: r._id, label: r.name }))}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomSelector;
