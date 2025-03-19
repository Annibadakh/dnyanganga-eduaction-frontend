import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import logo from '../Images/logo4.png';
import { Outlet } from "react-router-dom";
import api from "../Api";

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const {user} = useAuth();

  const userRole = user;
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
        <main className="relative flex-1 bg-gray-100 p-6 pt-16 overflow-auto max-h-full">
          <button
            className={`fixed z-50 top-20 transition-all duration-200 ${isSidebarOpen ? "left-60" : "left-2"} text-white bg-fourthcolor px-4 py-2 rounded`}
            onClick={toggleSidebar}
          >
            ☰
          </button>
          <div className="-z-40 absolute left-0 right-0 top-0 bottom-0 flex justify-center items-center">
            <img src={logo} alt="" className="h-[350px] opacity-30" />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
