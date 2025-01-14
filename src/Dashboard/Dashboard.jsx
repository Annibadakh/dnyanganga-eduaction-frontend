import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import logo from '../Images/logo.png'

import { Outlet } from "react-router-dom";

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    
    <div className="h-screen flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar isSidebarOpen={isSidebarOpen} />
        <main className=" relative flex-1 bg-gray-100 p-6 overflow-y-auto">
            <div className='absolute flex justify-center items-center w-full'>
            <img src={logo} alt="" className='h-[500px] opacity-30' />
            </div>
          <Outlet />
        
        </main>
      </div>
      
    </div>
   
  );
}

export default Dashboard;
