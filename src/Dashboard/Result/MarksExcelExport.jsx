import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import api from "../../Api";

const MarksExcelExport = () => {
  const [examCentres, setExamCentres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState("");

  const [examCentre, setExamCentre] = useState("");
  const [standard, setStandard] = useState("");
  const [examYear, setExamYear] = useState("");

  /* ------------ Subject Order ------------ */
  const subjectOrder = {
    "10th": ["Math-1", "Math-2", "Science-1", "Science-2", "English"],
    "12th": ["Physics", "Chemistry", "Mathematics", "Biology"]
  };

  const getAllSubjects = () => {
    return standard ? subjectOrder[standard] || [] : [];
  };

  /* ------------ Fetch Exam Centres ------------ */
  useEffect(() => {
    api
      .get("/admin/getExamCenters")
      .then((res) => setExamCentres(res.data.data || []))
      .catch((err) => console.error(err));
  }, []);

  /* ------------ Exam Years ------------ */
  const getExamYears = () => {
    const y = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => y - 2 + i);
  };

  /* ------------ Calculate Student Marks ------------ */
  const calculateStudentData = (student) => {
    const allSubjects = getAllSubjects();
    const subjectMarksMap = {};

    (student.subjects || []).forEach(sub => {
      subjectMarksMap[sub.subjectName] = {
        marks: sub.marks,
        totalMarks: sub.totalMarks
      };
    });

    let totalMaxMarks = 0;
    let totalObtainedMarks = 0;
    let hasAtLeastOnePresent = false;

    const orderedSubjects = allSubjects.map(subjectName => {
      const subjectData = subjectMarksMap[subjectName];

      // Not eligible
      if (!subjectData) {
        return {
          name: subjectName,
          value: "",
          isAbsent: false,
          isNotEligible: true
        };
      }

      totalMaxMarks += subjectData.totalMarks;

      // Absent
      if (subjectData.marks === null) {
        return {
          name: subjectName,
          value: "A",
          isAbsent: true,
          isNotEligible: false
        };
      }

      // Present
      hasAtLeastOnePresent = true;
      totalObtainedMarks += subjectData.marks;

      return {
        name: subjectName,
        value: subjectData.marks,
        isAbsent: false,
        isNotEligible: false
      };
    });

    let percentage = "";
    if (totalMaxMarks > 0) {
      percentage = ((totalObtainedMarks / totalMaxMarks) * 100).toFixed(2) + "%";
    }

    return {
      orderedSubjects,
      totalMaxMarks,
      totalObtainedMarks,
      percentage,
      isFullyAbsent: !hasAtLeastOnePresent
    };
  };

  /* ------------ Export Logic ------------ */
  const handleExport = async () => {
    if (!standard || !examYear) {
      alert("Please select Standard and Exam Year!");
      return;
    }

    setLoading(true);
    setExportProgress("Fetching students...");

    try {
      const response = await api.get("/admin/exportStudentsWithMarks", {
        params: {
          standard,
          examYear,
          ...(examCentre && { examCentre })
        }
      });

      const students = response.data || [];
      if (!students.length) {
        alert("No students found!");
        setLoading(false);
        return;
      }

      const allSubjects = getAllSubjects();

      let excelData = students.map((student, idx) => {
        const calc = calculateStudentData(student);

        const row = {
          "Sr No.": idx + 1,
          "Student ID": student.studentId,
          "Student Name": student.studentName,
          "Seat No.": `DE${String(student.examCentre).padStart(2, "0")}${String(
            student.seatNum
          ).padStart(3, "0")}`,
          "Group": student.subjectGroup
        };

        calc.orderedSubjects.forEach((sub, i) => {
          row[`${i + 1}. ${sub.name}`] = sub.isNotEligible
            ? ""
            : sub.isAbsent
            ? "A"
            : sub.value;
        });

        row["Max Marks"] = calc.totalMaxMarks;
        row["Obtained Marks"] = calc.totalObtainedMarks;
        row["Percentage"] = calc.percentage;

        // hidden sort keys
        row.__obtained = calc.isFullyAbsent ? -1 : calc.totalObtainedMarks;
        row.__percent = calc.isFullyAbsent
          ? -1
          : parseFloat(calc.percentage);

        return row;
      });

      /* ------------ SORTING ------------ */
     excelData.sort((a, b) => {
        // Fully absent always at bottom
        if (a.__percent === -1 && b.__percent !== -1) return 1;
        if (a.__percent !== -1 && b.__percent === -1) return -1;

        // Higher percentage first
        return b.__percent - a.__percent;
      });

      // remove helper keys
      excelData.forEach(r => {
        delete r.__obtained;
        delete r.__percent;
      });

      setExportProgress("Creating Excel...");

      const ws = XLSX.utils.json_to_sheet(excelData);

      ws["!cols"] = [
        { wch: 8 },
        { wch: 12 },
        { wch: 25 },
        { wch: 12 },
        { wch: 8 },
        ...allSubjects.map(() => ({ wch: 12 })),
        { wch: 12 },
        { wch: 15 },
        { wch: 12 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Student Marks");

      const fileName = `Marks_${standard}_${examCentre || "AllCentres"}_${examYear}.xlsx`;
      XLSX.writeFile(wb, fileName);

      alert("Excel exported successfully!");
    } catch (err) {
      console.error(err);
      alert("Export failed");
    } finally {
      setLoading(false);
      setExportProgress("");
    }
  };

  const canExport = standard && examYear && !loading;

  return (
  <div className="overflow-hidden rounded-lg bg-white mb-4 shadow">
    {/* Header */}
    <div className="border-b border-gray-200 bg-gradient-to-r from-primary to-tertiary px-4 py-3">
      <div>
        <h2 className="text-xl font-bold text-white">
          Excel Export - Student Marks
        </h2>
      </div>
    </div>

    <div className="p-6">
      {/* Export Criteria */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Exam Centre */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-900">
              Exam Centre{" "}
              <span className="font-normal text-gray-500">(Optional)</span>
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-green-500/20"
              value={examCentre}
              onChange={(e) => setExamCentre(e.target.value)}
              disabled={loading}
            >
              <option value="">All Centres</option>
              {examCentres.map((c) => (
                <option key={c.centerId} value={c.centerId}>
                  {c.centerName}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Leave empty to export all centres
            </p>
          </div>

          {/* Standard */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-900">
              Standard <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-green-500/20"
              value={standard}
              onChange={(e) => setStandard(e.target.value)}
              disabled={loading}
            >
              <option value="">Select Standard</option>
              <option value="10th">10th</option>
              <option value="12th">12th</option>
            </select>
          </div>

          {/* Exam Year */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-900">
              Exam Year <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-green-500/20"
              value={examYear}
              onChange={(e) => setExamYear(e.target.value)}
              disabled={loading}
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

        {/* Export Button */}
        <div className="flex items-center justify-center pt-4">
          <button
            onClick={handleExport}
            disabled={!canExport}
            className={`flex items-center gap-3 rounded-lg px-8 py-3 text-base font-semibold shadow-lg transition-all ${
              canExport
                ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-xl"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>{exportProgress || "Processing..."}</span>
              </>
            ) : (
              <>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Export to Excel</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

};

export default MarksExcelExport;
