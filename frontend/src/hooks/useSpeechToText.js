import { useState } from "react";
import { useInterview } from "../context/InterviewContext";
import { getQuestionKey } from "../utils/interviewHelpers";

export function useSpeechToText() {
  const { 
    listening, 
    setListening, 
    interview, 
    currentIndex, 
    setAnswers, 
    recognitionRef 
  } = useInterview();
  
  const [voiceSupported, setVoiceSupported] = useState(true);

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ");
      const prompt = interview.questions[currentIndex];
      setAnswers((prev) => ({ ...prev, [getQuestionKey(prompt)]: transcript }));
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return { listening, toggleVoiceInput, voiceSupported };
}
