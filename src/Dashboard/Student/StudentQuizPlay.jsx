import { useEffect, useState, useCallback } from "react";
import api from "../../Api";
import Button from "../Generic/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../useToast";
import { ChevronLeft, ChevronRight, Save, LogOut, Clock, CheckCircle2 } from "lucide-react";

const BATCH_SIZE = 5;

const StudentQuizPlay = () => {
  const { quizId }  = useParams();
  const navigate    = useNavigate();
  const { successToast, errorToast, infoToast } = useToast();

  const [meta, setMeta]                   = useState(null);
  const [studentQuizId, setStudentQuizId] = useState(null);
  const [batch, setBatch]                 = useState([]);
  const [offset, setOffset]               = useState(0);
  const [currentIndex, setCurrentIndex]   = useState(0);
  const [timeLeft, setTimeLeft]           = useState(null);

  // ── Start quiz & resume timer ─────────────────────────────────────────────
  const startQuiz = async () => {
    try {
      const res = await api.post(`/quiz/${quizId}/start`);
      const { meta: quizMeta, studentQuizId: sqId } = res.data;

      setMeta(quizMeta);
      setStudentQuizId(sqId);

      // ✅ TIMER RESUME FIX:
      // Backend returns meta.startTime (studentQuiz.startedAt) and meta.duration (minutes).
      // Calculate how many seconds have already elapsed since the quiz started,
      // then set timeLeft = totalSeconds - elapsed. This survives page refreshes.
      const totalSeconds  = quizMeta.duration * 60;
      const startedAt     = new Date(quizMeta.startTime).getTime();
      const elapsedSecs   = Math.floor((Date.now() - startedAt) / 1000);
      const remaining     = Math.max(totalSeconds - elapsedSecs, 0);
      setTimeLeft(remaining);

      fetchBatch(sqId, 0);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to start quiz";
      errorToast(msg);
      if (msg === "Quiz already submitted") navigate("/student/home");
    }
  };

  useEffect(() => { startQuiz(); }, []);

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
      if (msg === "Quiz already submitted" || msg === "Time up") navigate("/student/home");
    }
  };

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmitQuiz(true);
      return;
    }

    const timer = setInterval(() => {
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
  }, [timeLeft]);

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
      prev.map((item) => (item.id === q.id ? { ...item, selectedAns: selected } : item))
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
    if (!q.selectedAns?.length) { infoToast("Please select an answer"); return; }

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
      if (msg === "Time up" || msg === "Quiz already submitted") navigate("/student/home");
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmitQuiz = async (auto = false) => {
    if (!auto) {
      const ok = window.confirm("Are you sure you want to submit the quiz?");
      if (!ok) return;
    }
    try {
      await api.post("/quiz/submit", { studentQuizId });
      successToast("Quiz submitted ✅");
      navigate("/student/home");
    } catch (err) {
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
  const globalIndex     = offset + currentIndex;
  const isFirst         = offset === 0 && currentIndex === 0;
  const isLast          = offset + currentIndex + 1 >= (meta?.totalQuestions ?? 0);
  const isSaved         = currentQuestion?.isSaved;

  // timer colour: red when under 60s, amber under 5 min
  const timerCls =
    timeLeft !== null && timeLeft <= 60
      ? "text-red-600 bg-red-50 border-red-200"
      : timeLeft !== null && timeLeft <= 300
      ? "text-yellow-600 bg-yellow-50 border-yellow-200"
      : "text-gray-700 bg-gray-50 border-gray-200";

  if (!currentQuestion) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400 text-sm">Loading quiz…</p>
    </div>
  );

  return (
    // Full-screen flex column — no page scroll; inner content scrolls
    <div className="min-h-screen max-h-screen flex flex-col bg-gray-50 overflow-hidden">

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

        {/* Timer */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-bold tabular-nums ${timerCls}`}>
          <Clock size={14} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-1 bg-gray-100 shrink-0">
        <div
          className="h-1 bg-primary transition-all duration-300"
          style={{ width: `${((globalIndex + 1) / (meta?.totalQuestions || 1)) * 100}%` }}
        />
      </div>

      {/* ── Scrollable question area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5">

        {/* Question number + saved badge */}
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

        {/* Question text */}
        <p className="text-base font-semibold text-gray-800 leading-relaxed mb-5">
          {currentQuestion.questionText}
        </p>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = currentQuestion.selectedAns?.includes(opt.index);
            return (
              <button
                key={opt.id}
                onClick={() => handleOptionChange(currentQuestion, opt.index)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all
                  ${isSelected
                    ? "bg-primary/10 border-primary text-primary font-semibold"
                    : "bg-white border-gray-200 text-gray-700 hover:border-primary/40 hover:bg-gray-50"
                  }`}
              >
                {/* Radio / checkbox indicator */}
                <span className={`w-5 h-5 shrink-0 flex items-center justify-center rounded-full border-2 transition-all
                  ${isSelected
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    currentQuestion.type === "MULTI"
                      ? <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      : <span className="w-2 h-2 rounded-full bg-white block" />
                  )}
                </span>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Multi-select hint */}
        {currentQuestion.type === "MULTI" && (
          <p className="mt-4 text-xs text-gray-400 text-center">
            Multiple answers allowed — select all that apply
          </p>
        )}
      </div>

      {/* ── Sticky footer ── */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 shrink-0">

        {/* Nav row */}
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
            Save & Next
          </Button>

          <Button
            variant="default"
            onClick={handleNext}
            disabled={isLast}
            className="flex-1"
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>

        {/* Submit row */}
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