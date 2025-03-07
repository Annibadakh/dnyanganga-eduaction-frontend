// import React, { useState } from "react";
// import Header from "./Header";
// import Sidebar from "./Sidebar";
// import logo from '../Images/logo4.png'

// import { Outlet } from "react-router-dom";

// function Dashboard() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };
//   const clickSidebar = () => {
//     if(window.innerWidth < 640){
//     setIsSidebarOpen(false);
//     }
//   }

//   return (
    
//     <div className="h-screen flex flex-col">
//       <Header />
//       <div className=" relative flex flex-1">
//         <Sidebar isSidebarOpen={isSidebarOpen} clickSidebar={clickSidebar} />
//         <main className=" relative flex-1 bg-gray-100 p-6 pt-16 overflow-y-auto">
//             <button
//                 className={`absolute z-50 top-2 transition-all duration-200 ${isSidebarOpen ? "left-[265px]" : "left-2" } sm:left-2 text-white bg-fourthcolor px-4 py-2 rounded`}
//                 onClick={toggleSidebar}
//             >
//                 ☰
//             </button>
//             <div className='absolute left-0 right-0 top-0 bottom-0 flex justify-center items-center'>
//             <img src={logo} alt="" className='h-[350px] opacity-30' />
//             </div>
//           <Outlet />
        
//         </main>
//       </div>
      
//     </div>
   
//   );
// }

// export default Dashboard;



import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import logo from '../Images/logo4.png';
import { Outlet } from "react-router-dom";
import api from "../Api";

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [response , setResponse] = useState();

  
  useEffect(() => {
      api.get("http://localhost:5000/api/dashboard")
      .then(response => {
        console.log("data", response.data.message);
        setResponse(response.data.message);
      })
      .catch (error => {
        console.log("Error to fetch data", error);
     })
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const clickSidebar = () => {
    if (window.innerWidth < 640) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="relative flex flex-1">
        <Sidebar isSidebarOpen={isSidebarOpen} clickSidebar={clickSidebar} />
        <main className="relative flex-1 bg-gray-100 p-6 pt-16 overflow-y-auto">
          <button
            className={`absolute z-50 top-2 transition-all duration-200 ${isSidebarOpen ? "left-[265px]" : "left-2"} sm:left-2 text-white bg-fourthcolor px-4 py-2 rounded`}
            onClick={toggleSidebar}
          >
            ☰
          </button>
          <div className="absolute left-0 right-0 top-0 bottom-0 flex justify-center items-center">
            <img src={logo} alt="" className="h-[350px] opacity-30" />
          </div>
          {response}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
