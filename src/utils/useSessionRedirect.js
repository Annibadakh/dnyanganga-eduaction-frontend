import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { getStoredUser, homePathFor, pathBelongsToRole } from "./authPaths";

// Used by the three login pages.
// On page load, if a login is stored, its token is checked with the server first:
//   valid   → go to that user's home (or the page they came from, if it is theirs)
//   invalid → stored login is cleared, the login form is shown
//   error   → (server unreachable) the login form is shown, nothing cleared
// `goHome(role)` is also used right after a fresh login.
export const useSessionRedirect = ({ skip = false } = {}) => {
  const { verifySession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [checkingSession, setCheckingSession] = useState(() => !skip && !!getStoredUser());

  const goHome = useCallback(
    (role) => navigate(pathBelongsToRole(from, role) ? from : homePathFor(role), { replace: true }),
    [navigate, from],
  );

  useEffect(() => {
    if (skip || !getStoredUser()) {
      setCheckingSession(false);
      return undefined;
    }
    let active = true;
    verifySession().then((result) => {
      if (!active) return;
      const stored = getStoredUser();
      if (result === "valid" && stored) goHome(stored.role);
      else setCheckingSession(false);
    });
    return () => {
      active = false;
    };
    // only on page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { checkingSession, goHome };
};
