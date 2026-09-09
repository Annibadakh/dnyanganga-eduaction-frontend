import { useEffect, useState, useRef, useCallback } from "react";
import api from "../../Api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../useToast";
import { ChevronLeft, ChevronRight, Clock, Maximize } from "lucide-react";
import renderMathText from "../Generic/RenderMathText";
import ImagePreview from "../Generic/ImagePreview";

const fsApi = {
  request: (el) =>
    el.requestFullscreen?.() ??
    el.webkitRequestFullscreen?.() ??
    el.mozRequestFullScreen?.() ??
    el.msRequestFullscreen?.(),
  exit: () =>
    document.exitFullscreen?.() ??
    document.webkitExitFullscreen?.() ??
    document.mozCancelFullScreen?.() ??
    document.msExitFullscreen?.(),
  element: () =>
    document.fullscreenElement ??
    document.webkitFullscreenElement ??
    document.mozFullScreenElement ??
    document.msFullscreenElement,
  changeEvent: (() => {
    if (typeof document === "undefined") return "fullscreenchange";
    if ("onfullscreenchange" in document) return "fullscreenchange";
    if ("onwebkitfullscreenchange" in document) return "webkitfullscreenchange";
    if ("onmozfullscreenchange" in document) return "mozfullscreenchange";
    if ("onmsfullscreenchange" in document) return "MSFullscreenChange";
    return "fullscreenchange";
  })(),
  isSupported: () =>
    !!(
      document.documentElement.requestFullscreen ||
      document.documentElement.webkitRequestFullscreen ||
      document.documentElement.mozRequestFullScreen ||
      document.documentElement.msRequestFullscreen
    ),
};

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const DEMO_DURATION = 30 * 60; // 30 minutes in seconds

const DemoQuizPlay = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { errorToast, infoToast } = useToast();

  const standardId = searchParams.get("standardId");

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEMO_DURATION);

  const [fsReady, setFsReady] = useState(isIOS);
  const pausedRef = useRef(false);
  const [error, setError] = useState(null);

  const loadQuestions = async () => {
    if (!standardId) {
      setError("No standard selected");
      return;
    }
    try {
      const res = await api.get("/quiz/demo/questions", {
        params: { standardId },
      });
      const formatted = res.data.questions.map((q) => ({
        ...q,
        selectedAns: [],
      }));
      setQuestions(formatted);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load demo quiz");
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (!fsReady) return;

    const onFsChange = () => {
      if (!fsApi.element()) pausedRef.current = true;
      else pausedRef.current = false;
    };
    document.addEventListener(fsApi.changeEvent, onFsChange);
    return () => document.removeEventListener(fsApi.changeEvent, onFsChange);
  }, [fsReady]);

  const enterFullscreen = useCallback(async () => {
    if (!fsApi.isSupported()) return;
    try {
      await fsApi.request(document.documentElement);
    } catch {}
  }, []);

  const handleEnterAndStart = async () => {
    await enterFullscreen();
    setFsReady(true);
  };

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 && questions.length > 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      if (pausedRef.current) return;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, questions.length]);

  const handleOptionChange = (qIndex, optIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };
      if (q.type === "MULTI") {
        q.selectedAns = q.selectedAns?.includes(optIndex)
          ? q.selectedAns.filter((i) => i !== optIndex)
          : [...(q.selectedAns || []), optIndex];
      } else {
        q.selectedAns = [optIndex];
      }
      updated[qIndex] = q;
      return updated;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    fsApi.exit();
    navigate("../demo/result", {
      state: {
        questions,
        duration: DEMO_DURATION,
        timeTaken: DEMO_DURATION - timeLeft,
      },
    });
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  const timerCls =
    timeLeft <= 60
      ? "text-red-600 bg-red-50 border-red-200"
      : timeLeft <= 300
        ? "text-yellow-600 bg-yellow-50 border-yellow-200"
        : "text-gray-700 bg-gray-50 border-gray-200";

  const heightStyle = { height: "100dvh" };

  // Gate screen
  if (!fsReady) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-gray-50 gap-6 px-6 text-center"
        style={heightStyle}
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Maximize size={28} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Demo Quiz</h2>
          <p className="text-sm text-gray-500 max-w-xs">
            20 random questions, 30 minute timer. This is a practice quiz — no
            results are saved.
          </p>
        </div>
        <button
          onClick={handleEnterAndStart}
          className="px-8 py-3 bg-primary text-white rounded-xl font-semibold text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          Enter Fullscreen &amp; Start
        </button>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-gray-50 gap-4 px-6 text-center"
        style={heightStyle}
      >
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-2xl">⚠</span>
        </div>
        <p className="text-sm font-semibold text-gray-700">{error}</p>
        <button
          onClick={() => navigate("..")}
          className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  // Loading
  if (!currentQuestion) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50"
        style={heightStyle}
      >
        <p className="text-gray-400 text-sm">Loading questions…</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col bg-gray-50 overflow-hidden"
      style={heightStyle}
    >
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-primary">Demo Quiz</span>
          <span className="text-xs text-gray-400">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-bold tabular-nums ${timerCls}`}
        >
          <Clock size={14} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100 shrink-0">
        <div
          className="h-1 bg-primary transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Scrollable question area */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 block">
          Q{currentIndex + 1}
        </span>

        <div className="mb-5">
          <div className="text-base font-semibold text-gray-800 leading-relaxed">
            {renderMathText(currentQuestion.questionText)}
          </div>
          <ImagePreview
            imagePath={currentQuestion.imageUrl}
            alt="Question Image"
            className="mt-3 max-h-40"
          />
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = currentQuestion.selectedAns?.includes(opt.index);
            return (
              <button
                key={opt.id}
                onClick={() => handleOptionChange(currentIndex, opt.index)}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all
                  ${
                    isSelected
                      ? "bg-primary/10 border-primary text-primary font-semibold"
                      : "bg-white border-gray-200 text-gray-700 hover:border-primary/40 hover:bg-gray-50"
                  }`}
              >
                <span
                  className={`w-5 h-5 shrink-0 flex items-center justify-center rounded-full border-2 transition-all mt-0.5
                    ${isSelected ? "border-primary bg-primary text-white" : "border-gray-300"}`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </span>
                <div className="flex-1">
                  <div>{renderMathText(opt.text)}</div>
                  <ImagePreview
                    imagePath={opt.imageUrl}
                    alt={`Option ${opt.index}`}
                    className="mt-2 max-h-24"
                  />
                </div>
              </button>
            );
          })}
        </div>

        {currentQuestion.type === "MULTI" && (
          <p className="mt-4 text-xs text-gray-400 text-center">
            Multiple answers allowed — select all that apply
          </p>
        )}
      </div>

      {/* Sticky footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={handlePrevious}
            disabled={isFirst}
            className="flex-1 flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <button
            onClick={handleNext}
            disabled={isLast}
            className="flex-1 flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-[0.98] transition-all"
        >
          End Demo Quiz
        </button>
      </div>
    </div>
  );
};

export default DemoQuizPlay;
