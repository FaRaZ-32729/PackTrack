import React from "react";
import { FaBars } from "react-icons/fa";

const Header = ({ toggleSideMenu }) => {
    return (
        <header className="z-10 py-4 bg-white shadow-md dark:bg-gray-800">
            <div className="container flex items-center justify-between h-full px-6 mx-auto text-purple-600 dark:text-purple-300">

                {/* Sidebar Toggler - visible only on mobile */}
                <button
                    className="p-2 rounded-md focus:outline-none focus:shadow-outline-purple md:hidden"
                    onClick={toggleSideMenu}
                    aria-label="Toggle Menu"
                >
                    <FaBars size={22} />
                </button>

                {/* Heading - visible only on mobile */}
                <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-200 md:hidden">
                    Admin Dashboard
                </h1>
            </div>
        </header>
    );
};

export default Header;
