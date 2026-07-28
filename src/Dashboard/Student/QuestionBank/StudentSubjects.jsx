import { useEffect, useState } from "react";
import api from "../../../Api";
import { useNavigate } from "react-router-dom";
import { Book } from "lucide-react";

const StudentSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/question-bank/student/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto mb-16">
      <h1 className="text-3xl font-bold text-primary mb-2">Question Bank</h1>
      <p className="text-gray-500 mb-8">
        Select a subject to view its chapters and questions.
      </p>

      {loading && (
        <p className="text-center text-gray-500 py-10">Loading subjects...</p>
      )}

      {!loading && subjects.length === 0 && (
        <div className="text-center bg-white p-10 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500">
            No subjects available for your standard yet.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {subjects.map((subject) => (
          <div
            key={subject.subjectCode}
            onClick={() => navigate(`./${subject.subjectCode}`)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Book size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{subject.subjectName || subject.name}</h2>
            {subject.Standard && (
              <p className="text-sm text-gray-500 mt-1">
                {subject.Standard.name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentSubjects;
