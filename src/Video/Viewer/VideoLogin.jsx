import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../../useToast";
import logo from "../../Images/logo3.png";
import videoApi, { apiMessage } from "../videoApi";

// Login for video users (email + password given by the admin)
function VideoLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { successToast, errorToast } = useToast();
  const from = location.state?.from || "/video";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "videoUser") navigate(from, { replace: true });
  }, [user, navigate, from]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await videoApi.post("/auth/login", { email: email.trim().toLowerCase(), password });
      await login(data);
      successToast("Login successful !!");
    } catch (error) {
      errorToast(apiMessage(error, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 sm:p-8 shadow-lg rounded-lg w-full max-w-sm">
        <div className="w-full grid place-items-center mb-4">
          <img src={logo} className="h-20 w-auto" alt="Logo" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-center mb-6">Video Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-medium">Email</label>
            <input
              type="email"
              inputMode="email"
              autoComplete="username"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-28 min-h-10 bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VideoLogin;
