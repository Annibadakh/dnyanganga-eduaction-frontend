import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import { FaWhatsapp } from "react-icons/fa";

const LandingLayout = () => {
  const phoneNumber = "917350139016"; // replace

  const message = "Hello! I want to know more about your courses.";

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-customwhite flex flex-col relative">
      <Navbar />

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end group">

        {/* Tooltip */}
        <span className="mb-4 opacity-0 group-hover:opacity-100 transition bg-primary text-white text-xs px-3 py-2 rounded-md shadow">
          Chat with us 👋
        </span>

        {/* Button */}
        <button
          onClick={handleWhatsAppClick}
          className="
            relative flex items-center justify-center
            w-14 h-14
            bg-gradient-to-r from-green-500 to-green-600
            hover:from-green-600 hover:to-green-700
            text-white rounded-full
            shadow-xl
            transition-all duration-300
            animate-bounce
          "
        >
          <FaWhatsapp size={26} />

          {/* Pulse Ring */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50 animate-ping"></span>
        </button>
      </div>
    </div>
  );
};

export default LandingLayout;