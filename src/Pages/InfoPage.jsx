// InfoPage.jsx
import { useState, useEffect } from "react";
import { Home, ArrowLeft, RefreshCw } from "lucide-react";

export default function InfoPage({ type }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const title =
    type === "hallticket"
      ? "Hall Ticket not generated yet"
      : "Result not declared yet";

  const subtitle =
    type === "hallticket"
      ? "Your hall ticket will be available here once released."
      : "Please check back later for your result.";

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      {/* Floating background shapes */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-violet-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Big Icon text */}
          <div className="relative mb-8">
            <div className="text-8xl md:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-blue-400 animate-pulse">
              !
            </div>
            <div className="absolute inset-0 text-8xl md:text-[10rem] font-black text-white/10 blur-sm">
              !
            </div>
          </div>

          {/* Glass card */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 md:p-12 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {title}
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              {subtitle}
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGoBack}
                className="group flex items-center gap-3 bg-secondary text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                Go Back
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 border border-white/30 hover:border-white/50"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                Home
              </button>

              <button
                onClick={handleRefresh}
                className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 border border-white/30 hover:border-white/50"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}
