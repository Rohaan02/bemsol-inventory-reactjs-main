import { useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const IDLE_TIME = 5 * 60 * 1000; // 5 minutes

const useIdleLogout = () => {
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Keep track if component is mounted
  const isMounted = useRef(true);

  const logout = useCallback(() => {
    // Only proceed if component is still mounted
    if (!isMounted.current) return;

    // Clear storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Force redirect using window.location for reliability
    window.location.href = "/login";

    // Also try React Router navigation as fallback
    try {
      navigate("/login", { replace: true });
    } catch (error) {
      console.log("Navigation error:", error);
    }
  }, [navigate]);

  const resetTimer = useCallback(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Don't set timer on login/register pages
    if (location.pathname === "/login" || location.pathname === "/register") {
      return;
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      logout();
    }, IDLE_TIME);
  }, [logout, location.pathname]);

  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "keypress",
      "click",
      "scroll",
      "touchstart",
      "touchmove",
      "wheel",
      "resize",
    ];

    // Add event listeners with capture phase
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, {
        passive: true,
        capture: true,
      });
    });

    // Also listen for specific input events
    const inputs = document.querySelectorAll("input, textarea, select, button");
    inputs.forEach((input) => {
      input.addEventListener("focus", resetTimer, { passive: true });
      input.addEventListener("blur", resetTimer, { passive: true });
    });

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        resetTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initialize timer
    resetTimer();

    // Cleanup function
    return () => {
      isMounted.current = false;

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer, { capture: true });
      });

      inputs.forEach((input) => {
        input.removeEventListener("focus", resetTimer);
        input.removeEventListener("blur", resetTimer);
      });

      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [resetTimer]);

  // Reset timer on route change
  useEffect(() => {
    resetTimer();
  }, [location.pathname, resetTimer]);

  // Optional: Log for debugging
  useEffect(() => {
    console.log(`Idle logout timer set for ${IDLE_TIME / 60000} minutes`);
  }, []);
};

export default useIdleLogout;
