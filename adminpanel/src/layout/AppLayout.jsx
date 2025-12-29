import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { Outlet } from 'react-router-dom'

const AppLayout = () => {
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

    const toggleSideMenu = () => {
        setIsSideMenuOpen(!isSideMenuOpen);
    };

    return (
        <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${isSideMenuOpen ? 'overflow-hidden' : ''}`}>
            <Sidebar isSideMenuOpen={isSideMenuOpen} setIsSideMenuOpen={setIsSideMenuOpen} />

            <div className="flex flex-col flex-1 w-full">
                <Header toggleSideMenu={toggleSideMenu} />

                <main className="h-full pb-16 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

        </div>
    )
}

export default AppLayout
