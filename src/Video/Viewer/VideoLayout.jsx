import { Outlet } from "react-router-dom";
import Header from "../../Dashboard/Layout/Header";

// Frame of the video platform: the usual header (logo, name, logout) above the page
const VideoLayout = () => (
  <div className="min-h-screen flex flex-col bg-gray-100">
    <Header />
    <main className="flex-1 p-2 sm:p-4">
      <div className="container mx-auto">
        <Outlet />
      </div>
    </main>
  </div>
);

export default VideoLayout;
