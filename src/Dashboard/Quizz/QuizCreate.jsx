import { useEffect, useState } from "react";
import api from "../../Api";
import CustomSelect from "../Generic/CustomSelect";
import Button from "../Generic/Button";
import { useNavigate } from "react-router-dom";

const QuizCreate = () => {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [title, setTitle]                   = useState("");
  const [selectionType, setSelectionType]   = useState("DYNAMIC");
  const [standards, setStandards]           = useState([]);
  const [subjects, setSubjects]             = useState([]);
  const [chapters, setChapters]             = useState([]);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [chapterData, setChapterData]       = useState([]);
  const [marksPerQue, setMarksPerQue]       = useState(1);
  const [duration, setDuration]             = useState(60);
  const [quizDate, setQuizDate]             = useState("");
  const [startTime, setStartTime]           = useState("");
  const [endTime, setEndTime]               = useState("");
  const [submitting, setSubmitting]         = useState(false);

  // ---------------- FETCH ----------------
  const fetchStandards = async () => {
    const res = await api.get("/simple/standards");
    setStandards(
      res.data.data
        .filter((std) => !std.baseStandardId)
        .map((std) => ({ label: std.name, value: std.id }))
    );
  };

  const fetchSubjects = async (standardId) => {
    const res = await api.get(`/simple/standards/${standardId}/subjects`);
    setSubjects(
      res.data.data.subjects.map((sub) => ({
        label: sub.subjectName,
        value: sub.subjectCode,
      }))
    );
  };

  const fetchChapters = async (subjectIds) => {
    let all = [];
    for (let id of subjectIds) {
      const res = await api.get("/question-bank/chapter", { params: { subjectId: id } });
      all = [...all, ...res.data];
    }
    setChapters(all);
    setChapterData(all.map((ch) => ({ chapterId: ch.id, name: ch.name, queCount: 0 })));
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => { fetchStandards(); }, []);

  useEffect(() => {
    if (selectedStandard) {
      fetchSubjects(selectedStandard.value);
      setSelectedSubjects([]);
      setChapters([]);
    }
  }, [selectedStandard]);

  useEffect(() => {
    if (selectedSubjects.length > 0) {
      fetchChapters(selectedSubjects.map((s) => s.value));
    }
  }, [selectedSubjects]);

  // ---------------- HELPERS ----------------
  const updateCount = (chapterId, value) =>
    setChapterData((prev) =>
      prev.map((ch) =>
        ch.chapterId === chapterId ? { ...ch, queCount: Number(value) } : ch
      )
    );

  const totalQuestions = chapterData.reduce((sum, ch) => sum + ch.queCount, 0);
  const totalMarks     = totalQuestions * marksPerQue;

  // ---------------- SUBMIT ----------------
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        title,
        standardId: selectedStandard.value,
        selectionType,
        marksPerQue,
        duration,
        quizDate,
        startTime,
        endTime,
        totalMarks,
        totalQuestions,
        chapters: chapterData.filter((c) => c.queCount > 0),
      };
      await api.post("/quiz", payload);
      alert("Quiz Created ✅");
      navigate("../");
    } catch (err) {
      console.error(err);
      alert("Error creating quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition";
  const labelCls = "block text-sm text-gray-600 mb-1";

  return (
    <div className="p-2 container mx-auto">

      {/* ── Page Title ── */}
      <h1 className="text-3xl text-center font-bold text-primary mb-6">
        Create Quiz
      </h1>

      {/* ── Section: Basic Info ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <label className={labelCls}>Quiz Title</label>
            <input
              type="text"
              placeholder="Enter quiz title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Standard */}
          <div>
            <label className={labelCls}>Standard</label>
            <CustomSelect
              options={standards}
              value={selectedStandard}
              onChange={setSelectedStandard}
              placeholder="Select Standard"
              isRequired={false}
            />
          </div>

          {/* Selection Type */}
          <div>
            <label className={labelCls}>Selection Type</label>
            <select
              value={selectionType}
              onChange={(e) => setSelectionType(e.target.value)}
              className={inputCls}
            >
              <option value="DYNAMIC">Dynamic</option>
              <option value="FIXED">Fixed</option>
            </select>
          </div>

          {/* Subjects */}
          <div className="md:col-span-2">
            <label className={labelCls}>Subjects</label>
            <CustomSelect
              options={subjects}
              value={selectedSubjects}
              onChange={setSelectedSubjects}
              placeholder="Select Subjects"
              isMulti
              isRequired={false}
            />
          </div>
        </div>
      </div>

      {/* ── Section: Chapter Question Count ── */}
      {chapters.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
            Questions per Chapter
          </h2>

          <div className="divide-y divide-gray-100">
            {chapterData.map((ch) => (
              <div
                key={ch.chapterId}
                className="flex items-center justify-between py-2.5"
              >
                <span className="text-sm text-gray-700">{ch.name}</span>
                <input
                  type="number"
                  min="0"
                  value={ch.queCount}
                  onChange={(e) => updateCount(ch.chapterId, e.target.value)}
                  className="w-24 p-2 border border-gray-300 rounded-lg text-sm text-center
                             focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section: Quiz Configuration ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
          Quiz Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Marks per Question</label>
            <input
              type="number"
              value={marksPerQue}
              onChange={(e) => setMarksPerQue(e.target.value)}
              placeholder="e.g. 1"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 60"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Quiz Date</label>
            <input
              type="date"
              value={quizDate}
              onChange={(e) => setQuizDate(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ── Summary ── */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
          <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-1">
            Total Questions
          </p>
          <p className="text-3xl font-bold text-blue-700">{totalQuestions}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <p className="text-xs text-green-500 font-semibold uppercase tracking-wide mb-1">
            Total Marks
          </p>
          <p className="text-3xl font-bold text-green-700">{totalMarks}</p>
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate("../")}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-300
                     hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <Button variant="success" loading={submitting} onClick={handleSubmit}>
          Create Quiz
        </Button>
      </div>

    </div>
  );
};

export default QuizCreate;