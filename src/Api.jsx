import axios from "axios";
import { ensureFileToken, clearFileToken } from "./utils/fileUrl";

const getAuthToken = () => localStorage.getItem("user");

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use(  
  async (config) => {
    const userString = getAuthToken();
    const user = JSON.parse(userString);
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
      // keep the file token (used in image links) available and fresh
      await ensureFileToken(user.token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log(error);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("user");
      clearFileToken();
      window.location.href = '/login'
    } else {
      return Promise.reject(error);
    }
  }
);

export default api;
