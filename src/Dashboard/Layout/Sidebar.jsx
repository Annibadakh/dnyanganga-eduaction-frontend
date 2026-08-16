import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Download, FileText, Loader2, AlertCircle } from "lucide-react";

import {
  FaHome,
  FaUser,
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
  FaFileInvoice,
  FaClipboardCheck,
  FaPaperPlane,
  FaListAlt,
  FaChartBar,
  FaPlayCircle,
  FaHistory,
  FaDatabase,
} from "react-icons/fa";
import {
  counsellorLikeRoles,
  reportAccess,
  adminControlsAccess,
  userManageAccess,
  registrationTableAccess,
  paymentTableAccess,
  challanAccess,
  bookEntryAccess,
  marksAccess,
  questionBankManageAccess,
  quizManageAccess,
  homeAccess,
  caAccess,
  allRoles,
} from "../../utils/roleArrays";

const Sidebar = ({ isSidebarOpen, clickSidebar, userRole }) => {
  const location = useLocation();
  const links = [
    {
      path: "home",
      label: "Home",
      role: homeAccess,
      icon: <FaHome className="text-lg" />,
    },
    {
      path: "profile",
      label: "Profile",
      role: allRoles,
      icon: <FaUser className="text-lg" />,
    },
    {
      path: "ca-students",
      label: "GST Students",
      role: caAccess,
      icon: <FaFileInvoice className="text-lg" />,
    },
    {
      path: "report",
      label: "Report",
      role: reportAccess,
      icon: <FaChartBar className="text-lg" />,
    },
    {
      path: "standards",
      label: "Standard & Subject",
      role: adminControlsAccess,
      icon: <FaSchool className="text-lg" />,
    },
    {
      path: "gst-receipt",
      label: "Bank Details",
      role: adminControlsAccess,
      icon: <FaFileInvoice className="text-lg" />,
    },
    {
      path: "user",
      label: "User Details",
      role: userManageAccess,
      icon: <FaUsers className="text-lg" />,
    },
    {
      path: "examcenter",
      label: "Exam Centre",
      role: adminControlsAccess,
      icon: <FaSchool className="text-lg" />,
    },
    {
      path: "register",
      label: "Registration Form",
      role: counsellorLikeRoles,
      icon: <FaFileAlt className="text-lg" />,
    },
    {
      path: "visiting",
      label: "Visiting Form",
      role: counsellorLikeRoles,
      icon: <FaClipboardList className="text-lg" />,
    },
    {
      path: "registertable",
      label: "Register Table",
      role: registrationTableAccess,
      icon: <FaTable className="text-lg" />,
    },
    {
      path: "visitingtable",
      label: "Visiting Table",
      role: registrationTableAccess,
      icon: <FaTable className="text-lg" />,
    },
    {
      path: "paymenttable",
      label: "Payment Table",
      role: paymentTableAccess,
      icon: <FaMoneyBill className="text-lg" />,
    },
    {
      path: "chalan",
      label: "Challan",
      role: challanAccess,
      icon: <FaFileInvoice className="text-lg" />,
    },
    {
      path: "bookentries",
      label: "Book Entries",
      role: bookEntryAccess,
      icon: <FaBook className="text-lg" />,
    },
    {
      path: "bookdistribution",
      label: "Book Details",
      role: counsellorLikeRoles,
      icon: <FaShippingFast className="text-lg" />,
    },
    {
      path: "collection",
      label: "Collection Entries",
      role: adminControlsAccess,
      icon: <FaMoneyCheckAlt className="text-lg" />,
    },
    {
      path: "settlement",
      label: "Collection Details",
      role: counsellorLikeRoles,
      icon: <FaBalanceScale className="text-lg" />,
    },
    {
      path: "marksentry",
      label: "Marks Entry",
      role: marksAccess,
      icon: <FaClipboardCheck className="text-lg" />,
    },
    {
      path: "template",
      label: "Template",
      role: adminControlsAccess,
      icon: <FaListAlt className="text-lg" />,
    },
    {
      path: "jobs",
      label: "Message Jobs",
      role: adminControlsAccess,
      icon: <FaPaperPlane className="text-lg" />,
    },
    {
      path: "question-bank",
      label: "Question Bank",
      role: questionBankManageAccess,
      icon: <FaDatabase className="text-lg" />,
    },
    {
      path: "quizz",
      label: "Quizz",
      role: quizManageAccess,
      icon: <FaClipboardCheck className="text-lg" />,
    },
    {
      path: "quizzes",
      label: "Quizzes",
      role: ["student"],
      icon: <FaListAlt className="text-lg" />,
    },
  ];
  // console.log(userRole)
  const isActive = (path) =>
    location.pathname ===
    (userRole.role == "student" ? `/student/${path}` : `/dashboard/${path}`);

  return (
    <aside
      className={`absolute z-50 top-0 bottom-0 left-0 sm:relative bg-primary text-white transition-all duration-200 
      ${isSidebarOpen ? "w-52 sm:w-52 p-4" : "w-0 overflow-hidden"}`}
    >
      {/* ✅ Added h-screen & overflow-y-auto */}
      <nav
        className={`${isSidebarOpen ? "block h-full overflow-y-auto scrollbar-hide" : "hidden"}`}
      >
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
                <Link
                  to={path}
                  className="flex items-center font-bold gap-3 w-full"
                >
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
