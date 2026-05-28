import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import { buildImageUrl } from '../../utils/imageUrl';
import Input from '../form/input/InputField';
import Button from '../ui/button/Button';
import AvatarPicker from './AvatarPicker';

const PersonalInfoSection: React.FC = () => {
  const { user, updateProfile, uploadAvatar, changePassword } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  const resetFormValues = () => {
    setFullName(user?.fullName || '');
    setPhoneNumber(user?.phoneNumber || '');
    setAvatarUrl(user?.avatarUrl || '');
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

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!fullName.trim()) {
      toast.error('Họ và tên không được bỏ trống');
      return;
    }

    const wantsPasswordChange = newPassword.trim() !== '';

    if (wantsPasswordChange) {
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
      await updateProfile({
        fullName,
        phoneNumber,
        avatarUrl: avatarUrl || null,
      });

      if (wantsPasswordChange) {
        await changePassword({ currentPassword, newPassword, confirmPassword });
        toast.success('Cập nhật hồ sơ và mật khẩu thành công. Vui lòng đăng nhập lại.');
      } else {
        toast.success('Cập nhật hồ sơ thành công!');
      }

      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể lưu thay đổi');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatarFile', file);

    setUploading(true);
    try {
      await uploadAvatar(formData);
      toast.success('Tải ảnh đại diện mới thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Thông tin cá nhân & Bảo mật
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isEditing
              ? 'Cập nhật họ tên, số điện thoại, ảnh đại diện và mật khẩu.'
              : 'Xem thông tin hồ sơ theo schema user/profile mới.'}
          </p>
        </div>

        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="primary" size="sm">
            Chỉnh sửa
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-gray-50 p-6 dark:border-gray-805 dark:bg-white/[0.02] sm:flex-row sm:items-center">
        <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-gray-200 bg-white dark:border-gray-800">
          <img
            src={buildImageUrl(user?.avatarUrl)}
            alt="avatar"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-2">
          <h5 className="text-base font-semibold text-gray-850 dark:text-white/95">
            Ảnh đại diện
          </h5>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ảnh đại diện được lưu bằng trường avatarUrl.
          </p>

          {isEditing && (
            <div className="mt-2 flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#465FFF] px-4 py-2.5 text-xs font-semibold text-white shadow-theme-xs transition-colors hover:bg-[#3641F5]">
                {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
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
                onClick={() => setShowPresetPicker((current) => !current)}
              >
                {showPresetPicker ? 'Đóng thư viện' : 'Chọn ảnh mẫu'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {isEditing && showPresetPicker && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
          <h5 className="mb-4 text-sm font-semibold text-gray-800 dark:text-white/90">
            Thư viện ảnh mẫu
          </h5>
          <AvatarPicker
            value={avatarUrl}
            onChange={(url) => {
              setAvatarUrl(url);
              updateProfile({ avatarUrl: url })
                .then(() => toast.success('Đã cập nhật ảnh mẫu!'))
                .catch(() => toast.error('Không thể cập nhật ảnh mẫu'));
            }}
          />
        </div>
      )}

      {!isEditing ? (
        <div className="grid grid-cols-1 gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.01] md:grid-cols-2">
          <div className="space-y-1 rounded-xl border border-gray-100/50 bg-gray-50/50 p-4 dark:border-gray-850 dark:bg-white/[0.02]">
            <span className="block text-xs font-medium text-gray-400 dark:text-gray-500">
              Họ và tên
            </span>
            <span className="text-sm font-semibold text-gray-855 dark:text-white/90">
              {user?.fullName || 'Chưa cập nhật'}
            </span>
          </div>

          <div className="space-y-1 rounded-xl border border-gray-100/50 bg-gray-50/50 p-4 dark:border-gray-850 dark:bg-white/[0.02]">
            <span className="block text-xs font-medium text-gray-400 dark:text-gray-500">
              Địa chỉ Email
            </span>
            <span className="text-sm font-semibold text-gray-855 dark:text-white/90">
              {user?.email}
            </span>
          </div>

          <div className="space-y-1 rounded-xl border border-gray-100/50 bg-gray-50/50 p-4 dark:border-gray-850 dark:bg-white/[0.02]">
            <span className="block text-xs font-medium text-gray-400 dark:text-gray-500">
              Số điện thoại
            </span>
            <span className="text-sm font-semibold text-gray-855 dark:text-white/90">
              {user?.phoneNumber || 'Chưa cập nhật'}
            </span>
          </div>

          <div className="space-y-1 rounded-xl border border-gray-100/50 bg-gray-50/50 p-4 dark:border-gray-850 dark:bg-white/[0.02]">
            <span className="block text-xs font-medium text-gray-400 dark:text-gray-500">
              Loại tài khoản
            </span>
            <span className="text-sm font-semibold text-gray-855 dark:text-white/90">
              {user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
            </span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.01] md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Nhập họ và tên"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Số điện thoại
              </label>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="VD: 0987654321"
                autoComplete="off"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Địa chỉ Email
              </label>
              <Input type="email" value={user?.email || ''} disabled />
              <p className="mt-1 text-xs text-gray-400">
                Email dùng để đăng nhập và không thể tự thay đổi.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.01]">
            <div className="mb-4">
              <h5 className="text-base font-semibold text-gray-855 dark:text-white/95">
                Bảo mật & Đổi mật khẩu
              </h5>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Chỉ điền các trường dưới đây nếu bạn muốn thay đổi mật khẩu đăng nhập.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Mật khẩu hiện tại"
                autoComplete="new-password"
              />
              <Input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Mật khẩu mới"
                autoComplete="new-password"
              />
              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Xác nhận mật khẩu mới"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PersonalInfoSection;
