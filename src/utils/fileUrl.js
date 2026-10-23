import axios from "axios";

// Links for uploaded files.
// The DB stores an S3 key ("students/1.jpg") or, for files not moved yet, a legacy
// path ("/uploads/students/1.jpg"). Files are private, so every link goes through the
// backend file route, which checks the file token and redirects to a short-lived
// signed S3 link. <img>/<video> tags can't send the login header, hence the token in the URL.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const STORAGE_KEY = "fileToken";
const REFRESH_BEFORE_MS = 60 * 60 * 1000; // renew when less than an hour is left

const readToken = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved?.token && saved.expiresAt > Date.now() ? saved : null;
  } catch {
    return null;
  }
};

export const clearFileToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage blocked — nothing to clear
  }
};

let pending = null;

const fetchToken = (loginToken) => {
  if (!pending) {
    pending = axios
      .get(`${API_URL}/files/token`, { headers: { Authorization: `Bearer ${loginToken}` } })
      .then(({ data }) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: data.token, expiresAt: data.expiresAt }));
      })
      .catch((err) => console.warn("Could not get file access token", err?.response?.status || err.message))
      .finally(() => {
        pending = null;
      });
  }
  return pending;
};

// Called before every API request (Api.jsx): waits for a token when there is none, so
// pages rendering images from that request's data get working links; renews in the
// background when it is about to expire.
export const ensureFileToken = async (loginToken) => {
  if (!loginToken) return;
  const current = readToken();
  if (!current) {
    await fetchToken(loginToken);
  } else if (current.expiresAt - Date.now() < REFRESH_BEFORE_MS) {
    fetchToken(loginToken);
  }
};

// Link for a stored file value; "" when there is none. Full links (http…, blob: and
// data: previews of a file just picked) are returned unchanged.
export const fileUrl = (stored) => {
  if (!stored || typeof stored !== "string") return "";
  const value = stored.trim();
  if (!value) return "";
  if (/^(https?:|blob:|data:)/i.test(value)) return value;

  const token = readToken()?.token || "";
  return `${API_URL}/files/view?key=${encodeURIComponent(value)}&ft=${encodeURIComponent(token)}`;
};
