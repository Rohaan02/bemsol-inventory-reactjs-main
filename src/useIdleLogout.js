import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const IDLE_TIME = 10 * 60 * 1000; // 10 minutes

const useIdleLogout = () => {
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const logout = () => {
    // session clear
    localStorage.clear();
    sessionStorage.clear();

    navigate("/login");
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(logout, IDLE_TIME);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // start timer on load

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timerRef.current);
    };
  }, []);
};

export default useIdleLogout;
