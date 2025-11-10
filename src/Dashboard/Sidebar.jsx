import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Download, FileText, Loader2, AlertCircle } from 'lucide-react';

import {
  FaHome,
  FaUser,
  FaCog,
  FaUsers,
  FaSchool,
  FaFileAlt,
  FaClipboardList,
  FaTable,
  FaMoneyBill,
  FaBook,
  FaShippingFast,
  FaMoneyCheckAlt,
  FaBalanceScale,
  FaUserEdit,
  FaFileInvoice,
} from "react-icons/fa";

const Sidebar = ({ isSidebarOpen, clickSidebar, userRole }) => {
  const location = useLocation();

  const links = [
    { path: "home", label: "Home", icon: <FaHome className="text-lg" /> },
    { path: "profile", label: "Profile", role: ["teacher"], icon: <FaUser className="text-lg" /> },
    { path: "settings", label: "Subjects Details", role: ["admin"], icon: <FaCog className="text-lg" /> },
    { path: "user", label: "User Details", role: ["admin"], icon: <FaUsers className="text-lg" /> },
    { path: "examcenter", label: "Exam Centre", role: ["admin"], icon: <FaSchool className="text-lg" /> },
    { path: "register", label: "Registration Form", role: ["counsellor"], icon: <FaFileAlt className="text-lg" /> },
    { path: "visiting", label: "Visiting Form", role: ["counsellor"], icon: <FaClipboardList className="text-lg" /> },
    { path: "registertable", label: "Register Table", role: ["counsellor", "admin", "followUp"], icon: <FaTable className="text-lg" /> },
    { path: "visitingtable", label: "Visiting Table", role: ["counsellor", "admin", "followUp"], icon: <FaTable className="text-lg" /> },
    { path: "paymenttable", label: "Payment Table", role: ["counsellor", "admin"], icon: <FaMoneyBill className="text-lg" /> },
    { path: "chalan", label: "Chalan", role: ["counsellor", "admin", "logistics"], icon: <FaFileInvoice className="text-lg" /> },
    { path: "bookentries", label: "Book Entries", role: ["counsellor", "admin", "logistics"], icon: <FaBook className="text-lg" /> },
    { path: "bookdistribution", label: "Book Details", role: ["counsellor"], icon: <FaShippingFast className="text-lg" /> },
    { path: "collection", label: "Collection Entries", role: ["admin"], icon: <FaMoneyCheckAlt className="text-lg" /> },
    { path: "settlement", label: "Collection Details", role: ["counsellor"], icon: <FaBalanceScale className="text-lg" /> },
    // { path: "hallticket", label: "Bulk Hallticket", role: "admin", icon: <FileText className="w-5 h-5" /> },
    // { path: "studentedit", label: "Edit Student", role: "admin", icon: <FaUserEdit className="text-lg" /> },
  ];

  const isActive = (path) => location.pathname === `/dashboard/${path}`;

  return (
    <aside
      className={`absolute z-50 top-0 bottom-0 left-0 sm:relative bg-primary text-white transition-all duration-200 
      ${isSidebarOpen ? "w-52 sm:w-52 p-4" : "w-0 overflow-hidden"}`}
    >
      {/* ✅ Added h-screen & overflow-y-auto */}
      <nav className={`${isSidebarOpen ? "block h-full overflow-y-auto scrollbar-hide" : "hidden"}`}>
        <ul>
          {links.map(({ path, label, role, icon }) => {
            if (role && !role.includes(userRole.role)) return null;
            return (
              <li
                key={path}
                onClick={clickSidebar}
                className={`flex items-center gap-3 py-2 px-2 mb-1 rounded-full transition-colors duration-150 
                ${isActive(path) ? "bg-secondary" : "hover:bg-secondary"}`}
              >
                <Link to={path} className="flex items-center gap-3 w-full">
                  {icon}
                  <span className="truncate">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
