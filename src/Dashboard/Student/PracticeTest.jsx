import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, RotateCcw, Shuffle, Eye } from "lucide-react";
import api from "../../Api";
import Button from "../Generic/Button";
import CustomMultiSelect from "../Generic/CustomMultiSelect";
import DataTable from "../Generic/DataTable";
import { useToast } from "../../useToast";

// Student self-practice setup. Every choice is optional:
//   nothing selected          → 3 random subjects × 2 chapters × 10 questions
//   subject(s) only           → 6 chapters spread across them × 10 questions
//   manual chapter counts     → student's counts, total must be exactly 60
const PracticeTest = () => {
  const navigate = useNavigate();
  const { errorToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [settings, setSettings] = useState({ totalQuestions: 60, duration: 60, marksPerQue: 1 });
  const [openPractice, setOpenPractice] = useState(null);
  const [history, setHistory] = useState([]);

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [manualChapters, setManualChapters] = useState(false);
  const [counts, setCounts] = useState({}); // chapterId → queCount

  useEffect(() => {
    Promise.all([api.get("/quiz/practice/options"), api.get("/quiz/practice/history")])
      .then(([optRes, histRes]) => {
        setSubjects(optRes.data.subjects || []);
        setSettings(optRes.data.settings || settings);
        setOpenPractice(optRes.data.openPractice);
        setHistory(histRes.data.data || []);
      })
      .catch((err) => errorToast(err.response?.data?.message || "Failed to load practice options"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  // Subjects whose chapters can be set manually: the selected ones, or all if none selected
  const chapterSubjects = useMemo(() => {
    if (selectedSubjects.length === 0) return subjects;
    const ids = selectedSubjects.map((s) => String(s.value));
    return subjects.filter((s) => ids.includes(String(s.subjectId)));
  }, [subjects, selectedSubjects]);

  const visibleChapterIds = useMemo(
    () => new Set(chapterSubjects.flatMap((s) => s.chapters.map((c) => c.chapterId))),
    [chapterSubjects],
  );

  const manualTotal = Object.entries(counts)
    .filter(([id]) => visibleChapterIds.has(Number(id)))
    .reduce((sum, [, n]) => sum + n, 0);

  const mode = manualChapters ? "manual" : selectedSubjects.length > 0 ? "subject" : "auto";
  const canStart = mode !== "manual" || manualTotal === settings.totalQuestions;

  const setCount = (chapter, value) => {
    const n = Math.min(Math.max(Number(value) || 0, 0), chapter.available);
    setCounts((prev) => ({ ...prev, [chapter.chapterId]: n }));
  };

  const handleStart = () => {
    const practiceConfig = {
      subjects: selectedSubjects.map((s) => s.value),
      chapters:
        mode === "manual"
          ? Object.entries(counts)
              .filter(([id, n]) => n > 0 && visibleChapterIds.has(Number(id)))
              .map(([chapterId, queCount]) => ({ chapterId: Number(chapterId), queCount }))
          : [],
    };
    navigate("/student/practice/play", { state: { practiceConfig } });
  };

  const modeText = {
    auto: `Auto: 3 random subjects × 2 chapters × 10 questions`,
    subject: `Auto chapters: 6 chapters from the selected subject(s) × 10 questions`,
    manual: `Manual: ${manualTotal} / ${settings.totalQuestions} questions selected`,
  }[mode];

  const historyColumns = [
    { header: "Sr. No.", render: (_, i) => i + 1 },
    {
      header: "Date",
      render: (row) =>
        new Date(row.submittedAt || row.startedAt).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
    },
    { header: "Questions", accessor: "totalQuestions" },
    {
      header: "Score",
      render: (row) => (
        <span className="font-semibold text-gray-800">
          {row.marksObtained} / {row.totalMarks}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => (row.status === "AUTO_SUBMITTED" ? "Auto Submitted" : "Submitted"),
    },
    {
      header: "Result",
      render: (row) => (
        <Button
          variant="primary"
          startIcon={<Eye size={15} />}
          onClick={() => navigate(`/student/result/${row.studentQuizId}`)}
        >
          View
        </Button>
      ),
    },
  ];

  if (loading) {
    return <p className="text-center text-gray-400 py-10">Loading...</p>;
  }

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-2">Practice Test</h1>
      <p className="text-center text-sm text-gray-500 mb-6">
        {settings.totalQuestions} questions · {settings.duration} minutes · {settings.marksPerQue} mark
        {settings.marksPerQue !== 1 ? "s" : ""} each
      </p>

      {/* ── Resume ── */}
      {openPractice && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-yellow-800">You have a practice test in progress</p>
            <p className="text-sm text-yellow-700">
              Time ends at{" "}
              {new Date(openPractice.endsAt).toLocaleTimeString("en-GB", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
              . Finish it before starting a new one.
            </p>
          </div>
          <Button
            variant="warning"
            startIcon={<RotateCcw size={16} />}
            onClick={() => navigate("/student/practice/play")}
          >
            Resume
          </Button>
        </div>
      )}

      {/* ── Setup ── */}
      {!openPractice && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
          <h2 className="text-base font-semibold text-gray-700 mb-1">Set up your practice</h2>
          <p className="text-xs text-gray-500 mb-4">
            Everything is optional — leave it empty and we&apos;ll pick the questions for you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-4">
            <CustomMultiSelect
              label="Subjects (optional)"
              options={subjects.map((s) => ({ label: s.subjectName, value: s.subjectId }))}
              value={selectedSubjects}
              onChange={(v) => setSelectedSubjects(v || [])}
              isRequired={false}
              placeholder="Auto-select subjects"
            />
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer select-none h-[42px]">
              <input
                type="checkbox"
                checked={manualChapters}
                onChange={(e) => setManualChapters(e.target.checked)}
                className="rounded border-gray-300 text-[#094D9E] focus:ring-[#094D9E] w-4 h-4"
              />
              Choose chapters and question counts myself
            </label>
          </div>

          {manualChapters && (
            <div className="border border-gray-100 rounded-lg mb-4 max-h-[420px] overflow-y-auto">
              {chapterSubjects.map((sub) => (
                <div key={sub.subjectId}>
                  <p className="sticky top-0 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 border-b">
                    {sub.subjectName}
                  </p>
                  <div className="divide-y divide-gray-100">
                    {sub.chapters.map((ch) => (
                      <div key={ch.chapterId} className="flex items-center justify-between px-4 py-2.5 gap-3">
                        <div>
                          <span className="text-sm text-gray-700">{ch.name}</span>
                          <p className="text-xs text-gray-400">{ch.available} available</p>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max={ch.available}
                          value={counts[ch.chapterId] || 0}
                          onChange={(e) => setCount(ch, e.target.value)}
                          className="w-24 p-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {chapterSubjects.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-6">No practice questions available.</p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
            <p
              className={`text-sm font-medium flex items-center gap-2 ${
                mode === "manual" && !canStart ? "text-red-600" : "text-gray-600"
              }`}
            >
              {mode !== "manual" && <Shuffle size={15} />}
              {modeText}
            </p>
            <Button
              variant="success"
              startIcon={<PlayCircle size={16} />}
              disabled={!canStart || subjects.length === 0}
              onClick={handleStart}
            >
              Start Practice
            </Button>
          </div>
        </div>
      )}

      {/* ── History ── */}
      <h2 className="text-xl font-semibold text-secondary mb-3">Practice History</h2>
      <DataTable
        columns={historyColumns}
        data={history}
        loading={false}
        rowKey="studentQuizId"
        emptyMessage="No practice tests yet."
      />
    </div>
  );
};

export default PracticeTest;
