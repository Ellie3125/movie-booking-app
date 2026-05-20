import React, { useEffect, useState } from "react";
import { cinemaService } from "../../../../services/cinemaService";
import { roomService } from "../../../../services/roomService";
import { metaService } from "../../../../services/metaService";
import Select from "../../../../components/form/Select";
import toast from "react-hot-toast";

interface RoomSelectorProps {
  onRoomSelect: (roomId: string) => void;
  selectedRoomId?: string;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({ onRoomSelect, selectedRoomId }) => {
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>();

  const [loadingCinemas, setLoadingCinemas] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Load Metadata
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await metaService.getCinemaOptions();
        const data = response?.data || response;
        setBrands(data.brands || []);
        setCities(data.provinces || []);
      } catch (error) {
        console.error("Error fetching metadata:", error);
        toast.error("Không thể tải thông tin Thành phố/Hãng rạp");
      }
    };
    loadMetadata();
  }, []);

  // Fetch Cinemas based on filters
  useEffect(() => {
    const fetchCinemas = async () => {
      setLoadingCinemas(true);
      try {
        const params: any = {};
        if (selectedBrand) params.brand = selectedBrand;
        if (selectedCity) params.city = selectedCity;
        
        const response = await cinemaService.getCinemas(params);
        const items = response?.data?.items || response?.items || [];
        setCinemas(items);
        
        // Reset cinema and rooms if filters change
        if (selectedCinemaId && !items.find((c: any) => c._id === selectedCinemaId)) {
          setSelectedCinemaId(undefined);
          setRooms([]);
        }
      } catch (error) {
        console.error("Error fetching cinemas:", error);
      } finally {
        setLoadingCinemas(false);
      }
    };
    fetchCinemas();
  }, [selectedBrand, selectedCity]);

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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="w-full lg:w-1/4">
          <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-white/90">
            Chọn Thành phố:
          </label>
          <Select
            placeholder="Tất cả thành phố"
            onChange={setSelectedCity}
            value={selectedCity}
            options={[{ value: "", label: "Tất cả thành phố" }, ...cities.map(c => ({ value: c, label: c }))]}
          />
        </div>

        <div className="w-full lg:w-1/4">
          <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-white/90">
            Chọn Hãng Rạp:
          </label>
          <Select
            placeholder="Tất cả hãng"
            onChange={setSelectedBrand}
            value={selectedBrand}
            options={[{ value: "", label: "Tất cả hãng" }, ...brands.map(b => ({ value: b.code, label: b.name }))]}
          />
        </div>

        <div className="w-full lg:w-1/4">
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

        <div className="w-full lg:w-1/4">
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
