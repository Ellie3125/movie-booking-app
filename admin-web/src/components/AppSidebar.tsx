import { NavLink, useLocation } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import {
  cilBuilding,
  cilCalendar,
  cilCreditCard,
  cilMovie,
  cilPeople,
  cilRoom,
  cilSpeedometer,
  cilUser,
} from '@coreui/icons';
import { CNavItem, CNavLink, CNavTitle, CSidebar, CSidebarBrand, CSidebarNav } from '@coreui/react';

type AppSidebarProps = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
};

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: cilSpeedometer },
  { to: '/movies', label: 'Movies', icon: cilMovie },
  { to: '/cinemas', label: 'Cinemas', icon: cilBuilding },
  { to: '/rooms', label: 'Rooms', icon: cilRoom },
  { to: '/showtimes', label: 'Showtimes', icon: cilCalendar },
  { to: '/bookings', label: 'Bookings', icon: cilCreditCard },
  { to: '/users', label: 'Users', icon: cilPeople },
];

export function AppSidebar({ visible, onVisibleChange }: AppSidebarProps) {
  const { pathname } = useLocation();

  return (
    <CSidebar
      className="admin-sidebar border-end"
      colorScheme="dark"
      onVisibleChange={onVisibleChange}
      position="fixed"
      visible={visible}
    >
      <CSidebarBrand className="admin-sidebar-brand">
        <CIcon icon={cilUser} className="me-2" />
        Movie Admin
      </CSidebarBrand>

      <CSidebarNav>
        <CNavTitle>Management</CNavTitle>
        {navigationItems.map((item) => (
          <CNavItem key={item.to}>
            <CNavLink as={NavLink} to={item.to} active={pathname === item.to}>
              <CIcon icon={item.icon} customClassName="nav-icon" />
              {item.label}
            </CNavLink>
          </CNavItem>
        ))}
      </CSidebarNav>
    </CSidebar>
  );
}
