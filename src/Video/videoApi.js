import axios from "axios";

// API client for the video module (/api/video/…). Separate from Api.jsx because:
//  - requests go with credentials, so the playback call can store CloudFront cookies
//  - a video user's expired login goes back to the video login, not the staff login
const videoApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/video`,
  withCredentials: true,
});

const storedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

videoApi.interceptors.request.use((config) => {
  const user = storedUser();
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

videoApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/login")) {
      const isVideoUser = storedUser()?.role === "videoUser";
      localStorage.removeItem("user");
      window.location.href = isVideoUser ? "/video/login" : "/login";
    }
    return Promise.reject(error);
  },
);

export const apiMessage = (error, fallback = "Something went wrong, please try again") =>
  error?.response?.data?.message || fallback;

export default videoApi;
