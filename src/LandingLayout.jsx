import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Footer2 from "./Components/Footer2";


const LandingLayout = () => {
  return (
    <div className="min-h-screen bg-customwhite flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      {/* <Footer2 /> */}
    </div>
  );
};

export default LandingLayout;
