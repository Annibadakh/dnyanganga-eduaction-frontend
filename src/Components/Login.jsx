import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from '../Images/logo3.png';


function Login() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const navigate = useNavigate();
  const [loginLoader, setLoginLoader] = useState(false);

  useEffect(() => {
    if(user){
      navigate('/dashboard');
    }
  }, [navigate]);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoader(true);
    try {
      const response = await axios.post(`${apiUrl}/auth/login`, {
        email,
        password,
        role,
      });
      login(response.data);
      console.log(response.data);
      alert("Login successful");
      navigate("/dashboard");
    } catch (error) {
      alert(error.response.data.message);
      console.error("Login failed:", error.response);
    }
    finally{
      setLoginLoader(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-96">
        <div className="w-full grid place-items-center mb-4">
          <img src={logo} className="h-20 p-1 w-auto" alt="Logo" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-center text-gray-800 mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Select Role</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="counsellor">Counsellor</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Back to Home 
            </button>
          <button
            type="submit"
            disabled={loginLoader}
            className="w-28 min-h-10 bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center"
          >
            {loginLoader ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> :  "Login"}
          </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
