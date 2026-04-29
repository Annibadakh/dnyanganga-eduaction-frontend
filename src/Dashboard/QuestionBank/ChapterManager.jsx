import { useEffect, useState } from "react";
import api from "../../Api";
import CustomSelect from "../Generic/CustomSelect";
import DataTable from "../Generic/DataTable";
import Button from "../Generic/Button";
import AddChapterModal from "./AddChapterModal";
import QuestionManager from "./QuestionManager";

const ChapterManager = () => {
  const [standards, setStandards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selectedStandard, setSelectedStandard] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  // ---------------- FETCH STANDARDS ----------------
  const fetchStandards = async () => {
    try {
      const res = await api.get("/simple/standards");
      const options = res.data.data
        .filter((std) => !std.baseStandardId)
        .map((std) => ({
          label: std.name,
          value: std.id,
        }));

      setStandards(options);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- FETCH SUBJECTS ----------------
  const fetchSubjects = async (standardId) => {
    try {
      const res = await api.get(`/simple/standards/${standardId}/subjects`);
      // console.log("Subjects Response:", res.data.data.subjects); // Debug log
      const options = res.data.data.subjects.map((sub) => ({
        label: sub.subjectName,
        value: sub.subjectCode,
      }));

      setSubjects(options);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- FETCH CHAPTERS ----------------
  const fetchChapters = async (subjectId) => {
    setLoading(true);
    try {
      const res = await api.get("/question-bank/chapter", {
        params: { subjectId },
      });
      // console.log("Chapters Response:", res.data); // Debug log
      setChapters(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    fetchStandards();
  }, []);

  useEffect(() => {
    if (selectedStandard) {
      setSelectedSubject(null);
      setChapters([]);
      fetchSubjects(selectedStandard.value);
    }
  }, [selectedStandard]);

  useEffect(() => {
    if (selectedSubject) {
      fetchChapters(selectedSubject.value);
    }
  }, [selectedSubject]);

  // ---------------- TABLE ----------------
  const columns = [
    {
      header: "Sr. No.",
      render: (_, index) => index + 1,
    },
    {
      header: "Chapter Name",
      accessor: "name",
    },
    {
      header: "Total Questions",
      accessor: "questionCount",
    },
    {
      header: "Action",
      render: (row) => (
        <Button variant="primary" onClick={() => handleSelectChapter(row)}>
          View
        </Button>
      ),
    },
  ];

  const handleSelectChapter = (chapter) => {
    setSelectedChapter(chapter);
  };

  if (selectedChapter) {
    return (
      <QuestionManager
        chapter={selectedChapter}
        onBack={() => setSelectedChapter(null)}
      />
    );
  }

  return (
    <div className="p-4 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">
        Chapter Management
      </h1>

      {/* ---------------- FILTERS ---------------- */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        {/* Standard */}
        <div className="w-full md:w-1/3">
          <CustomSelect
            options={standards}
            value={selectedStandard}
            onChange={setSelectedStandard}
            placeholder="Select Standard"
          />
        </div>

        {/* Subject */}
        <div className="w-full md:w-1/3">
          <CustomSelect
            options={subjects}
            value={selectedSubject}
            onChange={setSelectedSubject}
            placeholder="Select Subject"
            disabled={!selectedStandard}
          />
        </div>

        {/* Add Chapter */}
        <div className="w-full md:w-1/3 flex items-center">
          <Button
            variant="success"
            onClick={() => setShowModal(true)}
            className="w-full"
            disabled={!selectedSubject}
          >
            + Add Chapter
          </Button>
        </div>
      </div>
      <AddChapterModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        subjectId={selectedSubject?.value}
        onSuccess={() => fetchChapters(selectedSubject.value)}
      />
      {/* ---------------- TABLE ---------------- */}
      <DataTable
        columns={columns}
        data={chapters}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default ChapterManager;
