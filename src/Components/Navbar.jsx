import React, { useState } from 'react';
import logo from '../Images/logo.png';

function Navbar() {
 
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-100 text-black flex justify-between items-center p-1 relative z-10"> 
      <div className="flex items-center">
        
        <img src={logo} alt="Saraswati Logo" className="w-24 h-24" />
        
        <div>
          <h1 className="text-3xl font-bold">Dnyanganga</h1>
          <h2 className="text-xl font-semibold">Coaching Classes</h2>
        </div>
      </div>

      
      <div className="block lg:hidden">
        <button onClick={toggleMenu} className="text-black">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      
      <ul className="hidden lg:flex space-x-4">
        <li><a href="#" className="hover:text-blue-500 hover:underline hover:underline-offset-4">HOME</a></li>
        <li><a href="#" className="hover:text-blue-500 hover:underline hover:underline-offset-4">ABOUT</a></li>
        <li><a href="#" className="hover:text-blue-500 hover:underline hover:underline-offset-4">COURSES</a></li>
        <li><a href="#" className="hover:text-blue-500 hover:underline hover:underline-offset-4">APP</a></li>
        <li><a href="#" className="hover:text-blue-500 hover:underline hover:underline-offset-4">DEMO</a></li>
        <li><a href="#" className="hover:text-blue-500 hover:underline hover:underline-offset-4">CALL US</a></li>
      </ul>

      
      {isMenuOpen && (
        <ul className="lg:hidden absolute top-16 left-0 w-full bg-blue-100 p-4 space-y-4 z-20"> 
          <li><a href="#" className="hover:text-blue-500 hover:underline hover:underline-offset-4">HOME</a></li>
          <li><a href="#" className="hover:text-blue-500 hover:underline hover:underline-offset-4">ABOUT</a></li>
          <li><a href="#" className="hover:text-blue-500 hover:underline hover:underline-offset-4">COURSES</a></li>
          <li><a href="#" className="hover:text-blue-500 hover:underline hover:underline-offset-4">APP</a></li>
          <li><a href="#" className="hover:text-blue-500 hover:underline hover:underline-offset-4">DEMO</a></li>
          <li><a href="#" className="hover:text-blue-500 hover:underline hover:underline-offset-4">CALL US</a></li>
        </ul>
      )}

     
      <div className="hidden lg:flex space-x-2">
        <button className="bg-white text-black px-4 py-2 rounded-md hover:bg-blue-300">ONLINE ADMISSION</button>
        <button className="bg-white text-black px-4 py-2 rounded-md hover:bg-blue-300">LOGIN</button>
      </div>
    </nav>
  );
}

export default Navbar;
