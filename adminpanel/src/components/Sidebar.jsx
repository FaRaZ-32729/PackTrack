import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaBuilding,
  FaListAlt,
} from "react-icons/fa"; // ✅ Using react-icons

const Sidebar = ({ isSideMenuOpen, setIsSideMenuOpen }) => {
  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="z-20 hidden w-64 overflow-y-auto bg-white dark:bg-gray-800 md:block flex-shrink-0">
        <div className="py-4 text-gray-500 dark:text-gray-400">
          <NavLink
            className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200"
            to="/"
          >
            AdminPanel
          </NavLink>

          <ul className="mt-6 space-y-2">
            {/* Dashboard */}
            <li className="relative px-6 py-3">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 ${isActive
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-800 dark:text-gray-100 hover:text-purple-600"
                  }`
                }
              >
                <FaHome className="w-5 h-5" />
                <span className="ml-4">Dashboard</span>
              </NavLink>
            </li>

            {/* Companies */}
            <li className="relative px-6 py-3">
              <NavLink
                to="/companies"
                className={({ isActive }) =>
                  `inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 ${isActive
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-800 dark:text-gray-100 hover:text-purple-600"
                  }`
                }
              >
                <FaBuilding className="w-5 h-5" />
                <span className="ml-4">Companies</span>
              </NavLink>
            </li>

            {/* Categories */}
            <li className="relative px-6 py-3">
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 ${isActive
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-800 dark:text-gray-100 hover:text-purple-600"
                  }`
                }
              >
                <FaListAlt className="w-5 h-5" />
                <span className="ml-4">Categories</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </aside>

      {/* Overlay for Mobile */}
      <div
        className={`fixed inset-0 z-10 flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center ${isSideMenuOpen ? "block" : "hidden"
          }`}
      ></div>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 z-20 flex-shrink-0 w-64 mt-16 overflow-y-auto bg-white dark:bg-gray-800 md:hidden ${isSideMenuOpen ? "block" : "hidden"
          }`}
        onClick={toggleSideMenu}
      >
        <div className="py-4 text-gray-500 dark:text-gray-400">
          <NavLink
            className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200"
            to="/"
          >
            AdminPanel
          </NavLink>

          <ul className="mt-6 space-y-2">
            {/* Dashboard */}
            <li className="relative px-6 py-3">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 ${isActive
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-800 dark:text-gray-100 hover:text-purple-600"
                  }`
                }
              >
                <FaHome className="w-5 h-5" />
                <span className="ml-4">Dashboard</span>
              </NavLink>
            </li>

            {/* Companies */}
            <li className="relative px-6 py-3">
              <NavLink
                to="/companies"
                className={({ isActive }) =>
                  `inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 ${isActive
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-800 dark:text-gray-100 hover:text-purple-600"
                  }`
                }
              >
                <FaBuilding className="w-5 h-5" />
                <span className="ml-4">Companies</span>
              </NavLink>
            </li>

            {/* Categories */}
            <li className="relative px-6 py-3">
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 ${isActive
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-800 dark:text-gray-100 hover:text-purple-600"
                  }`
                }
              >
                <FaListAlt className="w-5 h-5" />
                <span className="ml-4">Categories</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
