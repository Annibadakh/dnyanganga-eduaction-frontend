import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import api from "../Api";

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showExploreComment, setShowExploreComment] = useState(false);
  const {user} = useAuth();

  const userRole = user;

  // Show "explore more" comment after component loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowExploreComment(true);
      
      // Hide the comment after 3 seconds
      const hideTimer = setTimeout(() => {
        setShowExploreComment(false);
      }, 3000);

      return () => clearTimeout(hideTimer);
    }, 500); // Show after 500ms of loading

    return () => clearTimeout(timer);
  }, []);

  // useEffect(() => {
  //     api.get("/dashboard")
  //     .then(response => {
  //       console.log("data", response.data.message);
  //     })
  //     .catch (error => {
  //       console.log("Error to fetch data", error);
  //    })
  // }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const clickSidebar = () => {
    if (window.innerWidth < 640) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar isSidebarOpen={isSidebarOpen} clickSidebar={clickSidebar} userRole={userRole} />
        <main className="relative flex-1 bg-gray-100 p-2 overflow-auto max-h-full">
          <button
            className={`fixed z-50 top-22 shadow-custom transition-all duration-200 ${isSidebarOpen ? "left-[216px]" : "left-2"} text-white bg-primary px-4 py-2`}
            onClick={toggleSidebar}
          >
            ☰
          </button>

          {/* Explore More Comment */}
          {showExploreComment && (
            <div className={`fixed z-40 top-16 ${isSidebarOpen ? "left-[260px]" : "left-[80px]"} bg-white border-r-4 border-blue-500 shadow-lg rounded-l-md p-3 animate-pulse transition-all duration-200`}>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-3">
                  Explore more
                </span>
                <div className="flex flex-col space-y-1">
                  <div className="w-6 h-0.5 bg-gray-400"></div>
                  <div className="w-6 h-0.5 bg-gray-400"></div>
                  <div className="w-6 h-0.5 bg-gray-400"></div>
                </div>
              </div>
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-white"></div>
            </div>
          )}
          
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;