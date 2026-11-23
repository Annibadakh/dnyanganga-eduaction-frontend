import axios from "axios";

// Each kind of user has its own login page and its own home.
//   student   → /student-login → /student
//   videoUser → /video/login   → /video
//   staff     → /login         → /dashboard
export const loginPathFor = (role) => {
  if (role === "student") return "/student-login";
  if (role === "videoUser") return "/video/login";
  return "/login";
};

export const homePathFor = (role) => {
  if (role === "student") return "/student";
  if (role === "videoUser") return "/video";
  return "/dashboard";
};

// Is `path` inside the area this role may open? Used so a remembered `from` path of
// another kind of user is not followed after login.
export const pathBelongsToRole = (path, role) => {
  if (!path) return false;
  const home = homePathFor(role);
  return path === home || path.startsWith(`${home}/`);
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Asks the server whether the stored login token still works.
// Plain axios on purpose: the `api` / `videoApi` instances redirect on 401.
//   "valid"   → token accepted
//   "invalid" → expired / rejected / user gone or deactivated
//   "error"   → server not reachable or failed; we can't tell
export const checkStoredToken = async (storedUser) => {
  if (!storedUser?.token) return "invalid";
  const url = storedUser.role === "videoUser" ? `${API_URL}/video/me` : `${API_URL}/auth/me`;
  try {
    const { data } = await axios.get(url, {
      headers: { Authorization: `Bearer ${storedUser.token}` },
      withCredentials: storedUser.role === "videoUser",
      timeout: 15000,
    });
    if (data?.data?.isActive === false) return "invalid";
    return "valid";
  } catch (error) {
    const status = error.response?.status;
    if (status === 401 || status === 403 || status === 404) return "invalid";
    return "error";
  }
};
