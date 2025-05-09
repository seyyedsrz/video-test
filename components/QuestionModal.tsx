"use client";

import React, { useEffect, useState } from "react";

interface Question {
  question_text: string;
  choices: string[];
}

interface QuestionModalProps {
  question: Question;
  onSelect: (choice: string) => void;
  timeout?: number; // برحسب ثانیه
  onTimeout?: () => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  onSelect,
  timeout = 0,
  onTimeout,
}) => {
  const [countdown, setCountdown] = useState(timeout);

  useEffect(() => {
    if (!timeout) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          onTimeout?.();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeout, onTimeout]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10001]">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-[90%] max-w-md text-black space-y-5 animate-fade-in">
        <div className="flex justify-between items-center">
          <p className="text-lg font-bold">{question.question_text}</p>
          {timeout > 0 && (
            <span className="text-sm text-red-500 font-semibold">
              {countdown}s
            </span>
          )}
        </div>

        <div className="space-y-2">
          {question.choices.map((c, i) => (
            <button
              key={i}
              onClick={() => onSelect(c)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
