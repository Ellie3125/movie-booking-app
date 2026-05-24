import React from 'react';

type TabType = 'personal' | 'danger';

interface SidebarItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface ProfileSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems: SidebarItem[] = [
    {
      id: 'personal',
      label: 'Thông tin cá nhân & Bảo mật',
      description: 'Cập nhật avatar, email, bảo mật mật khẩu...',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'danger',
      label: 'Xóa tài khoản',
      description: 'Yêu cầu xóa dữ liệu tài khoản',
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-1 pr-0 md:pr-4">
      {menuItems.map((item) => {
        const isActive = activeTab === item.id;
        const isDanger = item.id === 'danger';

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 ${
              isActive
                ? isDanger
                  ? 'bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500'
                  : 'bg-brand-50 dark:bg-brand-950/10 border-l-4 border-brand-500 text-brand-600 dark:text-brand-400'
                : 'hover:bg-gray-50 dark:hover:bg-white/[0.02] border-l-4 border-transparent text-gray-700 dark:text-gray-400'
            }`}
          >
            <div className={`mt-0.5 rounded-lg p-1.5 ${isActive ? (isDanger ? 'text-red-500' : 'text-brand-500') : 'text-gray-400'}`}>
              {item.icon}
            </div>
            <div>
              <p className={`font-medium text-sm ${isActive ? (isDanger ? 'text-red-600 dark:text-red-400' : 'text-brand-600 dark:text-brand-400') : 'text-gray-800 dark:text-gray-200'}`}>
                {item.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {item.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ProfileSidebar;
