import React, { useEffect, useState } from "react";
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
import { cinemaService } from "../../services/cinemaService";
import { metaService } from "../../services/metaService";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Label from "../../components/form/Label";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/modal";
import { ConfirmationModal } from "../../components/ui/modal/ConfirmationModal";
import { buildImageUrl } from "../../utils/imageUrl";
import { CinemaDetailModal } from "../../components/ui/modal/CinemaDetailModal";

export default function Cinemas() {
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [brands, setBrands] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [filterBrand, setFilterBrand] = useState("");
  const [filterCity, setFilterCity] = useState("");

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    city: "",
    address: "",
    phone: "",
    imageUrl: "",
  });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [viewingCinema, setViewingCinema] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const loadCinemas = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterBrand) params.brand = filterBrand;
      if (filterCity) params.city = filterCity;
      const data = await cinemaService.getCinemas(params);
      setCinemas(data.data?.items || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi tải danh sách rạp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const metaRes = await metaService.getCinemaOptions();
        setBrands(metaRes.data?.brands || []);
        setCities(metaRes.data?.provinces || []);
      } catch (err) {
        console.error('Failed to load metadata', err);
      }
    };
    loadMetadata();
  }, []);

  useEffect(() => {
    loadCinemas();
  }, [filterBrand, filterCity]);

  const handleEdit = (cinema: any) => {
    setFormData({
      name: cinema.name,
      brand: cinema.brand,
      city: cinema.city || cinema.province || "",
      address: cinema.address,
      phone: cinema.phone || "",
      imageUrl: cinema.imageUrl || "",
    });
    setEditingId(cinema._id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!deletingId) return;
    try {
      await cinemaService.deleteCinema(deletingId);
      toast.success("Xoá rạp thành công");
      loadCinemas();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xoá rạp");
    } finally {
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand || !formData.city) {
      toast.error("Vui lòng chọn Thương hiệu và Tỉnh/Thành");
      return;
    }
    try {
      if (editingId) {
        await cinemaService.updateCinema(editingId, formData);
        toast.success("Cập nhật rạp thành công");
      } else {
        await cinemaService.createCinema(formData);
        toast.success("Thêm rạp mới thành công");
      }
      setIsModalOpen(false);
      loadCinemas();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu rạp");
    }
  };

  const getBrandInfo = (code: string) => {
    const brand = brands.find(b => b.code.toLowerCase() === code.toLowerCase());
    if (!brand) return { name: code, logoUrl: "" };
    return {
      ...brand,
      logoUrl: brand.logo || brand.logoUrl || ""
    };
  };

  const filteredCinemas = cinemas.filter(cinema => {
    const brandInfo = getBrandInfo(cinema.brand);
    return cinema.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brandInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cinema.city || cinema.province || "").toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <PageMeta title="Quản lý Rạp Phim" description="Danh sách rạp phim trong hệ thống" />
      <PageBreadCrumb pageTitle="Quản lý Rạp Phim" />
      
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between bg-white p-5 rounded-2xl border border-gray-200 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 max-w-md">
            <Label>Tìm kiếm</Label>
            <Input
              placeholder="Tìm tên rạp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Label>Tỉnh/Thành</Label>
            <Select
              options={[{ value: "", label: "Tất cả" }, ...cities.map(p => ({ value: p, label: p }))]}
              value={filterCity}
              onChange={setFilterCity}
            />
          </div>
          <div className="w-full sm:w-48">
            <Label>Thương hiệu</Label>
            <Select
              options={[{ value: "", label: "Tất cả" }, ...brands.map(b => ({ value: b.code, label: b.name }))]}
              value={filterBrand}
              onChange={setFilterBrand}
            />
          </div>
        </div>
        <Button onClick={() => {
          setEditingId(null);
          setFormData({ name: "", brand: "", city: "", address: "", phone: "", imageUrl: "" });
          setIsModalOpen(true);
        }} className="whitespace-nowrap">
          + Thêm rạp phim
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Khu vực</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Thương hiệu</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Rạp chiếu</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Liên hệ</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Thao tác</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-gray-500">Đang tải...</TableCell>
                </TableRow>
              ) : filteredCinemas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-gray-500">Không có dữ liệu</TableCell>
                </TableRow>
              ) : (
                filteredCinemas.map((cinema) => {
                  const brandInfo = getBrandInfo(cinema.brand);
                  return (
                    <TableRow key={cinema._id}>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 font-medium">
                        {cinema.city || cinema.province}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 p-1 border border-gray-100 dark:border-white/10">
                            {(cinema.imageUrl || brandInfo.logoUrl) ? (
                              <img src={buildImageUrl(cinema.imageUrl || brandInfo.logoUrl)} alt={brandInfo.name} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-[10px] text-gray-400 font-bold uppercase">{brandInfo.name.substring(0, 3)}</span>
                            )}
                          </div>
                          <span className="text-theme-sm text-gray-800 dark:text-white/90 font-semibold">{brandInfo.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-theme-sm dark:text-white">
                            {cinema.name}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5" title={cinema.address}>
                            {cinema.address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {cinema.phone || "---"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="primary-soft"
                            size="sm"
                            onClick={() => {
                              setViewingCinema(cinema);
                              setIsViewModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400"
                          >
                            Xem
                          </Button>
                          <Button
                            variant="primary-soft"
                            size="sm"
                            onClick={() => handleEdit(cinema)}
                            className="px-3 py-1.5 text-xs font-medium"
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="error-soft"
                            size="sm"
                            onClick={() => handleDelete(cinema._id)}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[700px] p-8">
        <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">{editingId ? "Cập nhật rạp" : "Thêm rạp mới"}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <Label>Tên rạp</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Thương hiệu</Label>
              <Select
                options={[{ value: "", label: "Chọn thương hiệu" }, ...brands.map(b => ({ value: b.code, label: b.name }))]}
                value={formData.brand}
                onChange={(val) => setFormData({ ...formData, brand: val })}
              />
            </div>
            <div>
              <Label>Tỉnh/Thành phố</Label>
              <Select
                options={[{ value: "", label: "Chọn tỉnh/thành" }, ...cities.map(p => ({ value: p, label: p }))]}
                value={formData.city}
                onChange={(val) => setFormData({ ...formData, city: val })}
              />
            </div>
          </div>
          <div>
            <Label>Địa chỉ chi tiết</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label>Số điện thoại</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Link Logo Rạp</Label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

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
        title="Xác nhận xoá rạp"
        message="Bạn có chắc muốn xoá rạp này? Các dữ liệu liên quan sẽ bị ảnh hưởng."
        confirmText="Xoá ngay"
        variant="error"
      />
      <CinemaDetailModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        cinema={viewingCinema}
        brandInfo={viewingCinema ? getBrandInfo(viewingCinema.brand) : null}
      />
    </>
  );
}
