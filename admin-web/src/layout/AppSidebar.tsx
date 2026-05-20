import React, { useCallback } from "react";
import { Link, useLocation } from "react-router";

import {
  CalenderIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  TableIcon,
  UserCircleIcon,
  VideoIcon,
  GroupIcon,
  TaskIcon,
  BoxIcon,
  TimeIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

type NavCategory = {
  title: string;
  items: NavItem[];
};

const navCategories: NavCategory[] = [
  {
    title: "Bảng điều khiển",
    items: [
      {
        icon: <GridIcon />,
        name: "Trang chủ",
        path: "/",
      },
    ],
  },
  {
    title: "Quản lý Phim",
    items: [
      {
        icon: <VideoIcon />,
        name: "Phim",
        path: "/movies",
      },
    ],
  },
  {
    title: "Quản lý Rạp",
    items: [
      {
        icon: <BoxIcon />,
        name: "Rạp chiếu",
        path: "/cinemas",
      },
      {
        icon: <TableIcon />,
        name: "Phòng chiếu",
        path: "/rooms",
      },
      {
        icon: <GridIcon />,
        name: "Sơ đồ ghế",
        path: "/seat-layouts",
      },
    ],
  },
  {
    title: "Quản lý Lịch chiếu",
    items: [
      {
        icon: <CalenderIcon />,
        name: "Suất chiếu",
        path: "/showtimes",
      },
      {
        icon: <TimeIcon />,
        name: "Lập lịch chiếu",
        path: "/showtime-planner",
      },
    ],
  },
  {
    title: "Quản lý Đặt vé",
    items: [
      {
        icon: <TaskIcon />,
        name: "Đơn đặt vé",
        path: "/bookings",
      },
      {
        icon: <ListIcon />,
        name: "Vé xem phim",
        path: "/tickets",
      },
    ],
  },
  {
    title: "Quản lý Người dùng",
    items: [
      {
        icon: <GroupIcon />,
        name: "Người dùng",
        path: "/users",
      },
      {
        icon: <UserCircleIcon />,
        name: "Admin / Quản lý",
        path: "/admins",
      },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-2">
      {items.map((nav) => (
        <li key={nav.name}>
          <Link
            to={nav.path}
            className={`menu-item group ${
              isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
            }`}
          >
            <span
              className={`menu-item-icon-size ${
                isActive(nav.path)
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
              }`}
            >
              {nav.icon}
            </span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <span className="menu-item-text">{nav.name}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/images/logo/logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="rounded-lg"
          />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Cinema Manager
            </span>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            {navCategories.map((category) => (
              <div key={category.title}>
                <h2
                  className={`mb-3 text-xs font-semibold uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    category.title
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(category.items)}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;

