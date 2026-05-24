import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ProfileSidebar from "../components/UserProfile/ProfileSidebar";
import PersonalInfoSection from "../components/UserProfile/PersonalInfoSection";
import DangerZoneSection from "../components/UserProfile/DangerZoneSection";

type TabType = 'personal' | 'danger';

export default function UserProfiles() {
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfoSection />;
      case 'danger':
        return <DangerZoneSection />;
      default:
        return <PersonalInfoSection />;
    }
  };

  return (
    <>
      <PageMeta
        title="Hồ sơ cá nhân | BeatCinema Dashboard"
        description="Quản lý và cập nhật thông tin hồ sơ quản trị của bạn."
      />
      <PageBreadcrumb pageTitle="Cài đặt tài khoản" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
        {/* Left Sidebar Menu */}
        <div className="md:col-span-1 border-r border-gray-100 dark:border-gray-850/50">
          <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Right Active Section Details */}
        <div className="md:col-span-3 md:pl-6 min-h-[500px]">
          <div className="animate-fadeIn">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </>
  );
}
