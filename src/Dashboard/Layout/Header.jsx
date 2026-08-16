import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import logo from "../../Images/logo3.png";

const Header = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isStudent = user?.role === "student";

  const identifier = isStudent ? user?.studentId : user?.email;
  const identifierLabel = isStudent ? "Student ID" : "Email";

  const displayName = user?.name || "User";
  const initials = getInitials(displayName);

  const roleLabel = user?.role
    ? user.role === "ca"
      ? "CA"
      : user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "";

  // Role color mapping
  const roleBadgeColor = {
    admin: "bg-purple-600",
    counsellor: "bg-blue-600",
    teacher: "bg-green-600",
    logistics: "bg-orange-500",
    followUp: "bg-yellow-500",
    student: "bg-teal-600",
    ca: "bg-indigo-600",
  };
  const badgeColor = roleBadgeColor[user?.role] || "bg-primary";

  return (
    <nav className="flex justify-between border gap-2 px-5 md:px-20 py-4 sm:py-1 items-center shadow-custom min-h-18 bg-white">
      {/* Logo */}
      <div>
        <img src={logo} className="h-12 sm:p-1 sm:h-16" alt="logo" />
      </div>

      {/* Title */}
      <div>
        <h1 className="hidden sm:block text-lg text-secondary sm:text-3xl font-bold">
          Dnyanganga Education Pvt. Ltd.
        </h1>
      </div>

      {/* Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        {/* Avatar Trigger Button */}
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 focus:outline-none group"
          title={displayName}
        >
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition-transform select-none cursor-pointer ring-2 ring-white ring-offset-1">
            {initials}
          </div>
        </button>

        {/* Dropdown Panel */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fadeIn">
            {/* Top color banner */}
            {/* <div className="h-14 bg-primary relative" /> */}

            {/* Avatar overlapping banner */}
            <div className="flex justify-center m-4">
              <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl shadow-lg select-none ring-4 ring-white">
                {initials}
              </div>
            </div>

            {/* Name & Role */}
            {/* <div className="text-center px-5 pb-3">
                <p
                    className="text-base font-bold text-gray-800 truncate"
                    title={displayName}
                >
                    {displayName}
                </p>
                {roleLabel && (
                    <span
                    className={`inline-block mt-1 px-3 py-0.5 text-xs font-semibold text-white rounded-full capitalize tracking-wide ${badgeColor}`}
                    >
                    {roleLabel}
                    </span>
                )}
                </div> */}

            {/* Divider */}
            <div className="mx-4 border-t border-gray-100" />

            {/* Info Rows */}
            <div className="px-4 py-3 space-y-2.5">
              {/* Name Row */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3.5 h-3.5 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </p>
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {displayName}
                  </p>
                </div>
              </div>

              {/* Email / Student ID Row */}
              {identifier && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    {isStudent ? (
                      <svg
                        className="w-3.5 h-3.5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3.5 h-3.5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                      {identifierLabel}
                    </p>
                    <p
                      className="text-sm font-medium text-gray-700 truncate"
                      title={identifier}
                    >
                      {identifier}
                    </p>
                  </div>
                </div>
              )}

              {/* Role Row */}
              {roleLabel && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3.5 h-3.5 text-purple-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                      Role
                    </p>
                    <p className="text-sm font-medium text-gray-700 capitalize">
                      {roleLabel}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="mx-4 border-t border-gray-100" />

            {/* Logout Button — full width, red bg, centered */}
            <div className="p-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors duration-150"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
