import { useEffect } from "react";
import { useInterview } from "../context/InterviewContext";

export function useInterviewTimer(isRoundSubmitted) {
  const { examStarted, activeChildId, timeLeft, setTimeLeft } = useInterview();

  useEffect(() => {
    if (isRoundSubmitted) return undefined;
    const timer = setInterval(() => {
      setTimeLeft((seconds) => (examStarted && activeChildId ? Math.max(seconds - 1, 0) : seconds));
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, activeChildId, isRoundSubmitted, setTimeLeft]);

  return { timeLeft };
}
