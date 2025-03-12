import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isSidebarOpen, clickSidebar, userRole }) => {
    const location = useLocation(); 

    const links = [
        { path: "home", label: "Home" },
        { path: "profile", label: "Profile", role: "teacher" },
        { path: "settings", label: "Settings" },
        { path: "visiting", label: "Visiting Form", role: "counsellor"},
        { path: "register", label: "Registration Form", role: "counsellor"},
        { path: "registertable", label: "Register Table"},
        { path: "visitingtable", label: "Visiting Table"},
        { path: "user", label: "User Details", role: "admin"},
    ];

  const isActive = (path) => location.pathname === path;
    return(
        <>
        
        <aside className={`absolute z-50 top-0 bottom-0 left-0 sm:relative bg-fourthcolor text-white transition-all duration-200 
        ${isSidebarOpen ? "w-64 p-4" : "w-0 overflow-hidden"}`}>
            <nav className={`${isSidebarOpen ? "block" : "hidden"}`}>
                <ul>
                    {links.map(({ path, label, role }) => {
                        if (role && role !== userRole.role) return null;
                        return (
                            <li
                                key={path}
                                onClick={clickSidebar}
                                className={`py-2 px-4 mb-1 rounded-full ${isActive(`/dashboard/${path}`) ? "bg-secondary" : "hover:bg-secondary"}`}
                            >
                                <Link to={path}>{label}</Link>
                            </li>
                        );
                    })}
                    {/* <li onClick={clickSidebar} className={`py-2 px-4 mb-1 rounded-full ${isActive("/dashboard/home") ? "bg-secondary" : "hover:bg-secondary"}`}>
                        <Link  to="home">Home</Link>
                    </li>
                    {userRole === 'teacher' && (
                        <li onClick={clickSidebar} className={`py-2 px-4 mb-1 rounded-full ${isActive("/dashboard/profile") ? "bg-secondary" : "hover:bg-secondary"}`}>
                            <Link to="profile">Profile</Link>
                        </li>
                    )}
                    <li onClick={clickSidebar} className={`py-2 px-4 mb-1 rounded-full ${isActive("/dashboard/settings") ? "bg-secondary" :"hover:bg-secondary"}`}>
                        <Link to="settings">Settings</Link>
                    </li> */}
                </ul>
            </nav> 
        </aside>
        
        </>
    )
};

export default Sidebar;