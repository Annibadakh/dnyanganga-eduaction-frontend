import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Main from './Main';

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
        <Main />
      </div>
      
    </div>
   
  );
}

export default Dashboard;
