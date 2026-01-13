import React, { useEffect, useState } from "react";
import api from "../../Api";

const StudentMarksTable = ({ context, isEditMode, onRefresh }) => {
  const { examCentre, standard, examYear, fromSeat, toSeat } = context;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focusedRow, setFocusedRow] = useState(null);

  /* ------------ Sort subjects in specific order ------------ */
  const getSortedSubjects = (subjects) => {
    if (!subjects || subjects.length === 0) return [];

    // Define order for 10th standard
    const order10th = [
      "Math-1",
      "Math-2", 
      "Science-1",
      "Science-2",
      "English"
    ];

    // Define order for 12th standard
    const order12th = [
      "Physics",
      "Chemistry",
      "Mathematics",
      "Biology"
    ];

    const priorityOrder = (standard == "10th" ? order10th : order12th);

    return [...subjects].sort((a, b) => {
      const aIndex = priorityOrder.findIndex(
        name => a.subjectName.toLowerCase() === name.toLowerCase()
      );
      const bIndex = priorityOrder.findIndex(
        name => b.subjectName.toLowerCase() === name.toLowerCase()
      );

      // If both are in priority list, sort by their position
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      // If only 'a' is in priority, it comes first
      if (aIndex !== -1) return -1;

      // If only 'b' is in priority, it comes first
      if (bIndex !== -1) return 1;

      // If neither are in priority, sort alphabetically
      return a.subjectName.localeCompare(b.subjectName);
    });
  };

  /* ------------ Fetch students with marks ------------ */
  useEffect(() => {
    if (!context) return;
    fetchStudents();
  }, [context]);

  const fetchStudents = () => {
    if (loading) return; // Prevent multiple simultaneous fetches
    
    setLoading(true);

    api
      .get("/admin/studentsWithMarks", {
        params: {
          examCentre,
          standard,
          examYear,
          fromSeat,
          toSeat,
        },
      })
      .then((res) => {
        setStudents(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching students", err);
      })
      .finally(() => {
        setTimeout(() => setLoading(false), 100); // Small delay to prevent blinking
      });
  };

  /* ------------ Save mark on blur ------------ */
  const saveMark = async (studentId, subjectCode, subjectName, value, totalMarks) => {
    if (value === "") return;

    const numValue = Number(value);

    // Validate marks - should not exceed total marks
    if (numValue > totalMarks) {
      alert(`Marks cannot exceed ${totalMarks} for this subject!`);
      // Reset to previous value by refetching
      const student = students.find(s => s.studentId === studentId);
      const subject = student?.subjects?.find(sub => sub.subjectCode === subjectCode);
      
      setStudents((prev) =>
        prev.map((s) =>
          s.studentId === studentId
            ? {
                ...s,
                subjects: s.subjects.map(sub =>
                  sub.subjectCode === subjectCode
                    ? { ...sub, marks: subject?.marks ?? null }
                    : sub
                )
              }
            : s
        )
      );
      return;
    }

    // Validate marks - should not be negative
    if (numValue < 0) {
      alert("Marks cannot be negative!");
      const student = students.find(s => s.studentId === studentId);
      const subject = student?.subjects?.find(sub => sub.subjectCode === subjectCode);
      
      setStudents((prev) =>
        prev.map((s) =>
          s.studentId === studentId
            ? {
                ...s,
                subjects: s.subjects.map(sub =>
                  sub.subjectCode === subjectCode
                    ? { ...sub, marks: subject?.marks ?? null }
                    : sub
                )
              }
            : s
        )
      );
      return;
    }

    try {
      await api.post("/admin/saveMarks", {
        studentId,
        subject: subjectName,
        marks: numValue,
      });
    } catch (error) {
      console.error("Error saving mark", error);
      alert("Failed to save marks. Please try again.");
    }
  };

  /* ------------ Update local state ------------ */
  const updateLocalMark = (studentId, subjectCode, value) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? {
              ...s,
              subjects: s.subjects.map((sub) =>
                sub.subjectCode === subjectCode
                  ? { ...sub, marks: value }
                  : sub
              ),
            }
          : s
      )
    );
  };

  /* ------------ Student-level status ------------ */
  const getStudentStatus = (student) => {
    const studentSubjects = student.subjects || [];

    const filledCount = studentSubjects.filter(
      (subject) => subject.marks !== null && subject.marks !== ""
    ).length;

    if (filledCount === 0) return "NOT_STARTED";
    if (filledCount === studentSubjects.length) return "COMPLETED";
    return "PARTIAL";
  };

  /* ------------ Batch-level status ------------ */
  const getBatchStatusCounts = () => {
    let completed = 0;
    let partial = 0;
    let notStarted = 0;

    students.forEach((student) => {
      const status = getStudentStatus(student);
      if (status === "COMPLETED") completed++;
      else if (status === "PARTIAL") partial++;
      else notStarted++;
    });

    return { completed, partial, notStarted };
  };

  const batchStatus = getBatchStatusCounts();

  // Expose refresh function to parent - only set once
  useEffect(() => {
    if (onRefresh) {
      onRefresh(fetchStudents);
    }
  }, []); // Empty dependency to prevent re-registering

  if (loading && students.length === 0) {
    return (
      <div className="mt-3 flex items-center justify-center py-8">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  if (!students.length) {
    return (
      <div className="mt-3 rounded border-2 border-dashed border-customgray bg-gray-50 py-8 text-center">
        <p className="text-md text-gray-500">No students found for this batch</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* -------- Batch Summary -------- */}
      <div className="mb-3 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded border-l-4 border-green-500 bg-green-50 p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-800">Completed</p>
              <p className="text-lg font-bold text-green-600">
                {batchStatus.completed}
              </p>
            </div>
            <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div className="rounded border-l-4 border-secondary bg-orange-50 p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-orange-800">Partial</p>
              <p className="text-lg font-bold text-secondary">
                {batchStatus.partial}
              </p>
            </div>
            <svg className="h-5 w-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div className="rounded border-l-4 border-red-500 bg-red-50 p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-800">Not Started</p>
              <p className="text-lg font-bold text-red-600">
                {batchStatus.notStarted}
              </p>
            </div>
            <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* -------- Table -------- */}
      <div className="overflow-hidden rounded border border-gray-300">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-primary to-tertiary">
              <tr>
                <th className="border-r border-white/20 px-2 py-1.5 text-left font-semibold uppercase tracking-wide text-customwhite whitespace-nowrap">
                  Sr No.
                </th><th className="border-r border-white/20 px-2 py-1.5 text-left font-semibold uppercase tracking-wide text-customwhite whitespace-nowrap">
                  Student ID.
                </th>
                <th className="border-r border-white/20 px-2 py-1.5 text-left font-semibold uppercase tracking-wide text-customwhite whitespace-nowrap">
                  Student Name
                </th>
                
                <th className="border-r border-white/20 px-2 py-1.5 text-left font-semibold uppercase tracking-wide text-customwhite whitespace-nowrap">
                  Seat No.
                </th>
                <th className="border-r border-white/20 px-2 py-1.5 text-center font-semibold uppercase tracking-wide text-customwhite whitespace-nowrap">
                  Group
                </th>
                <th className="border-r px-2 py-1.5 text-left font-semibold uppercase tracking-wide text-customwhite whitespace-nowrap">
                  Subjects & Marks
                </th>
                <th className="border-r border-white/20 px-2 py-1.5 text-center font-semibold uppercase tracking-wide text-customwhite whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="bg-customwhite">
              {students.map((student, idx) => {
                const status = getStudentStatus(student);
                const isRowFocused = focusedRow === student.studentId;

                return (
                  <tr
                    key={student.studentId}
                    className={`border-b whitespace-nowrap border-gray-200 transition-all duration-150 ${
                      isRowFocused && isEditMode
                        ? "bg-blue-50 ring-2 ring-inset ring-fourthcolor"
                        : "hover:bg-gray-50"
                    }`}
                    onWheel={(e) => e.target.blur()}
                    onMouseEnter={() => isEditMode && setFocusedRow(student.studentId)}
                    onMouseLeave={() => setFocusedRow(null)}
                  >
                    <td className="border-r whitespace-nowrap border-gray-200 px-2 py-1.5 font-medium text-customblack">
                      {idx+1}
                    </td>
                    <td className="border-r whitespace-nowrap border-gray-200 px-2 py-1.5 font-medium text-customblack">
                      {student.studentId}
                    </td>

                    <td className="border-r whitespace-nowrap border-gray-200 px-2 py-1.5 font-medium text-customblack">
                      {student.studentName}
                    </td>

                    <td className="border-r whitespace-nowrap border-gray-200 px-2 py-1.5 text-gray-700">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[13px]">
                        DE
                        {String(student.examCentre).padStart(2, "0")}
                        {String(student.seatNum).padStart(3, "0")}
                      </span>
                    </td>
                    <td className="border-r whitespace-nowrap border-gray-200 px-2 py-1.5 text-center">
                      <span className="inline-flex rounded bg-tertiary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {student.subjectGroup}
                      </span>
                    </td>

                    <td className="border-r px-2 py-1.5">
                      <div className="flex gap-2">
                        {getSortedSubjects(student.subjects || []).map((subject) => (
                          <div key={subject.subjectCode} className="flex items-center gap-1">
                            <label 
                              className="text-[12px] font-medium text-gray-600 whitespace-nowrap"
                              title={`${subject.subjectName} (Out of ${subject.totalMarks})`}
                            >
                              {subject.subjectName}:
                            </label>
                            {isEditMode ? (
                              <input
                                type="number"
                                className="w-14 rounded border border-gray-300 px-1.5 py-1 text-sm transition-all duration-150 focus:border-primary focus:outline-none focus:ring-1 focus:ring-fourthcolor/40 hover:border-tertiary"
                                value={subject.marks === null ? "" : subject.marks}
                                onChange={(e) =>
                                  updateLocalMark(
                                    student.studentId,
                                    subject.subjectCode,
                                    e.target.value
                                  )
                                }
                                onBlur={(e) =>
                                  saveMark(
                                    student.studentId,
                                    subject.subjectCode,
                                    subject.subjectName,
                                    e.target.value,
                                    subject.totalMarks
                                  )
                                }
                                onFocus={() => setFocusedRow(student.studentId)}
                                placeholder={`/${subject.totalMarks}`}
                                max={subject.totalMarks}
                                min="0"
                              />
                            ) : (
                              <span className="w-14 rounded border border-gray-200 bg-gray-50 px-1.5 py-1 text-sm text-center inline-block">
                                {subject.marks === null ? "--" : subject.marks}/{subject.totalMarks}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="border-r whitespace-nowrap border-gray-200 px-2 py-1.5 text-center font-semibold">
                      {status === "COMPLETED" && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-800">
                          <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Done
                        </span>
                      )}
                      {status === "PARTIAL" && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-800">
                          <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Partial
                        </span>
                      )}
                      {status === "NOT_STARTED" && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
                          <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MarksContextSelector = () => {
  const [examCentres, setExamCentres] = useState([]);
  const [batches, setBatches] = useState([]);

  const [examCentre, setExamCentre] = useState("");
  const [standard, setStandard] = useState("");
  const [examYear, setExamYear] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [refreshFunction, setRefreshFunction] = useState(null);

  /* ---------- Fetch Exam Centres ---------- */
  useEffect(() => {
    api
      .get("/admin/getExamCenters")
      .then((res) => setExamCentres(res.data.data || []))
      .catch((err) => console.error("Error fetching exam centres", err));
  }, []);

  /* ---------- Exam Years ---------- */
  const getExamYears = () => {
    const y = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => y - 2 + i);
  };

  /* ---------- Fetch Batches ---------- */
  useEffect(() => {
    if (!examCentre || !standard || !examYear) return;

    setSelectedBatch(null);
    setBatches([]);

    api
      .get("/admin/batches", {
        params: { examCentre, standard, examYear },
      })
      .then((res) => setBatches(res.data || []))
      .catch((err) => console.error("Error fetching batches", err));
  }, [examCentre, standard, examYear]);

  /* ---------- Handle Mode Toggle ---------- */
  const handleModeToggle = () => {
    if (isEditMode) {
      // Switching to View Mode - fetch fresh data
      if (refreshFunction) {
        refreshFunction();
      }
    }
    setIsEditMode(!isEditMode);
  };

  const context =
    selectedBatch && examCentre && standard && examYear
      ? {
          examCentre,
          standard,
          examYear,
          fromSeat: selectedBatch.fromSeat,
          toSeat: selectedBatch.toSeat,
        }
      : null;

  return (
    <div className="min-h-screen bg-gray-100 p-3">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-lg bg-customwhite shadow">
          {/* Header */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-primary to-tertiary px-4 py-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-customwhite">Marks Entry System</h2>
                <p className="text-[15px] text-blue-100">
                  Select context and batch to enter student marks
                </p>
              </div>

              {/* Mode Toggle  */}

              {context && (
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isEditMode ? 'text-customwhite' : 'text-blue-200'}`}>
                    Edit
                  </span>
                  <button
                    onClick={handleModeToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-customwhite focus:ring-offset-2 ${
                      isEditMode ? 'bg-secondary' : 'bg-green-500'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-customwhite transition-transform duration-200 ${
                        isEditMode ? 'translate-x-1' : 'translate-x-6'
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium ${!isEditMode ? 'text-customwhite' : 'text-blue-200'}`}>
                    View
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            {/* -------- Context Selectors -------- */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-md font-medium text-customblack">
                  Exam Centre
                </label>
                <select
                  className="w-full rounded border border-gray-300 bg-customwhite px-2 py-1.5 text-sm transition-all duration-150 focus:border-primary focus:outline-none focus:ring-1 focus:ring-fourthcolor/40 hover:border-tertiary"
                  value={examCentre}
                  onChange={(e) => setExamCentre(e.target.value)}
                >
                  <option value="">Select Exam Centre</option>
                  {examCentres.map((c) => (
                    <option key={c.centerId} value={c.centerId}>
                      {c.centerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-md font-medium text-customblack">
                  Standard
                </label>
                <select
                  className="w-full rounded border border-gray-300 bg-customwhite px-2 py-1.5 text-sm transition-all duration-150 focus:border-primary focus:outline-none focus:ring-1 focus:ring-fourthcolor/40 hover:border-tertiary"
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                >
                  <option value="">Select Standard</option>
                  <option value="10th">10th</option>
                  <option value="12th">12th</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-md font-medium text-customblack">
                  Exam Year
                </label>
                <select
                  className="w-full rounded border border-gray-300 bg-customwhite px-2 py-1.5 text-sm transition-all duration-150 focus:border-primary focus:outline-none focus:ring-1 focus:ring-fourthcolor/40 hover:border-tertiary"
                  value={examYear}
                  onChange={(e) => setExamYear(e.target.value)}
                >
                  <option value="">Select Exam Year</option>
                  {getExamYears().map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* -------- Batch Selection -------- */}
            {batches.length > 0 && (
              <div className="mt-3">
                <label className="mb-1.5 block text-sm font-medium text-customblack">
                  Select Batch
                </label>
                <div className="flex flex-wrap gap-2">
                  {batches.map((b, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedBatch(b)}
                      className={`relative rounded border px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                        selectedBatch?.fromSeat === b.fromSeat
                          ? "border-primary bg-primary text-customwhite shadow-sm"
                          : "border-gray-300 bg-customwhite text-customblack hover:border-tertiary hover:bg-blue-50"
                      }`}
                    >
                      {b.label}
                      {selectedBatch?.fromSeat === b.fromSeat && (
                        <svg className="ml-1 inline h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* -------- Student Marks Table -------- */}
            {context && (
              <StudentMarksTable 
                context={context} 
                isEditMode={isEditMode}
                onRefresh={(fn) => setRefreshFunction(() => fn)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarksContextSelector;
