import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../../Logo";
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Check,
  Bot,
  FileText,
  Brain,
  Volume2,
  Mic,
  Video,
  Wifi,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Lock,
  ChevronRight,
  Sliders,
  Target,
  Activity,
  Award,
  User,
  Clock,
  MicOff,
  VolumeX,
  Play,
  Pause,
  CornerDownRight,
  Sparkles
} from "lucide-react";
import api from "../../../services/api";

export default function VoiceInterviewWorkspace({
  interviewId,
  role = "Senior Software Engineer",
  difficulty = "Adaptive",
  timeLeftSeconds: initialTimeLeft = 1800,
  resumeAnalysis,
  onCompletePhase,
  sessionData
}) {
  const [loading, setLoading] = useState(true);
  
  // Interview flow states
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [conversationHistory, setConversationHistory] = useState([]);
  
  // AI State: "idle" | "speaking" | "listening" | "thinking" | "ready" | "processing"
  const [aiState, setAiState] = useState("idle");
  const [typedQuestionText, setTypedQuestionText] = useState("");
  const [systemNotification, setSystemNotification] = useState("Calibrating voice session...");

  // Voice recognition states
  const [listening, setListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [speechState, setSpeechState] = useState("Idle"); 
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState(null);
  
  // Timer settings
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const [thinkingTimeStart, setThinkingTimeStart] = useState(null);
  const [speechTimeStart, setSpeechTimeStart] = useState(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(""); // "", "saving", "recorded"

  // Audio wave indicators
  const [waveHeights, setWaveHeights] = useState(Array(15).fill(4));
  const [equalizerBars, setEqualizerBars] = useState(Array(8).fill(3));
  
  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const autoSubmitTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const isFetchingRef = useRef(false);
  const maxQuestions = 10;

  const currentIndexRef = useRef(currentIndex);
  const speechTranscriptRef = useRef(speechTranscript);
  const currentQuestionRef = useRef(currentQuestion);
  const answersRef = useRef(answers);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    speechTranscriptRef.current = speechTranscript;
  }, [speechTranscript]);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Global voice check & initial fetch
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
    }
    
    fetchQuestion(0, "");

    return () => {
      cleanupTimers();
      if (recognitionRef.current) recognitionRef.current.abort();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [interviewId]);

  const cleanupTimers = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  // Timer Countdown
  useEffect(() => {
    if (loading || isPaused || isAiProcessing) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [loading, isPaused, isAiProcessing]);

  // Speaking Equalizer Animation
  useEffect(() => {
    if (aiState !== "speaking") {
      setEqualizerBars(Array(8).fill(3));
      return;
    }
    const interval = setInterval(() => {
      setEqualizerBars(Array(8).fill(0).map(() => Math.floor(Math.random() * 20) + 4));
    }, 120);
    return () => clearInterval(interval);
  }, [aiState]);

  // Listening Waveform Animation
  useEffect(() => {
    if (!listening) {
      setWaveHeights(Array(15).fill(4));
      return;
    }
    const interval = setInterval(() => {
      setWaveHeights(Array(15).fill(0).map(() => Math.floor(Math.random() * 24) + 6));
    }, 100);
    return () => clearInterval(interval);
  }, [listening]);

  // Synchronized Typing Animation mapping speech timing
  const startTypingSync = (fullText) => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    setTypedQuestionText("");
    
    let index = 0;
    const words = fullText.split(" ");
    
    // Estimate typing speed to match spoken word output (approx 120-150 WPM)
    const delayPerWord = 320; 

    typingIntervalRef.current = setInterval(() => {
      if (index < words.length) {
        setTypedQuestionText(prev => (prev ? prev + " " + words[index] : words[index]));
        index++;
      } else {
        clearInterval(typingIntervalRef.current);
      }
    }, delayPerWord);
  };

  // TTS Voice Output
  const speakQuestionText = (text, isClosing = false) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    cleanupTimers();

    if (isMuted || isPaused) {
      setAiState("ready");
      setSystemNotification("Ready. Click Play to resume speech.");
      return;
    }

    const cleanText = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/[*_`#]/g, "")
      .replace(/constraints:/i, ". Constraints:")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.02;

    utterance.onstart = () => {
      setAiState("speaking");
      setSystemNotification("🎙 AI Speaking...");
      startTypingSync(text);
      if (listening) stopSpeechRecognition();
    };

    utterance.onend = () => {
      if (isClosing) {
        setAiState("processing");
        setSystemNotification("💾 Wrapping up assessment...");
        handleFinishInterview();
        return;
      }
      
      setAiState("listening");
      setSystemNotification("Your turn. Please answer the question.");
      setThinkingTimeStart(Date.now());
      startSpeechRecognition();
    };

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith("en-US") && v.name.includes("Google")) ||
                  voices.find(v => v.lang.startsWith("en-"));
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Fetch dynamic question
  const fetchQuestion = async (index, lastAnsText) => {
    if (isFetchingRef.current) {
      console.log("[Voice Workspace] Blocked concurrent duplicate fetchQuestion call for index:", index);
      return;
    }
    isFetchingRef.current = true;
    setIsAiProcessing(true);
    setAiState("thinking");
    setSystemNotification("🧠 AI is analyzing your response...");

    try {
      const res = await api.post(`/interview/${interviewId}/voice/next-question`, {
        lastAnswer: lastAnsText,
        currentIndex: index
      });

      if (res.data?.success && res.data?.question) {
        const q = res.data.question;
        setCurrentQuestion(q);
        setCurrentIndex(index);
        setSpeechTranscript("");
        setSpeechState("Idle");

        setTimeout(() => {
          setIsAiProcessing(false);
          // Check if this is the final wrap-up statement
          const isFinal = index === maxQuestions - 1;
          speakQuestionText(q.description || q.question, isFinal);

          setConversationHistory(prev => [
            ...prev,
            { sender: "ai", text: q.description || q.question, topic: q.topic }
          ]);
        }, 1200);
      } else {
        throw new Error("Invalid response schema");
      }
    } catch (err) {
      console.error("Fetch voice question error:", err);
      setSystemNotification("❌ Connection issue. Retrying question generation in 3s...");
      setIsAiProcessing(false);
      setTimeout(() => {
        fetchQuestion(index, lastAnsText);
      }, 3500);
    } finally {
      isFetchingRef.current = false;
    }
  };

  // STT Voice Capture
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || isMuted || isPaused) return;

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      setListening(true);
      setSpeechState("Speech Recognition Active");
      setSystemNotification("🎤 Listening...");
    };

    rec.onresult = (event) => {
      setSpeechState("Voice Detected");
      if (!speechTimeStart) {
        setSpeechTimeStart(Date.now());
      }
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join(" ");
      
      const lower = transcript.toLowerCase().trim();
      const triggerPhrases = ["ok next question", "next question", "move to next question", "skip to next question"];
      const matchedTrigger = triggerPhrases.find(phrase => lower.endsWith(phrase));

      if (matchedTrigger) {
        rec.stop();
        let cleanTranscript = transcript.substring(0, transcript.length - matchedTrigger.length).trim();
        cleanTranscript = cleanTranscript.replace(/[,.?!]+$/, "").trim();
        const finalAns = cleanTranscript || "Next question requested by candidate.";
        setSpeechTranscript(finalAns);
        handleSubmitVoiceAnswer(finalAns);
        return;
      }

      setSpeechTranscript(transcript);
      resetSilenceTimer();
    };

    rec.onerror = (event) => {
      console.error("Recognition error event:", event);
      if (event.error === "not-allowed") {
        setVoiceSupported(false);
        setSystemNotification("❌ Microphone access denied. Please enable mic in settings.");
      }
    };

    rec.onend = () => {
      setListening(false);
      setSpeechState("Silence Detected");
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  // Auto-Submit Silence Timer Logic
  const resetSilenceTimer = () => {
    if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setAutoSubmitCountdown(null);

    // If candidate edits text, avoid interrupting them
    autoSubmitTimerRef.current = setTimeout(() => {
      // Start 2 second submission countdown visualizer to total 5.5 seconds of silence
      let secondsLeft = 2;
      setAutoSubmitCountdown(secondsLeft);
      
      countdownIntervalRef.current = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
          clearInterval(countdownIntervalRef.current);
          setAutoSubmitCountdown(null);
          handleSubmitVoiceAnswer();
        } else {
          setAutoSubmitCountdown(secondsLeft);
        }
      }, 1000);

    }, 3500); // 3.5 seconds of silence triggers countdown
  };

  const cancelSilenceTimer = () => {
    if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setAutoSubmitCountdown(null);
  };

  // Submit response
  const handleSubmitVoiceAnswer = async (overrideText) => {
    cancelSilenceTimer();
    const answerToSubmit = typeof overrideText === "string" ? overrideText.trim() : speechTranscriptRef.current.trim();
    if (!answerToSubmit) return;
    
    stopSpeechRecognition();
    setSubmitStatus("saving");
    setAiState("processing");
    setSystemNotification("💾 Saving Response...");

    const now = Date.now();
    const thinkingDur = thinkingTimeStart ? Math.round(( (speechTimeStart || now) - thinkingTimeStart ) / 1000) : 4;
    const answerDur = speechTimeStart ? Math.round(( now - speechTimeStart ) / 1000) : 10;

    const activeQuestion = currentQuestionRef.current;
    const activeIndex = currentIndexRef.current;

    try {
      await api.post(`/interview/${interviewId}/voice/submit-answer`, {
        questionText: activeQuestion.question || activeQuestion.description,
        answerText: answerToSubmit,
        thinkingTime: thinkingDur,
        answerDuration: answerDur,
        skill: activeQuestion.skill || "General",
        project: activeQuestion.project || "",
        topic: activeQuestion.topic || "Core concept",
        category: activeQuestion.category || "Problem Solving",
        confidenceScore: activeQuestion.confidenceScore || 8,
        questionAudio: "",
        candidateAudio: ""
      });

      const updatedAnswers = { ...answersRef.current, [activeQuestion.id || `p3_q${activeIndex}`]: answerToSubmit };
      setAnswers(updatedAnswers);
      setSubmitStatus("recorded");

      setConversationHistory(prev => [
        ...prev,
        { sender: "candidate", text: answerToSubmit }
      ]);

      setTimeout(() => {
        setSubmitStatus("");
        setSpeechTimeStart(null);
        setThinkingTimeStart(null);

        // Check overall timeline index limit
        if (activeIndex < maxQuestions - 1) {
          fetchQuestion(activeIndex + 1, answerToSubmit);
        } else {
          handleFinishInterview();
        }
      }, 1500);

    } catch (err) {
      console.error("Submit voice answer failed:", err);
      setSubmitStatus("error");
      setAiState("listening");
      setSystemNotification("Failed to submit response. Please retry.");
    }
  };

  const handleFinishInterview = async () => {
    setLoading(true);
    cancelSilenceTimer();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    try {
      await api.post(`/interview/${interviewId}/phase/3/submit`, {
        answers: answersRef.current
      });
      if (onCompletePhase) {
        onCompletePhase();
      }
    } catch (err) {
      console.error("Round wrap submission failed:", err);
      setSystemNotification("❌ Submission error. Retrying finalization...");
      setLoading(false);
      setTimeout(() => {
        handleFinishInterview();
      }, 3500);
    }
  };

  const handleReplayQuestion = () => {
    if (currentQuestion) {
      speakQuestionText(currentQuestion.description || currentQuestion.question, currentIndex === maxQuestions - 1);
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (currentQuestion) {
        speakQuestionText(currentQuestion.description || currentQuestion.question, currentIndex === maxQuestions - 1);
      }
    } else {
      setIsMuted(true);
      cancelSilenceTimer();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      stopSpeechRecognition();
      setAiState("ready");
      setSystemNotification("Ready. Mic and voice synthesis muted.");
    }
  };

  const handleTogglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      if (currentQuestion) {
        speakQuestionText(currentQuestion.description || currentQuestion.question, currentIndex === maxQuestions - 1);
      }
    } else {
      setIsPaused(true);
      cancelSilenceTimer();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      stopSpeechRecognition();
      setAiState("ready");
      setSystemNotification("Ready. Interview paused.");
    }
  };

  if (loading && !currentQuestion) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-xs font-mono font-bold tracking-widest text-brand-secondary uppercase">
            Instantiating voice session engines...
          </h2>
        </div>
      </div>
    );
  }

  const activeCategory = currentQuestion?.category || "Introduction";
  const progressTimeline = [
    "Introduction",
    "Resume Discussion",
    "Projects",
    "Technical Concepts",
    "Problem Solving",
    "Follow-up Questions",
    "Final Wrap-up"
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans flex flex-col justify-between overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Scope scoping keyframe animations directly for simple render */}
      <style>{`
        @keyframes breathing {
          0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(99, 102, 241, 0.15); }
          50% { transform: scale(1.04); box-shadow: 0 0 25px rgba(99, 102, 241, 0.35); }
        }
        @keyframes rotatingNetwork {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes ringPulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .breathing-pulse {
          animation: breathing 4s ease-in-out infinite;
        }
        .network-rotate {
          animation: rotatingNetwork 15s linear infinite;
        }
        .pulse-ring-element {
          animation: ringPulse 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
      `}</style>

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-brand-card/85 backdrop-blur-md px-6 py-4">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Logo />
            <div className="h-4 w-[1px] bg-brand-border" />
            <span className="text-[9px] font-mono font-bold bg-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
              Technical Round 2
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded bg-brand-bg border border-brand-border text-xs font-mono font-bold text-brand-text">
            <span className="text-blue-600 dark:text-blue-400">Question {currentIndex + 1} / {maxQuestions}</span>
            <span className="text-brand-secondary opacity-40">•</span>
            <span className="text-brand-secondary truncate max-w-[120px] sm:max-w-xs">{activeCategory}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-[10px] font-mono font-bold">
              {/* Dynamic Connection Status mapping state */}
              {aiState === "speaking" ? (
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-500/5 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                  <span className="h-1 w-1 bg-blue-555 dark:bg-blue-400 rounded-full animate-ping" />
                  🟢 AI Speaking
                </div>
              ) : aiState === "listening" ? (
                <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <span className="h-1 w-1 bg-emerald-400 rounded-full animate-ping" />
                  🎤 Listening
                </div>
              ) : aiState === "thinking" ? (
                <div className="flex items-center gap-1.5 text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-pulse" />
                  🧠 Thinking
                </div>
              ) : aiState === "processing" ? (
                <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  <RefreshCw className="h-2.5 w-2.5 animate-spin text-amber-450" />
                  💾 Saving Response
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-brand-secondary bg-brand-bg border border-brand-border px-2.5 py-0.5 rounded-full">
                  <Wifi className="h-3 w-3 text-brand-secondary" />
                  Ready
                </div>
              )}

              <div className="flex items-center gap-1.5 text-brand-secondary bg-brand-bg border border-brand-border px-2.5 py-0.5 rounded-full">
                🟢 Connected
              </div>
            </div>

            {/* Live Clock Timer */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-xs ${
              timeLeft < 300
                ? "bg-rose-500/15 border-rose-500/30 text-rose-500 dark:text-rose-400 animate-pulse"
                : "bg-brand-bg border-brand-border text-brand-text"
            }`}>
              <Clock className={`h-3.5 w-3.5 ${timeLeft < 300 ? "text-rose-500" : "text-blue-500 dark:text-blue-400"}`} />
              <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="flex-1 w-full max-w-[1500px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Column (9 cols): Conversational Area */}
        <main className="lg:col-span-9 flex flex-col gap-6 justify-between overflow-y-auto pr-1">
          
          {/* Main AI Interviewer Avatar Card */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[360px] relative overflow-hidden">
            
            {/* Ambient visual state glows */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full transition-all duration-1000 blur-3xl pointer-events-none ${
              aiState === "speaking"
                ? "bg-blue-500/5"
                : aiState === "listening"
                ? "bg-emerald-500/5"
                : aiState === "thinking"
                ? "bg-purple-500/5"
                : "bg-brand-bg/0"
            }`} />

            <div className="space-y-6 max-w-2xl relative z-10 w-full flex flex-col items-center">
              
              {/* Premium AI Interviewer Avatar */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                
                {/* Multi-pulse rings when Speaking / Listening */}
                {(aiState === "speaking" || aiState === "listening") && (
                  <>
                    <div className={`absolute inset-0 rounded-full border opacity-40 pulse-ring-element ${
                      aiState === "speaking" ? "border-blue-500" : "border-blue-500"
                    }`} />
                    <div className={`absolute inset-0 rounded-full border opacity-20 pulse-ring-element [animation-delay:1.2s] ${
                      aiState === "speaking" ? "border-blue-500" : "border-blue-500"
                    }`} />
                  </>
                )}

                {/* Rotating Neural network animation when thinking */}
                {aiState === "thinking" && (
                  <div className="absolute -inset-4 border border-dashed border-blue-500/35 rounded-full network-rotate" />
                )}

                {/* Main Avatar Container */}
                <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br from-slate-850 to-slate-950 border flex items-center justify-center text-blue-400 shadow-xl breathing-pulse transition duration-300 ${
                  aiState === "speaking"
                    ? "border-blue-500"
                    : aiState === "listening"
                    ? "border-blue-500"
                    : aiState === "thinking"
                    ? "border-blue-500"
                    : "border-slate-800"
                }`}>
                  {aiState === "thinking" ? (
                    <Brain className="h-10 w-10 text-blue-400 animate-pulse" />
                  ) : (
                    <Bot className="h-10 w-10 text-blue-400" />
                  )}
                </div>

                {/* Equalizer overlay when speaking */}
                {aiState === "speaking" && (
                  <div className="absolute -bottom-2 flex items-end justify-center gap-0.5 h-6 px-3 bg-slate-950/80 rounded-full border border-blue-500/30 backdrop-blur-sm">
                    {equalizerBars.map((h, i) => (
                      <div
                        key={i}
                        className="w-0.5 bg-blue-400 rounded-full transition-all duration-100"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Conversation status banner */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                  AI Technical Interviewer
                </span>
                <div className="h-5 flex items-center justify-center">
                  <span className={`text-xs font-bold font-mono tracking-wide ${
                    aiState === "speaking"
                      ? "text-blue-500"
                      : aiState === "listening"
                      ? "text-blue-500"
                      : aiState === "thinking"
                      ? "text-blue-500 animate-pulse"
                      : "text-slate-400"
                  }`}>
                    {systemNotification}
                  </span>
                </div>
              </div>

              {/* Live typed question text */}
              <div className="min-h-[100px] w-full border border-slate-850 bg-slate-950/60 p-5 rounded-xl flex items-center justify-center text-slate-200 text-sm font-medium leading-relaxed max-w-xl shadow-inner">
                {isAiProcessing ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex space-x-1.5">
                      <div className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-bounce" />
                    </div>
                    <span className="text-[10px] font-mono text-blue-500 font-bold">Generating Next Question...</span>
                  </div>
                ) : (
                  <p className="w-full text-center">
                    {aiState === "speaking" ? typedQuestionText : currentQuestion?.question || currentQuestion?.description}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Transcript & Response Area */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${listening ? "bg-blue-500 dark:bg-blue-400 animate-ping" : "bg-slate-350 dark:bg-slate-800"}`} />
                <span className="text-xs font-bold text-brand-text">Your Answer Transcript</span>
              </div>
              
              {/* Auto submit warning banner */}
              {autoSubmitCountdown !== null && (
                <span className="text-[10px] font-mono font-bold text-blue-500 animate-pulse bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                  No speech detected. Auto-submitting in {autoSubmitCountdown}s...
                </span>
              )}
            </div>

            {/* Transcript text box */}
            <div className="relative">
              <textarea
                value={speechTranscript}
                readOnly={true}
                placeholder={
                  aiState === "speaking"
                    ? "Microphone is disabled while the AI is speaking..."
                    : "Speak clearly into your microphone. Your spoken answer will be transcribed here automatically in real-time..."
                }
                className={`w-full bg-slate-50 dark:bg-slate-950 border border-brand-border rounded-lg p-3.5 text-xs text-brand-text placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:border-blue-500 resize-none h-[110px] font-sans leading-relaxed transition-all duration-200 ${
                  aiState === "speaking" ? "opacity-35 cursor-not-allowed" : "opacity-100"
                }`}
              />

              {/* Waveform Visualization when listening */}
              {listening && (
                <div className="absolute right-4 bottom-4 flex items-end gap-0.5 h-6">
                  {waveHeights.map((h, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-blue-400 rounded-full transition-all duration-100"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    cancelSilenceTimer();
                    setSpeechTranscript("");
                    if (!listening && aiState !== "speaking") startSpeechRecognition();
                  }}
                  disabled={!speechTranscript || isAiProcessing || submitStatus === "saving" || aiState === "speaking"}
                  className="px-3.5 py-1.5 rounded-lg border border-brand-border hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-brand-secondary hover:text-brand-text transition duration-150 disabled:opacity-30 cursor-pointer"
                >
                  Record Again
                </button>
                <button
                  onClick={handleReplayQuestion}
                  disabled={isAiProcessing}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-bg border border-brand-border hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-brand-secondary hover:text-brand-text transition duration-150 disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
                >
                  <Volume2 className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                  Replay Question
                </button>
              </div>

              <div className="flex items-center gap-3">
                {submitStatus === "saving" && (
                  <span className="text-xs font-mono font-bold text-blue-400 animate-pulse">
                    Saving response...
                  </span>
                )}
                {submitStatus === "recorded" && (
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Recorded ✓
                  </span>
                )}
                <button
                  onClick={handleSubmitVoiceAnswer}
                  disabled={!speechTranscript.trim() || isAiProcessing || submitStatus === "saving" || aiState === "speaking"}
                  className={`px-5 py-2.5 rounded-lg text-xs font-black text-white transition duration-200 cursor-pointer flex items-center gap-1.5 ${
                    !speechTranscript.trim() || isAiProcessing || submitStatus === "saving" || aiState === "speaking"
                      ? "bg-slate-200 dark:bg-slate-850 border border-brand-border text-slate-450 dark:text-slate-500 cursor-not-allowed"
                      : "bg-blue-650 hover:bg-blue-700 shadow-md"
                  }`}
                >
                  Submit Answer
                  <CornerDownRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Conversation history log */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-mono uppercase font-bold text-brand-secondary tracking-wider border-b border-brand-border pb-2 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              Conversation Log
            </h3>

            <div className="max-h-[150px] overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
              {conversationHistory.map((log, idx) => {
                const isAI = log.sender === "ai";

                return (
                  <div key={idx} className={`flex items-start gap-2.5 text-[11px] leading-relaxed ${isAI ? "" : "pl-6"}`}>
                    {isAI ? (
                      <div className="h-5 w-5 rounded-full bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                        <Bot className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-brand-secondary shrink-0 mt-0.5">
                        <User className="h-3 w-3" />
                      </div>
                    )}

                    <div className="flex-1 space-y-0.5">
                      <span className="font-bold text-brand-secondary block font-mono text-[9px] uppercase">
                        {isAI ? "Technical Interview Agent" : "You (Spoken)"}
                      </span>
                      <p className="text-brand-text font-medium">
                        {log.text}
                      </p>
                    </div>
                  </div>
                );
              })}

              {conversationHistory.length === 0 && (
                <div className="text-center py-6 text-xs text-brand-secondary/60 font-bold font-mono">
                  Conversation history logs will compile here.
                </div>
              )}
            </div>
          </div>

        </main>

        {/* Right Column (3 cols): Progress, Session Info & Skill highlights */}
        <aside className="lg:col-span-3 space-y-6 flex flex-col justify-start">
          {/* Progress Timeline */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase font-bold text-brand-secondary tracking-wider flex items-center gap-2 border-b border-brand-border pb-2.5">
              <Activity className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              Interview Sequence
            </h3>

            <div className="space-y-4 relative pl-3.5 before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-[2px] before:bg-brand-border">
              {progressTimeline.map((step) => {
                const isCurrent = activeCategory === step;
                const activeIndex = progressTimeline.indexOf(activeCategory);
                const stepIndex = progressTimeline.indexOf(step);
                const isCompleted = stepIndex < activeIndex;

                return (
                  <div key={step} className="relative flex gap-2 text-xs leading-normal">
                    <div className="absolute -left-[20px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-card">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 dark:text-emerald-400 fill-brand-card" />
                      ) : isCurrent ? (
                        <span className="relative flex h-2 w-2 items-center justify-center">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                        </span>
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full border border-brand-border bg-brand-bg" />
                      )}
                    </div>

                    <span className={`font-bold pl-2 ${
                      isCurrent ? "text-brand-text font-black" : isCompleted ? "text-brand-text/90" : "text-brand-secondary/60"
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Session Parameters */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase font-bold text-brand-secondary tracking-wider flex items-center gap-2 border-b border-brand-border pb-2.5">
              <Sliders className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              Session Parameters
            </h3>

            <div className="space-y-3.5 text-[11px] font-medium">
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                <span className="text-brand-secondary">Interview Strategy</span>
                <span className="text-brand-text font-bold">Adaptive AI</span>
              </div>
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                <span className="text-brand-secondary">Base Difficulty</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono font-bold capitalize">{difficulty}</span>
              </div>
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                <span className="text-brand-secondary">Resume Skill Focus</span>
                <span className="text-brand-text font-bold">{currentQuestion?.skill || "Core Stack"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                <span className="text-brand-secondary">Project Focus</span>
                <span className="text-brand-text font-bold truncate max-w-[120px]">{currentQuestion?.project || "General"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-secondary">Topic Evaluated</span>
                <span className="text-brand-text font-bold truncate max-w-[120px]">{currentQuestion?.title || "Concepts"}</span>
              </div>
            </div>
          </div>

          {/* Skill Indicators */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-4">
            <div className="border-b border-brand-border pb-2.5">
              <h3 className="text-xs font-mono uppercase font-bold text-brand-secondary tracking-wider flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                Resume Skill Indicators
              </h3>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(Array.isArray(resumeAnalysis?.skills) && resumeAnalysis.skills.length > 0
                ? resumeAnalysis.skills
                : ["React", "Node.js", "MongoDB", "Express", "System Design", "TypeScript", "REST API", "Database"]
              ).map((skill) => {
                const isEvaluated = currentQuestion?.skill?.toLowerCase() === skill.toLowerCase();
                const isContained = currentQuestion?.description?.toLowerCase().includes(skill.toLowerCase());

                return (
                  <span
                    key={skill}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition duration-200 ${
                      isEvaluated || isContained
                        ? "bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "bg-brand-bg border border-brand-border text-brand-secondary"
                    }`}
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>

        </aside>

      </div>

      {/* Bottom Voice Controls Dock */}
      <footer className="sticky bottom-0 z-35 border-t border-brand-border bg-brand-card px-6 py-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.4)]">
        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-secondary bg-brand-bg border border-brand-border px-3 py-1 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              Speech Synthesis Active
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-secondary bg-brand-bg border border-brand-border px-3 py-1 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              Microphone Operational
            </div>
          </div>

          {/* Voice controls dock */}
          <div className="flex items-center gap-4">
            
            {/* Mute mic */}
            <button
              onClick={handleToggleMute}
              className={`p-3 rounded-full border transition duration-200 cursor-pointer shadow-md ${
                isMuted
                  ? "bg-rose-500/20 border-rose-500 text-rose-500 dark:text-rose-400 animate-pulse"
                  : "bg-brand-bg border-brand-border text-brand-secondary hover:text-brand-text hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              <MicOff className="h-5 w-5" />
            </button>

            {/* Pause/Resume session */}
            <button
              onClick={handleTogglePause}
              className={`p-3 rounded-full border transition duration-200 cursor-pointer shadow-md ${
                isPaused
                  ? "bg-amber-500/20 border-amber-500 text-amber-500 dark:text-amber-400"
                  : "bg-brand-bg border-brand-border text-brand-secondary hover:text-brand-text hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={isPaused ? "Resume Interview" : "Pause Interview"}
            >
              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </button>

            {/* End session */}
            <button
              onClick={handleFinishInterview}
              className="px-5 py-3 bg-rose-650 hover:bg-rose-600 text-xs font-black text-white rounded-lg transition duration-200 cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.2)]"
            >
              End Interview
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}
