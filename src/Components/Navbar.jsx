import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../Images/logo3.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Check active route
  const isActive = (path) => location.pathname === path;

  const getLinkClasses = (path) =>
    isActive(path)
      ? "text-primary font-bold border-b-2 border-primary"
      : "hover:text-primary";

 

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav
        className={`sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-[70px] transition-all duration-300 bg-gray-200`}
      >
        {/* Logo */}
        <img src={logo} alt="logo" className="h-14" />

        {/* Desktop Menu */}
        <ul className="hidden sm:flex gap-6 font-semibold">
          <li className={getLinkClasses("/")}>
            <Link to="/">Home</Link>
          </li>

          <li className={getLinkClasses("/about")}>
            <Link to="/about">About</Link>
          </li>

  
          <li className={getLinkClasses("/courses")}>
            <Link to="/courses">Courses</Link>
          </li>

          <li className={getLinkClasses("/achievements")}>
            <Link to="/achievements">Achievement</Link>
          </li>

          <li className={getLinkClasses("/exam-centers")}>
            <Link to="/exam-centers">Exam Centre</Link>
          </li>

          <li className={getLinkClasses("/gallery")}>
            <Link to="/gallery">Gallery</Link>
          </li>


          {/* <li>
            <button
              onClick={() => navigate("/login")}
              className={`${
                isActive("/login")
                  ? "text-primary font-bold"
                  : "hover:text-primary"
              }`}
            >
              Login
            </button>
          </li> */}
        </ul>

        {/* Mobile Toggle Button */}
        <button
          className="sm:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <ul className="sm:hidden fixed right-0 top-[70px] w-48 bg-gray-200 shadow-md font-semibold space-y-4 p-4 z-50">
          <li className={getLinkClasses("/")}>
            <Link to="/">Home</Link>
          </li>

          <li className={getLinkClasses("/about")}>
            <Link to="/about">About</Link>
          </li>

          {/* <li className={getLinkClasses("/gallery")}>
            <Link to="/gallery">Gallery</Link>
          </li> */}

          <li className={getLinkClasses("/courses")}>
            <Link to="/courses">Courses</Link>
          </li>

            <li className={getLinkClasses("/achievements")}>
            <Link to="/achievements">Achievement</Link>
          </li>

          <li className={getLinkClasses("/exam-centers")}>
            <Link to="/exam-centers">Exam Centre</Link>
          </li>

          {/* <li>
            <button
              onClick={() => navigate("/login")}
              className={`${
                isActive("/login")
                  ? "text-primary font-bold"
                  : "hover:text-primary"
              }`}
            >
              Login
            </button>
          </li> */}
        </ul>
      )}
    </>
  );
};

export default Navbar;
