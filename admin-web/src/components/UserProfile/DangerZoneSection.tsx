import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DangerZoneSection: React.FC = () => {
  const { deleteAccount } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmForm, setShowConfirmForm] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('Vui lòng nhập mật khẩu xác nhận');
      return;
    }
    if (confirmation !== 'DELETE') {
      toast.error('Vui lòng nhập chính xác chữ DELETE');
      return;
    }

    const confirmFinal = window.confirm(
      'Bạn có chắc chắn muốn xóa tài khoản này không? Mọi dữ liệu cá nhân của bạn sẽ bị xóa vĩnh viễn và bạn sẽ đăng xuất khỏi hệ thống ngay lập tức.'
    );
    if (!confirmFinal) return;

    setLoading(true);
    try {
      await deleteAccount({ currentPassword: password, confirmation });
      toast.success('Xóa tài khoản thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa tài khoản. Vui lòng kiểm tra lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-xl font-bold text-red-600 dark:text-red-500">
          Vùng nguy hiểm
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Hành động xóa tài khoản là vĩnh viễn và không thể đảo ngược.
        </p>
      </div>

      <div className="p-6 bg-red-50/50 dark:bg-red-950/10 rounded-2xl border border-red-200 dark:border-red-900/30">
        {!showConfirmForm ? (
          <div className="space-y-4">
            <h5 className="font-semibold text-red-800 dark:text-red-400 text-base">Xóa tài khoản cá nhân</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Khi thực hiện xóa tài khoản, toàn bộ thông tin cá nhân của bạn sẽ bị gỡ bỏ hoặc ẩn danh. Bạn sẽ mất quyền truy cập vào trang quản trị này ngay lập tức. Các lịch sử giao dịch liên quan sẽ được lưu trữ ẩn danh để đảm bảo tính toàn vẹn của dữ liệu doanh thu rạp chiếu.
            </p>
            <button
              type="button"
              onClick={() => setShowConfirmForm(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-850 rounded-lg shadow transition-colors"
            >
              Tôi muốn xóa tài khoản này
            </button>
          </div>
        ) : (
          <form onSubmit={handleDelete} className="space-y-5">
            <h5 className="font-semibold text-red-800 dark:text-red-400 text-base">Xác nhận yêu cầu xóa tài khoản</h5>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nhập mật khẩu của bạn để tiếp tục
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu tài khoản"
                  className="w-full rounded-lg border border-red-300 dark:border-red-900/40 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nhập chữ <strong className="text-red-600">DELETE</strong> để xác nhận hành vi
                </label>
                <input
                  type="text"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="Nhập chữ DELETE viết hoa"
                  className="w-full rounded-lg border border-red-300 dark:border-red-900/40 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-850 dark:text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-md transition-colors"
              >
                {loading ? 'Đang thực hiện xóa...' : 'Xác nhận xóa vĩnh viễn'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmForm(false);
                  setPassword('');
                  setConfirmation('');
                }}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DangerZoneSection;
