import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useLocation } from "react-router-dom";
import axios from "axios";
import logo from "../Images/logo3.png";
import { useToast } from "../useToast";
import Loader from "../Pages/Loader";
import { useSessionRedirect } from "../utils/useSessionRedirect";
function StudentLogin() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { login } = useAuth();
  const location = useLocation();

  const { successToast, errorToast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const paramStudentId = searchParams.get("studentID") || "";
  const paramDob = searchParams.get("DOB") || "";
  const hasLinkParams = Boolean(paramStudentId && paramDob);

  // a stored login is checked with the server first; a WhatsApp login link
  // (studentID + DOB in the URL) logs in fresh instead
  const { checkingSession, goHome } = useSessionRedirect({ skip: hasLinkParams });

  const [studentId, setStudentId] = useState(paramStudentId);
  const [dob, setDob] = useState(paramDob);
  const [loginLoader, setLoginLoader] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginLoader(true);

    try {
      const response = await axios.post(`${apiUrl}/auth/student-login`, {
        studentId,
        dob,
      });

      await login(response.data);

      setStudentId("");
      setDob("");

      successToast("Login successful !!");
      goHome(response.data.role);
    } catch (error) {
      console.error(error);
      errorToast(error.response?.data?.message || "Login failed");
    } finally {
      setLoginLoader(false);
    }
  };

  useEffect(() => {
    if (hasLinkParams) {
      (async () => {
        setLoginLoader(true);
        try {
          const response = await axios.post(`${apiUrl}/auth/student-login`, {
            studentId: paramStudentId,
            dob: paramDob,
          });
          await login(response.data);
          successToast("Login successful !!");
          goHome(response.data.role);
        } catch (error) {
          console.error(error);
          errorToast(error.response?.data?.message || "Login failed");
        } finally {
          setLoginLoader(false);
        }
      })();
    }
  }, []);

  if (checkingSession) return <Loader />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-96">
        <div className="w-full grid place-items-center mb-4">
          <img src={logo} className="h-20 w-auto" alt="Logo" />
        </div>

        <h2 className="text-2xl font-serif font-bold text-center mb-6">
          Student Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
         
          <div>
            <label className="block font-medium">Student ID</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Enter Student Id"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium">Date of Birth</label>
            <input
              type="date"
              value={dob}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loginLoader}
              className="w-28 min-h-10 bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center"
            >
              {loginLoader ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentLogin;
