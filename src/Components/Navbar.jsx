
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import logo from '../Images/logo2.png'
const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true); // Trigger when scrolled down 50px
      } else {
        setScrolled(false); // Reset when scrolled back to top
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

    return(
      <>
        <nav className={`fixed z-50 flex justify-between h-[70px] px-10 py-1 items-center ${scrolled ? "top-0 left-0 right-0 bg-white" : "top-0 left-0 right-0 sm:top-8 bg-white sm:bg-transparent  sm:left-2 sm:right-2"}`}>
            <div className='absolute top-0 -z-10 h-[70px] left-4 right-4 bg-white' style={{transform: "skewX(-26deg)"}}>
            </div>
            <div>
                <img src={logo} alt="" className='h-16' />
            </div>
            <div className={`hidden sm:flex text-black list-none gap-6 ${scrolled ? "pt-4" : "pt-0"}`}>
                <li className="hover:text-primary">Home</li>
                <li className="hover:text-primary">About</li>
                <li className="hover:text-primary"><Link to="/dashboard">dashboard</Link></li>
                <li className="hover:text-primary">Contact us</li>
                <li className="hover:text-primary">App</li>
                <li className="hover:text-primary">Demo</li>
            </div>
            <div className={`right-10 z-40 -top-6 h-10 w-96 list-none gap-6 bg-primary px-10 py-2 ${scrolled ? "hidden" : "hidden sm:absolute sm:flex"}`} style={{transform: "skewX(26deg)"}}></div>
            <div className={`hidden sm:absolute right-5 z-40 sm:flex list-none gap-6 px-10 py-2 ${scrolled ? "-top-1 text-primary" : "-top-6 text-white"}`}>
                <li>Home</li>
                <li>About</li>
                <li>Courses</li>
                <li className="border-l-2 pl-3 border-solid border-gray-200">Call us: 8767809061</li>
            </div>
            <div className='hidden sm:block absolute -top-6 right-[408px] h-6 w-8 bg-primary' style={{transform: "skewX(-26deg)"}}></div>
            <button
              className="sm:hidden text-black text-2xl"
              onClick={() => setMenuOpen(!menuOpen)}
            >{menuOpen ? ("⛌") : "☰"}
            </button>
        </nav>

        {menuOpen && (
          <ul className="sm:hidden z-50 fixed top-[70px] border-2 border-solid border-gray-200 min-w-40 items-center right-0 bg-white space-y-4 px-4 py-3 shadow-md">
            <li>Home</li>
            <li>App</li>
            <li>Course</li>
            <li>Demo</li>
            <li>About Us</li>
            <li>Contact</li>
            <li>Home</li>
            <li>Courses</li>
          </ul>
        )}
        </>
    )
};

export default Navbar;
