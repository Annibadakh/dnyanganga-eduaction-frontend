import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from '../Images/logo.png'
const Sidebar = ({ isSidebarOpen, clickSidebar }) => {
    const location = useLocation(); 

  const isActive = (path) => location.pathname === path;
    return(
        <>
        
        <aside className={`absolute z-50 top-0 bottom-0 left-0 sm:relative bg-fourthcolor text-white transition-all duration-200 
        ${isSidebarOpen ? "w-64 p-4" : "w-0 overflow-hidden"}`}>
            <nav className={`${isSidebarOpen ? "block" : "hidden"}`}>
                <ul>
                    <li onClick={clickSidebar} className={`py-2 px-4 mb-1 rounded-full ${isActive("/dashboard/home") ? "bg-secondary" : "hover:bg-secondary"}`}>
                        <Link  to="home">Home</Link>
                    </li>
                    <li onClick={clickSidebar} className={`py-2 px-4 mb-1 rounded-full ${isActive("/dashboard/profile") ? "bg-secondary" : "hover:bg-secondary"}`}>
                        <Link to="profile">Profile</Link>
                    </li>
                    <li onClick={clickSidebar} className={`py-2 px-4 mb-1 rounded-full ${isActive("/dashboard/settings") ? "bg-secondary" :"hover:bg-secondary"}`}>
                        <Link to="settings">Settings</Link>
                    </li>
                </ul>
            </nav> 
        </aside>
        
        </>
    )
};

export default Sidebar;