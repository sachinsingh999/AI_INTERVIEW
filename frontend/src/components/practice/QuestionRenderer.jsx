import React from "react";
import CodingInterface from "./CodingInterface";
import AptitudeInterface from "./AptitudeInterface";
import WrittenPractice from "./WrittenPractice";

export default function QuestionRenderer(props) {
  const { question } = props;
  
  if (!question) {
    return (
      <div className="flex-1 flex items-center justify-center bg-brand-bg text-brand-secondary">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 text-brand-secondary animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold text-brand-text">Loading Question Details...</span>
        </div>
      </div>
    );
  }

  // Dynamic question type resolution
  const getQuestionType = (q) => {
    if (q.type) return q.type;
    if (q.options && q.options.length > 0) return "aptitude";
    if (q.prompt) return "subjective";
    return "coding";
  };

  const qType = getQuestionType(question);

  switch (qType) {
    case "coding":
      return <CodingInterface {...props} />;
    case "aptitude":
    case "mcq":
      return <AptitudeInterface {...props} />;
    case "subjective":
    case "written":
      return <WrittenPractice {...props} />;
    default:
      return (
        <div className="flex-1 flex items-center justify-center bg-brand-bg text-brand-text font-semibold">
          Unsupported Question Type: {qType}
        </div>
      );
  }
}
