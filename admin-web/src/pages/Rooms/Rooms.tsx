import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { roomService } from "../../services/roomService";
import { cinemaService } from "../../services/cinemaService";
import { metaService } from "../../services/metaService";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Label from "../../components/form/Label";
import { ConfirmationModal } from "../../components/ui/modal/ConfirmationModal";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/modal";

type RoomFormData = {
  name: string;
  cinemaId: string;
  roomType: string;
  totalRows: number;
  totalColumns: number;
};

export default function Rooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<RoomFormData>({
    defaultValues: {
      name: "",
      cinemaId: "",
      roomType: "standard",
      totalRows: 10,
      totalColumns: 12,
    },
  });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const cinemaOpts = await metaService.getCinemaOptions();
        setBrands(cinemaOpts.data?.brands || []);
        setCities(cinemaOpts.data?.provinces || []);
      } catch (error: any) {
        toast.error("Lỗi khi tải metadata");
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadCinemas = async () => {
      try {
        const params: any = {};
        if (selectedBrand) params.brand = selectedBrand;
        if (selectedCity) params.city = selectedCity;
        const cinemasData = await cinemaService.getCinemas(params);
        setCinemas(cinemasData.data?.items || []);
        setSelectedCinemaId(""); // Reset cinema when filters change
      } catch (error: any) {
        toast.error("Lỗi khi tải danh sách rạp");
      }
    };
    loadCinemas();
  }, [selectedBrand, selectedCity]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await roomService.getRooms({ cinemaId: selectedCinemaId || undefined });
      setRooms(data.data?.items || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [selectedCinemaId]);

  const handleEdit = (room: any) => {
    reset({
      name: room.name,
      cinemaId: room.cinemaId,
      roomType: room.roomType,
      totalRows: room.totalRows,
      totalColumns: room.totalColumns,
    });
    setEditingId(room._id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!deletingId) return;
    try {
      await roomService.deleteRoom(deletingId);
      toast.success("Xoá phòng chiếu thành công");
      loadRooms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xoá phòng chiếu");
    } finally {
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const onSubmit = async (formData: RoomFormData) => {
    try {
      if (editingId) {
        await roomService.updateRoom(editingId, formData);
        toast.success("Cập nhật phòng thành công");
      } else {
        const response = await roomService.createRoom(formData);
        toast.success("Thêm phòng mới thành công");
        // Redirect to layout settings
        const newRoom = response?.data || response;
        if (newRoom?._id) {
          window.location.href = `/rooms/${newRoom._id}/layout`;
        }
      }
      setIsModalOpen(false);
      loadRooms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu phòng");
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cinemas.find(c => c._id === room.cinemaId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageMeta title="Quản lý Phòng Chiếu" description="Danh sách phòng chiếu phim" />
      <PageBreadCrumb pageTitle="Quản lý Phòng Chiếu" />
      
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between bg-white p-5 rounded-2xl border border-gray-200 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 max-w-sm">
            <Label>Tìm kiếm</Label>
            <Input
              placeholder="Tìm tên phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-44">
            <Label>Thành phố</Label>
            <Select
              options={[{ value: "", label: "Tất cả thành phố" }, ...cities.map(c => ({ value: c, label: c }))]}
              value={selectedCity}
              onChange={(val) => setSelectedCity(val)}
            />
          </div>
          <div className="w-full sm:w-44">
            <Label>Hãng</Label>
            <Select
              options={[{ value: "", label: "Tất cả hãng" }, ...brands.map(b => ({ value: b.code, label: b.name }))]}
              value={selectedBrand}
              onChange={(val) => setSelectedBrand(val)}
            />
          </div>
          <div className="w-full sm:w-56">
            <Label>Lọc theo Rạp</Label>
            <Select
              options={[{ value: "", label: "Tất cả rạp" }, ...cinemas.map(c => ({ value: c._id, label: c.name }))]}
              value={selectedCinemaId}
              onChange={(val) => setSelectedCinemaId(val)}
            />
          </div>
        </div>
        <Button onClick={() => {
          setEditingId(null);
          reset({
            name: "",
            cinemaId: selectedCinemaId || (cinemas.length > 0 ? cinemas[0]._id : ""),
            roomType: "standard",
            totalRows: 10,
            totalColumns: 12,
          });
          setIsModalOpen(true);
        }} className="whitespace-nowrap">
          + Thêm phòng
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                 <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Rạp</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tên phòng</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Loại phòng</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Số ghế</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Thao tác</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-gray-500">Đang tải...</TableCell>
                </TableRow>
              ) : filteredRooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-gray-500">Không có dữ liệu</TableCell>
                </TableRow>
              ) : (
                filteredRooms.map((room) => {
                  const cinemaName = cinemas.find(c => c._id === room.cinemaId)?.name || "N/A";
                  return (
                    <TableRow key={room._id}>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {cinemaName}
                      </TableCell>
                      <TableCell className="px-5 py-4 font-medium text-gray-800 text-start text-theme-sm dark:text-white/90">
                        {room.name.split(' (')[0]}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <span className="uppercase font-bold text-xs">{room.roomType}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {room.activeSeatCount || 0} / {(room.totalRows || 0) * (room.totalColumns || 0)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => window.location.href = `/rooms/${room._id}/layout`}
                            className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Cấu hình ghế
                          </Button>
                          <Button
                            variant="primary-soft"
                            size="sm"
                            onClick={() => handleEdit(room)}
                            className="px-3 py-1.5 text-xs font-medium"
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="error-soft"
                            size="sm"
                            onClick={() => handleDelete(room._id)}
                            className="px-3 py-1.5 text-xs font-medium"
                          >
                            Xoá
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[600px] p-8">
        <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">{editingId ? "Cập nhật phòng chiếu" : "Thêm phòng chiếu mới"}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label>Thuộc Rạp</Label>
              <Controller
                name="cinemaId"
                control={control}
                rules={{ required: "Vui lòng chọn rạp" }}
                render={({ field }) => (
                  <Select
                    options={cinemas.map(c => ({ value: c._id, label: c.name }))}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.cinemaId && <p className="mt-1 text-xs text-error-500">{errors.cinemaId.message}</p>}
            </div>
            <div>
              <Label>Tên Phòng</Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Tên phòng là bắt buộc" }}
                render={({ field }) => (
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="P1, P2..."
                    error={!!errors.name}
                    hint={errors.name?.message}
                  />
                )}
              />
            </div>
          </div>
          <div>
            <Label>Loại Phòng</Label>
            <Controller
              name="roomType"
              control={control}
              render={({ field }) => (
                <Select
                  options={[
                    { value: "standard", label: "Standard" },
                    { value: "vip", label: "VIP" },
                    { value: "gold", label: "Gold Class" },
                    { value: "imax", label: "IMAX" },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          {!editingId && (
            <>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label>Tổng số hàng ghế (Total Rows)</Label>
                  <Controller
                    name="totalRows"
                    control={control}
                    rules={{ required: "Bắt buộc", min: { value: 1, message: "Tối thiểu 1" } }}
                    render={({ field }) => (
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        min={1}
                        error={!!errors.totalRows}
                        hint={errors.totalRows?.message}
                      />
                    )}
                  />
                </div>
                <div>
                  <Label>Tổng số cột ghế (Total Columns)</Label>
                  <Controller
                    name="totalColumns"
                    control={control}
                    rules={{ required: "Bắt buộc", min: { value: 1, message: "Tối thiểu 1" } }}
                    render={({ field }) => (
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        min={1}
                        error={!!errors.totalColumns}
                        hint={errors.totalColumns?.message}
                      />
                    )}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 italic">Lưu ý: Không hỗ trợ sửa kích thước sơ đồ ghế sau khi tạo trong chức năng này.</p>
            </>
          )}
          <div className="flex justify-end gap-4 mt-8">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">{editingId ? "Cập nhật" : "Thêm mới"}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Xác nhận xoá phòng chiếu"
        message="Bạn có chắc muốn xoá phòng chiếu này? Không thể xoá nếu đã có suất chiếu."
        confirmText="Xoá ngay"
        variant="error"
      />
    </>
  );
}
