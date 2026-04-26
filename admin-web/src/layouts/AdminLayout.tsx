import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { CContainer, CFooter } from '@coreui/react';

import { AppHeader } from '../components/AppHeader';
import { AppSidebar } from '../components/AppSidebar';

export function AdminLayout() {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <div className={`admin-layout${sidebarVisible ? '' : ' sidebar-hidden'}`}>
      <AppSidebar visible={sidebarVisible} onVisibleChange={setSidebarVisible} />

      <div className="admin-wrapper">
        <AppHeader onSidebarToggle={() => setSidebarVisible((visible) => !visible)} />

        <main className="admin-content">
          <CContainer fluid className="py-4">
            <Outlet />
          </CContainer>
        </main>

        <CFooter className="px-4">
          <span>Movie Booking Admin</span>
        </CFooter>
      </div>
    </div>
  );
}
