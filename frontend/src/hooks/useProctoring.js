import { useEffect } from "react";
import { useInterview } from "../context/InterviewContext";
import { toast } from "../utils/toast";

export function useProctoring(isRoundSubmitted) {
  const { 
    examStarted, 
    activeChildId, 
    setViolations, 
    setTabSwitchCount 
  } = useInterview();

  // Tab switch tracking
  useEffect(() => {
    if (!examStarted || !activeChildId || isRoundSubmitted) return undefined;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations((items) => [...items, "Tab departure recorded"]);
        setTabSwitchCount((count) => count + 1);
        toast.warning("Tab departure recorded. Please stay on the interview tab.", "Proctor Warning");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [examStarted, activeChildId, isRoundSubmitted, setViolations, setTabSwitchCount]);

  // Key constraints proctoring
  useEffect(() => {
    if (!examStarted || !activeChildId || isRoundSubmitted) return undefined;
    const recordViolation = (msg) => {
      setViolations((items) => [...items, msg]);
      toast.warning(msg, "Proctor Alert");
    };
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key === "Escape") {
        recordViolation(`Restricted modifier key block: ${e.key}`);
      }
    };
    const handleBlur = () => {
      recordViolation("Window focus deviation detected");
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
    };
  }, [examStarted, activeChildId, isRoundSubmitted, setViolations]);
}
