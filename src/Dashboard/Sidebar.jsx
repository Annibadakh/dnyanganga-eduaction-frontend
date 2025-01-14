import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from '../Images/logo.png'
const Sidebar = ({ isSidebarOpen }) => {
    const location = useLocation(); 

  const isActive = (path) => location.pathname === path;
    return(
        <>
        
        <aside className={`bg-primary text-white transition-all duration-300 
        ${isSidebarOpen ? "w-64 p-4" : "w-0 overflow-hidden"}`}>
            <nav className={`${isSidebarOpen ? "block" : "hidden"}`}>
                <ul>
                    <li className={`py-2 px-4 mb-1 rounded ${isActive("/dashboard/home") ? "bg-secondary" : "hover:bg-secondary"}`}>
                        <Link to="home">Home</Link>
                    </li>
                    <li className={`py-2 px-4 mb-1 rounded ${isActive("/dashboard/profile") ? "bg-secondary" : "hover:bg-secondary"}`}>
                        <Link to="profile">Profile</Link>
                    </li>
                    <li className={`py-2 px-4 mb-1 rounded ${isActive("/dashboard/settings") ? "bg-secondary" :"hover:bg-secondary"}`}>
                        <Link to="settings">Settings</Link>
                    </li>
                    <li className="py-2 hover:bg-gray-700 rounded">Menu Item 3</li>
                </ul>
            </nav> 
        </aside>
        
        </>
    )
};

export default Sidebar;