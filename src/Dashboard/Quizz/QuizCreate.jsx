import { useEffect, useState } from "react";
import api from "../../Api";
import CustomSelect from "../Generic/CustomSelect";
import Button from "../Generic/Button";
import { useNavigate } from "react-router-dom";

const QuizCreate = () => {
    const navigate = useNavigate();
  // ---------------- STATE ----------------
  const [title, setTitle] = useState("");
  const [selectionType, setSelectionType] = useState("DYNAMIC");

  const [standards, setStandards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selectedStandard, setSelectedStandard] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const [chapterData, setChapterData] = useState([]);

  const [marksPerQue, setMarksPerQue] = useState(1);
  const [duration, setDuration] = useState(60);

  const [quizDate, setQuizDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // ---------------- FETCH ----------------
  const fetchStandards = async () => {
    const res = await api.get("/simple/standards");

    setStandards(
      res.data.data
        .filter((std) => !std.baseStandardId)
        .map((std) => ({
          label: std.name,
          value: std.id,
        }))
    );
  };

  const fetchSubjects = async (standardId) => {
    const res = await api.get(`/simple/standards/${standardId}/subjects`);

    const options = res.data.data.subjects.map((sub) => ({
        label: sub.subjectName,
        value: sub.subjectCode,
      }));

    setSubjects(options);
  };

  const fetchChapters = async (subjectIds) => {
    let all = [];

    for (let id of subjectIds) {
        const res = await api.get("/question-bank/chapter", {
        params: { subjectId: id },
      });
    //   const res = await api.get("/chapter", {
    //     params: { subjectId: id },
    //   });
      all = [...all, ...res.data];
    }

    setChapters(all);

    // initialize chapterData
    setChapterData(
      all.map((ch) => ({
        chapterId: ch.id,
        name: ch.name,
        queCount: 0,
      }))
    );
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    fetchStandards();
  }, []);

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

  // ---------------- UPDATE COUNT ----------------
  const updateCount = (chapterId, value) => {
    setChapterData((prev) =>
      prev.map((ch) =>
        ch.chapterId === chapterId
          ? { ...ch, queCount: Number(value) }
          : ch
      )
    );
  };

  // ---------------- CALCULATE ----------------
  const totalQuestions = chapterData.reduce(
    (sum, ch) => sum + ch.queCount,
    0
  );

  const totalMarks = totalQuestions * marksPerQue;

  // ---------------- SUBMIT ----------------
  const handleSubmit = async () => {
    try {
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
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">

      <h1 className="text-2xl font-bold text-primary mb-4">
        Create Quiz
      </h1>

      {/* ---------------- BASIC ---------------- */}
      <input
        type="text"
        placeholder="Quiz Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />

      <CustomSelect
        options={standards}
        value={selectedStandard}
        onChange={setSelectedStandard}
        placeholder="Select Standard"
      />

      <div className="mt-3">
        <select
          value={selectionType}
          onChange={(e) => setSelectionType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="DYNAMIC">Dynamic</option>
          <option value="FIXED">Fixed</option>
        </select>
      </div>

      {/* ---------------- SUBJECT ---------------- */}
      <div className="mt-4">
        <CustomSelect
          options={subjects}
          value={selectedSubjects}
          onChange={setSelectedSubjects}
          placeholder="Select Subjects"
          isMulti
        />
      </div>

      {/* ---------------- CHAPTER TABLE ---------------- */}
      {chapters.length > 0 && (
        <div className="mt-4 border rounded p-3">

          <h3 className="font-semibold mb-2">
            Select Question Count
          </h3>

          {chapterData.map((ch) => (
            <div
              key={ch.chapterId}
              className="flex justify-between items-center mb-2"
            >
              <span>{ch.name}</span>

              <input
                type="number"
                min="0"
                value={ch.queCount}
                onChange={(e) =>
                  updateCount(ch.chapterId, e.target.value)
                }
                className="w-20 p-1 border rounded"
              />
            </div>
          ))}
        </div>
      )}

      {/* ---------------- CONFIG ---------------- */}
      <div className="mt-4 grid grid-cols-2 gap-3">

        <input
          type="number"
          value={marksPerQue}
          onChange={(e) => setMarksPerQue(e.target.value)}
          placeholder="Marks per Question"
          className="p-2 border rounded"
        />

        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration (min)"
          className="p-2 border rounded"
        />

        <input
          type="date"
          value={quizDate}
          onChange={(e) => setQuizDate(e.target.value)}
          className="p-2 border rounded"
        />

        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="p-2 border rounded"
        />

        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="p-2 border rounded"
        />

      </div>

      {/* ---------------- SUMMARY ---------------- */}
      <div className="mt-4 bg-gray-100 p-3 rounded">

        <p>Total Questions: {totalQuestions}</p>
        <p>Total Marks: {totalMarks}</p>

      </div>

      {/* ---------------- SUBMIT ---------------- */}
      <div className="mt-4">
        <Button variant="success" onClick={handleSubmit}>
          Create Quiz
        </Button>
      </div>

    </div>
  );
};

export default QuizCreate;