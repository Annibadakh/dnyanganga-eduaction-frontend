import { useEffect, useState } from "react";
import api from "../../../Api";
import { useNavigate, useParams } from "react-router-dom";
import { List, ArrowLeft } from "lucide-react";
import Button from "../../Generic/Button";

const StudentChapters = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { subjectId } = useParams();

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/question-bank/student/chapters/${subjectId}`);
      setChapters(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [subjectId]);

  return (
    <div className="p-4 max-w-6xl mx-auto mb-16">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate("../question-bank")}
        >
          <ArrowLeft size={16} /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-primary">Chapters</h1>
          {chapters.length > 0 && chapters[0].Subject && (
            <p className="text-gray-500">
              {chapters[0].Subject.name || chapters[0].Subject.subjectName}
            </p>
          )}
        </div>
      </div>

      {loading && (
        <p className="text-center text-gray-500 py-10">Loading chapters...</p>
      )}

      {!loading && chapters.length === 0 && (
        <div className="text-center bg-white p-10 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500">No chapters found for this subject.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            onClick={() => navigate(`./${chapter.id}`)}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <List size={20} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors">
                {chapter.name}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentChapters;
