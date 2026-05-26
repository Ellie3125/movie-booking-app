/**
 * SPEC Disclosure - PersonalInfoSection (Admin Web):
 * 1. Autonomous Decisions:
 *    - Sử dụng hoàn toàn các component dùng chung của hệ thống: `Input` từ `InputField.tsx`, `TextArea` từ `TextArea.tsx`, `Select` từ `Select.tsx`, và `Button` từ `Button.tsx`.
 *    - Đảm bảo tính nhất quán về giao diện (màu sắc, bo góc, viền, bóng đổ) giữa các form và nút bấm trên toàn bộ Dashboard.
 *    - Áp dụng `autoComplete="new-password"` cho các ô nhập để khắc phục lỗi trình duyệt autofill nhầm địa chỉ email vào các trường khác (như Quốc gia).
 * 2. Deviations:
 *    - Chuyển đổi từ các thẻ HTML thô (`input`, `textarea`, `select`, `button` tự code) sang các React UI Components chuyên biệt của dự án.
 * 3. Trade-offs:
 *    - Phải điều chỉnh handler của `TextArea` và `Select` do chúng nhận giá trị `value: string` thay vì sự kiện `e: ChangeEvent`.
 * 4. Context/Notes:
 *    - Giữ nguyên các chức năng tải ảnh đại diện lên server, thư viện chọn ảnh mẫu, hiển thị tĩnh khi ở chế độ chỉ đọc và cập nhật mật khẩu đồng thời.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { buildImageUrl } from '../../utils/imageUrl';
import AvatarPicker from './AvatarPicker';
import toast from 'react-hot-toast';

// Import các component dùng chung của hệ thống
import Input from '../form/input/InputField';
import TextArea from '../form/input/TextArea';
import Select from '../form/Select';
import Button from '../ui/button/Button';

const PersonalInfoSection: React.FC = () => {
  const { user, updateProfile, uploadAvatar, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const resetFormValues = () => {
    if (user) {
      setName(user.name || '');
      setDisplayName(user.displayName || '');
      setPhone(user.phone || '');
      setGender(user.gender || '');
      setAddress(user.address || '');
      setCountry(user.country || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');

      if (user.dateOfBirth) {
        const dateObj = new Date(user.dateOfBirth);
        if (!isNaN(dateObj.getTime())) {
          setDateOfBirth(dateObj.toISOString().split('T')[0]);
        } else {
          setDateOfBirth('');
        }
      } else {
        setDateOfBirth('');
      }
    }

    // Reset password fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  useEffect(() => {
    resetFormValues();
  }, [user]);

  const handleCancel = () => {
    resetFormValues();
    setIsEditing(false);
    setShowPresetPicker(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Họ và tên không được bỏ trống');
      return;
    }

    const wantToChangePassword = newPassword.trim() !== '';

    // Validate mật khẩu nếu người dùng muốn đổi mật khẩu
    if (wantToChangePassword) {
      if (!currentPassword) {
        toast.error('Vui lòng nhập mật khẩu hiện tại');
        return;
      }
      if (newPassword.length < 6) {
        toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('Mật khẩu mới và mật khẩu xác nhận không khớp');
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Cập nhật thông tin cá nhân trước
      await updateProfile({
        name,
        displayName,
        phone,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        address,
        country,
        bio,
        avatar,
      });

      // 2. Đổi mật khẩu nếu có yêu cầu
      if (wantToChangePassword) {
        await changePassword({ currentPassword, newPassword, confirmPassword });
        toast.success('Cập nhật thông tin cá nhân và mật khẩu thành công! Vui lòng đăng nhập lại.');
      } else {
        toast.success('Cập nhật thông tin cá nhân thành công!');
      }

      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể lưu thay đổi');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      await uploadAvatar(formData);
      toast.success('Tải ảnh đại diện mới thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const getGenderText = (g: string) => {
    switch (g) {
      case 'male':
        return 'Nam';
      case 'female':
        return 'Nữ';
      case 'other':
        return 'Khác';
      default:
        return 'Chưa cập nhật';
    }
  };

  const formatDateString = (dateStr?: string) => {
    if (!dateStr) return 'Chưa cập nhật';
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return 'Chưa cập nhật';
    return dateObj.toLocaleDateString('vi-VN');
  };

  const genderOptions = [
    { value: '', label: 'Chọn giới tính' },
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Thông tin cá nhân & Bảo mật
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEditing ? 'Nhập thông tin chi tiết và mật khẩu mới của bạn.' : 'Xem thông tin chi tiết hồ sơ cá nhân và cài đặt bảo mật.'}
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="primary"
            size="sm"
            startIcon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            }
          >
            Chỉnh sửa thông tin
          </Button>
        )}
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col gap-6 items-start sm:flex-row sm:items-center p-6 bg-gray-50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-gray-805">
        <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-800 bg-white">
          <img
            src={buildImageUrl(user?.avatar)}
            alt="avatar"
            className="w-full h-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-semibold">
              Uploading...
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h5 className="font-semibold text-gray-850 dark:text-white/95 text-base">Ảnh đại diện</h5>
          {isEditing ? (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                JPG, GIF hoặc PNG. Dung lượng tối đa 2MB.
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-white bg-[#465FFF] hover:bg-[#3641F5] rounded-xl shadow-theme-xs transition-colors">
                  Tải ảnh lên
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPresetPicker(!showPresetPicker)}
                >
                  {showPresetPicker ? 'Đóng thư viện' : 'Chọn ảnh mẫu'}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ảnh mẫu hoặc ảnh tự tải lên được sử dụng trên toàn hệ thống.
            </p>
          )}
        </div>
      </div>

      {/* Preset Picker display (Edit Mode only) */}
      {isEditing && showPresetPicker && (
        <div className="p-4 bg-gray-50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-gray-800">
          <h5 className="font-semibold text-gray-800 dark:text-white/90 text-sm mb-4">Thư viện ảnh mẫu</h5>
          <AvatarPicker
            value={avatar}
            onChange={(url) => {
              setAvatar(url);
              updateProfile({ avatar: url })
                .then(() => toast.success('Đã cập nhật ảnh mẫu!'))
                .catch(() => toast.error('Không thể cập nhật ảnh mẫu'));
            }}
          />
        </div>
      )}

      {/* Read-Only Mode (Chế độ xem) */}
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-white/[0.01] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="space-y-1 bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100/50 dark:border-gray-850">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block">Họ và tên</span>
            <span className="text-sm font-semibold text-gray-855 dark:text-white/90">{user?.name || 'Chưa cập nhật'}</span>
          </div>

          <div className="space-y-1 bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100/50 dark:border-gray-850">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block">Tên hiển thị</span>
            <span className="text-sm font-semibold text-gray-855 dark:text-white/90">{user?.displayName || 'Chưa cập nhật'}</span>
          </div>

          <div className="space-y-1 bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100/50 dark:border-gray-850">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block">Địa chỉ Email</span>
            <span className="text-sm font-semibold text-gray-855 dark:text-white/90">{user?.email}</span>
          </div>

          <div className="space-y-1 bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100/50 dark:border-gray-850">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block">Số điện thoại</span>
            <span className="text-sm font-semibold text-gray-855 dark:text-white/90">{user?.phone || 'Chưa cập nhật'}</span>
          </div>

          <div className="space-y-1 bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100/50 dark:border-gray-850">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block">Ngày sinh</span>
            <span className="text-sm font-semibold text-gray-855 dark:text-white/90">{formatDateString(user?.dateOfBirth)}</span>
          </div>

          <div className="space-y-1 bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100/50 dark:border-gray-850">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block">Giới tính</span>
            <span className="text-sm font-semibold text-gray-855 dark:text-white/90">{getGenderText(user?.gender || '')}</span>
          </div>

          <div className="space-y-1 bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100/50 dark:border-gray-850">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block">Địa chỉ cư trú</span>
            <span className="text-sm font-semibold text-gray-855 dark:text-white/90">{user?.address || 'Chưa cập nhật'}</span>
          </div>

          <div className="space-y-1 bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100/50 dark:border-gray-850">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block">Quốc gia</span>
            <span className="text-sm font-semibold text-gray-855 dark:text-white/90">{user?.country || 'Chưa cập nhật'}</span>
          </div>

          <div className="space-y-1 bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100/50 dark:border-gray-850">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block">Mật khẩu đăng nhập</span>
            <span className="text-sm font-semibold text-gray-855 dark:text-white/90">••••••••••••</span>
          </div>

          <div className="space-y-1 bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100/50 dark:border-gray-850">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block">Loại tài khoản</span>
            <span className="text-sm font-semibold text-gray-855 dark:text-white/90">{user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</span>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-1 bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100/50 dark:border-gray-850">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block">Giới thiệu ngắn (Bio)</span>
            <span className="text-sm font-semibold text-gray-855 dark:text-white/90 whitespace-pre-wrap">{user?.bio || 'Chưa cập nhật'}</span>
          </div>
        </div>
      ) : (
        /* Edit Form Mode (Chế độ sửa) */
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-white/[0.01] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="col-span-1 md:col-span-2 mb-2">
              <h5 className="font-semibold text-gray-855 dark:text-white/95 text-base">Thông tin cá nhân</h5>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên hiển thị (Display Name)
              </label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="VD: Ken Nguyen"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Địa chỉ Email
              </label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Email dùng để đăng nhập và không thể tự thay đổi.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số điện thoại
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0987654321"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ngày sinh
              </label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Giới tính
              </label>
              <Select
                options={genderOptions}
                value={gender}
                onChange={(val) => setGender(val as any)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Địa chỉ cư trú
              </label>
              <Input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: 123 Đường Nguyễn Trãi, Quận 1"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quốc gia
              </label>
              <Input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="VD: Việt Nam"
                autoComplete="off"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Giới thiệu ngắn (Bio)
              </label>
              <TextArea
                value={bio}
                onChange={(val) => setBio(val)}
                placeholder="Viết một đoạn giới thiệu ngắn về bản thân..."
                rows={4}
              />
              <div className="flex justify-end text-xs text-gray-400 mt-1">
                {bio.length}/500 ký tự
              </div>
            </div>
          </div>

          {/* Section: Bảo mật & Đổi mật khẩu */}
          <div className="bg-white dark:bg-white/[0.01] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="mb-4">
              <h5 className="font-semibold text-gray-855 dark:text-white/95 text-base">Bảo mật & Đổi mật khẩu</h5>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Chỉ điền các trường dưới đây nếu bạn muốn thay đổi mật khẩu đăng nhập của mình.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-750 dark:text-gray-300 mb-2">
                  Mật khẩu hiện tại
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu đang dùng"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-750 dark:text-gray-300 mb-2">
                  Mật khẩu mới
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-750 dark:text-gray-300 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PersonalInfoSection;
