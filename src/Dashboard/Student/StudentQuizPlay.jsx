import { useEffect, useState, useRef, useCallback } from "react";
import api from "../../Api";
import Button from "../Generic/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../useToast";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  LogOut,
  Clock,
  CheckCircle2,
  Maximize,
} from "lucide-react";

const BATCH_SIZE = 5;

// ─── Fullscreen helpers (cross-browser) ──────────────────────────────────────
const fsApi = {
  request: (el) =>
    el.requestFullscreen?.() ??
    el.webkitRequestFullscreen?.() ?? // Safari desktop
    el.mozRequestFullScreen?.() ?? // Firefox legacy
    el.msRequestFullscreen?.(), // IE / old Edge

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

  // iOS Safari & some Android browsers don't support the Fullscreen API
  isSupported: () =>
    !!(
      document.documentElement.requestFullscreen ||
      document.documentElement.webkitRequestFullscreen ||
      document.documentElement.mozRequestFullScreen ||
      document.documentElement.msRequestFullscreen
    ),
};

// Detect iOS (Fullscreen API not supported)
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// ─────────────────────────────────────────────────────────────────────────────

const StudentQuizPlay = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { successToast, errorToast, infoToast } = useToast();

  const [meta, setMeta] = useState(null);
  const [studentQuizId, setStudentQuizId] = useState(null);
  const [batch, setBatch] = useState([]);
  const [offset, setOffset] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);

  // Fullscreen & gate state
  const [fsReady, setFsReady] = useState(isIOS); // iOS skips gate
  const [paused, setPaused] = useState(false);
  const [pauseCount, setPauseCount] = useState(0);
  const MAX_PAUSES = 3; // auto-submit after this many exits

  const pausedRef = useRef(false); // sync ref for timer callback
  const submitCalled = useRef(false); // guard against double-submit

  // ── Pause / resume helpers ────────────────────────────────────────────────
  const pauseQuiz = useCallback(() => {
    if (pausedRef.current) return;
    pausedRef.current = true;
    setPaused(true);
    setPauseCount((c) => {
      const next = c + 1;
      if (next >= MAX_PAUSES) {
        // Too many exits → auto submit
        handleSubmitQuiz(true);
      }
      return next;
    });
  }, []); // eslint-disable-line

  const resumeQuiz = useCallback(() => {
    pausedRef.current = false;
    setPaused(false);
  }, []);

  // ── Fullscreen management ─────────────────────────────────────────────────
  const enterFullscreen = useCallback(async () => {
    if (!fsApi.isSupported()) return; // iOS — skip
    try {
      await fsApi.request(document.documentElement);
    } catch {
      // Browser rejected (no user gesture yet) — gate will handle it
    }
  }, []);

  // Listen for fullscreen change — if user escapes, pause
  useEffect(() => {
    if (!fsApi.isSupported()) return;

    const onFsChange = () => {
      const inFs = !!fsApi.element();
      if (!inFs && fsReady) {
        // User left fullscreen during quiz
        pauseQuiz();
      }
    };

    document.addEventListener(fsApi.changeEvent, onFsChange);
    return () => document.removeEventListener(fsApi.changeEvent, onFsChange);
  }, [fsReady, pauseQuiz]);

  // Also catch Tab/window visibility change (Alt+Tab, home button on Android)
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && fsReady) pauseQuiz();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [fsReady, pauseQuiz]);

  // ── Start quiz ────────────────────────────────────────────────────────────
  const startQuiz = async () => {
    try {
      const res = await api.post(`/quiz/${quizId}/start`);
      const { meta: quizMeta, studentQuizId: sqId } = res.data;

      setMeta(quizMeta);
      setStudentQuizId(sqId);

      const totalSeconds = quizMeta.duration * 60;
      const startedAt = new Date(quizMeta.startTime).getTime();
      const elapsedSecs = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(totalSeconds - elapsedSecs, 0);
      setTimeLeft(remaining);

      fetchBatch(sqId, 0);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to start quiz";
      errorToast(msg);
      if (msg === "Quiz already submitted") navigate("/student/home");
    }
  };

  // Called once after user clicks "Enter Fullscreen & Begin"
  const handleEnterAndStart = async () => {
    await enterFullscreen();
    setFsReady(true);
    await startQuiz();
  };

  // ── Fetch batch ───────────────────────────────────────────────────────────
  const fetchBatch = async (sqId, newOffset, goToLast = false) => {
    try {
      const res = await api.get(`/quiz/batch/${sqId}`, {
        params: { offset: newOffset, limit: BATCH_SIZE },
      });

      if (res.data.autoSubmit) {
        infoToast("Time up! Auto submitted.");
        navigate("/student/home");
        return;
      }

      const formatted = res.data.data.map((q) => ({
        ...q,
        selectedAns: q.selectedAns || [],
      }));

      setBatch(formatted);
      setOffset(newOffset);
      setCurrentIndex(goToLast ? formatted.length - 1 : 0);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load questions";
      errorToast(msg);
      if (msg === "Quiz already submitted" || msg === "Time up")
        navigate("/student/home");
    }
  };

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null || !fsReady) return;

    if (timeLeft <= 0) {
      handleSubmitQuiz(true);
      return;
    }

    const timer = setInterval(() => {
      if (pausedRef.current) return; // freeze while paused
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, fsReady]);

  // ── Option toggle ─────────────────────────────────────────────────────────
  const handleOptionChange = (q, optIndex) => {
    let selected = [];
    if (q.type === "MULTI") {
      selected = q.selectedAns?.includes(optIndex)
        ? q.selectedAns.filter((i) => i !== optIndex)
        : [...(q.selectedAns || []), optIndex];
    } else {
      selected = [optIndex];
    }
    setBatch((prev) =>
      prev.map((item) =>
        item.id === q.id ? { ...item, selectedAns: selected } : item,
      ),
    );
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentIndex < batch.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      if (offset + BATCH_SIZE >= meta.totalQuestions) {
        infoToast("You have reached the last question");
        return;
      }
      fetchBatch(studentQuizId, offset + BATCH_SIZE);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else if (offset > 0) {
      fetchBatch(studentQuizId, offset - BATCH_SIZE, true);
    }
  };

  // ── Save & Next ───────────────────────────────────────────────────────────
  const handleSaveAndNext = async () => {
    const q = batch[currentIndex];
    if (!q.selectedAns?.length) {
      infoToast("Please select an answer");
      return;
    }

    try {
      await api.post("/quiz/save-answer", {
        studentQuizId,
        questionId: q.id,
        selectedAns: q.selectedAns,
      });
      successToast("Saved");
      handleNext();
    } catch (err) {
      const msg = err.response?.data?.message || "Error saving answer";
      errorToast(msg);
      if (msg === "Time up" || msg === "Quiz already submitted")
        navigate("/student/home");
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmitQuiz = async (auto = false) => {
    if (submitCalled.current) return;
    if (!auto) {
      const ok = window.confirm("Are you sure you want to submit the quiz?");
      if (!ok) return;
    }
    submitCalled.current = true;
    try {
      fsApi.exit(); // leave fullscreen cleanly on submit
      await api.post("/quiz/submit", { studentQuizId });
      successToast("Quiz submitted ✅");
      navigate("/student/history");
    } catch (err) {
      submitCalled.current = false;
      const msg = err.response?.data?.message || "Submit failed";
      errorToast(msg);
      if (msg === "Already submitted") navigate("/student/home");
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatTime = (sec) => {
    if (sec === null) return "--:--";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const currentQuestion = batch[currentIndex];
  const globalIndex = offset + currentIndex;
  const isFirst = offset === 0 && currentIndex === 0;
  const isLast = offset + currentIndex + 1 >= (meta?.totalQuestions ?? 0);
  const isSaved = currentQuestion?.isSaved;

  const timerCls =
    timeLeft !== null && timeLeft <= 60
      ? "text-red-600 bg-red-50 border-red-200"
      : timeLeft !== null && timeLeft <= 300
        ? "text-yellow-600 bg-yellow-50 border-yellow-200"
        : "text-gray-700 bg-gray-50 border-gray-200";

  // ── Height style: dvh on all, no extra calc needed in fullscreen ──────────
  // iOS falls back to fill the visible area using dvh
  const heightStyle = { height: "100dvh" };

  // ── Gate screen: shown before quiz starts (desktop + Android) ────────────
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
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            Fullscreen Required
          </h2>
          <p className="text-sm text-gray-500 max-w-xs">
            This quiz must be taken in fullscreen mode. Exiting fullscreen will
            pause your test. You have <strong>{MAX_PAUSES} warnings</strong>{" "}
            before auto-submit.
          </p>
        </div>
        <button
          onClick={handleEnterAndStart}
          className="px-8 py-3 bg-primary text-white rounded-xl font-semibold text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          Enter Fullscreen &amp; Begin Quiz
        </button>
      </div>
    );
  }

  // ── Paused overlay ────────────────────────────────────────────────────────
  if (paused) {
    const remaining = MAX_PAUSES - pauseCount;
    return (
      <div
        className="flex flex-col items-center justify-center bg-gray-900/95 gap-6 px-6 text-center"
        style={heightStyle}
      >
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <LogOut size={28} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Quiz Paused</h2>
          <p className="text-sm text-gray-300 max-w-xs">
            You exited fullscreen. Your test is paused.
            {remaining > 0
              ? ` You have ${remaining} warning${remaining !== 1 ? "s" : ""} left before auto-submit.`
              : " This was your last warning — submitting now."}
          </p>
        </div>
        {remaining > 0 && (
          <button
            onClick={async () => {
              await enterFullscreen();
              resumeQuiz();
            }}
            className="px-8 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Return to Fullscreen
          </button>
        )}
        <button
          onClick={() => handleSubmitQuiz(true)}
          className="text-sm text-red-400 underline hover:text-red-300"
        >
          Submit quiz now
        </button>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!currentQuestion)
    return (
      <div
        className="flex items-center justify-center bg-gray-50"
        style={heightStyle}
      >
        <p className="text-gray-400 text-sm">Loading quiz…</p>
      </div>
    );

  // ── Main quiz UI ──────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col bg-gray-50 overflow-hidden"
      style={heightStyle}
    >
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-primary truncate max-w-[180px] md:max-w-sm">
            {meta?.title || "Quiz"}
          </span>
          <span className="text-xs text-gray-400">
            Question {globalIndex + 1} of {meta?.totalQuestions}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Warning badge */}
          {pauseCount > 0 && (
            <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-lg">
              ⚠ {pauseCount}/{MAX_PAUSES} exits
            </span>
          )}

          {/* Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-bold tabular-nums ${timerCls}`}
          >
            <Clock size={14} />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-1 bg-gray-100 shrink-0">
        <div
          className="h-1 bg-primary transition-all duration-300"
          style={{
            width: `${((globalIndex + 1) / (meta?.totalQuestions || 1)) * 100}%`,
          }}
        />
      </div>

      {/* ── Scrollable question area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Q{globalIndex + 1}
          </span>
          {isSaved && (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={11} /> Saved
            </span>
          )}
        </div>

        <p className="text-base font-semibold text-gray-800 leading-relaxed mb-5">
          {currentQuestion.questionText}
        </p>

        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = currentQuestion.selectedAns?.includes(opt.index);
            return (
              <button
                key={opt.id}
                onClick={() => handleOptionChange(currentQuestion, opt.index)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all
                  ${
                    isSelected
                      ? "bg-primary/10 border-primary text-primary font-semibold"
                      : "bg-white border-gray-200 text-gray-700 hover:border-primary/40 hover:bg-gray-50"
                  }`}
              >
                <span
                  className={`w-5 h-5 shrink-0 flex items-center justify-center rounded-full border-2 transition-all
                  ${isSelected ? "border-primary bg-primary text-white" : "border-gray-300"}`}
                >
                  {isSelected &&
                    (currentQuestion.type === "MULTI" ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-white block" />
                    ))}
                </span>
                <span>{opt.text}</span>
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

      {/* ── Sticky footer ── */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="default"
            startIcon={<ChevronLeft size={16} />}
            onClick={handlePrevious}
            disabled={isFirst}
            className="flex-1"
          >
            Prev
          </Button>

          <Button
            variant="success"
            startIcon={<Save size={15} />}
            onClick={handleSaveAndNext}
            disabled={!currentQuestion.selectedAns?.length}
            className="flex-[2]"
          >
            Save &amp; Next
          </Button>

          <Button
            variant="default"
            endIcon={<ChevronRight size={16} />}
            onClick={handleNext}
            disabled={isLast}
            className="flex-1"
          >
            Next
          </Button>
        </div>

        <Button
          variant="danger"
          startIcon={<LogOut size={15} />}
          onClick={() => handleSubmitQuiz()}
          className="w-full"
        >
          Submit Quiz
        </Button>
      </div>
    </div>
  );
};

export default StudentQuizPlay;
