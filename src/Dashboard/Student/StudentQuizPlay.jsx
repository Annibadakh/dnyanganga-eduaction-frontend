import { useEffect, useState } from "react";
import api from "../../Api";
import Button from "../Generic/Button";
import { useNavigate, useParams } from "react-router-dom";

const BATCH_SIZE = 2;

const StudentQuizPlay = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [meta, setMeta] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [studentQuizId, setStudentQuizId] = useState(null);

  const [offset, setOffset] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // ---------------- START QUIZ ----------------
  const startQuiz = async () => {
    try {
      const res = await api.post(`/quiz/${quizId}/start`);

      setMeta(res.data.meta);
      setStudentQuizId(res.data.studentQuizId);

      // FIRST BATCH
      const formatted = res.data.questions.map((q) => ({
        ...q,
        selectedAns: [],
      }));

      console.log(formatted);

      setQuestions(formatted);

      // FULLSCREEN
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }

      // TIMER
      setTimeLeft(res.data.meta.duration * 60);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    startQuiz();
  }, []);

  // ---------------- FETCH BATCH ----------------
  const fetchBatch = async (newOffset) => {
    try {
      const res = await api.get(`/quiz/batch/${studentQuizId}`, {
        params: {
          offset: newOffset,
          limit: BATCH_SIZE,
        },
      });

      //   if (res.data.autoSubmit) {
      //     alert("Time up! Quiz submitted.");
      //     navigate("/student/home");
      //     return;
      //   }
      console.log(res.data.data);
      setQuestions(res.data.data);
      setOffset(newOffset);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- TIMER ----------------
  useEffect(() => {
    if (!timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz(true); // auto
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // ---------------- SAVE ANSWER ----------------
  const handleSave = async (questionId, selected) => {
    try {
      const res = await api.post("/quiz/save-answer", {
        studentQuizId,
        questionId,
        selectedAns: selected,
      });

      // update local state
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, selectedAns: selected } : q,
        ),
      );

      if (res.data.autoSubmitted) {
        alert("Time up! Quiz submitted.");
        navigate("/student/home");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- SUBMIT ----------------
  const handleSubmitQuiz = async (auto = false) => {
    if (!auto) {
      const confirmSubmit = window.confirm(
        "Are you sure you want to submit the quiz?",
      );
      if (!confirmSubmit) return;
    }

    try {
      await api.post("/quiz/submit", {
        studentQuizId,
      });

      alert("Quiz submitted successfully ✅");

      navigate("/student/home");
    } catch (err) {
      console.error(err);

      if (err.response?.data?.message === "Already submitted") {
        navigate("/student/home");
      }
    }
  };

  // ---------------- FORMAT TIME ----------------
  const formatTime = (sec) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">{meta?.title || "Quiz"}</h1>

        <div className="text-red-500 font-bold">⏱ {formatTime(timeLeft)}</div>

        <Button variant="success" onClick={() => handleSubmitQuiz()}>
          Submit
        </Button>
      </div>

      {/* QUESTIONS */}
      {questions.map((q, index) => (
        <div key={q.id} className="mb-6 p-3 border rounded">
          <p className="font-semibold mb-2">
            Q{offset + index + 1}. {q.questionText}
          </p>

          {q.options.map((opt) => (
            <div key={opt.id} className="mb-1">
              <label className="flex gap-2 items-center cursor-pointer">
                <input
                  type={q.type === "MULTI" ? "checkbox" : "radio"}
                  checked={q.selectedAns?.includes(opt.index)}
                  onChange={() => {
                    let selected = [];

                    if (q.type === "MULTI") {
                      if (q.selectedAns?.includes(opt.index)) {
                        selected = q.selectedAns.filter((i) => i !== opt.index);
                      } else {
                        selected = [...(q.selectedAns || []), opt.index];
                      }
                    } else {
                      selected = [opt.index];
                    }

                    handleSave(q.id, selected);
                  }}
                />
                {opt.text}
              </label>
            </div>
          ))}
        </div>
      ))}

      {/* NAVIGATION */}
      <div className="flex justify-between mt-6">
        <Button
          disabled={offset === 0}
          onClick={() => fetchBatch(offset - BATCH_SIZE)}
        >
          Previous
        </Button>

        <Button onClick={() => fetchBatch(offset + BATCH_SIZE)}>Next</Button>
      </div>
    </div>
  );
};

export default StudentQuizPlay;
