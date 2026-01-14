import React, { useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import api from "../../Api";

const MarksExcelExport = () => {
  const [examCentres, setExamCentres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState("");

  const [examCentre, setExamCentre] = useState(""); // Optional
  const [standard, setStandard] = useState("");
  const [examYear, setExamYear] = useState("");

  /* ------------ Subject Order Configuration ------------ */
  const subjectOrder = {
    "10th": ["Math-1", "Math-2", "Science-1", "Science-2", "English"],
    "12th": ["Physics", "Chemistry", "Mathematics", "Biology"]
  };

  /* ------------ Get All Possible Subjects ------------ */
  const getAllSubjects = () => {
    return standard ? subjectOrder[standard] || [] : [];
  };

  /* ------------ Fetch Exam Centres ------------ */
  useEffect(() => {
    api
      .get("/admin/getExamCenters")
      .then((res) => setExamCentres(res.data.data || []))
      .catch((err) => console.error("Error fetching exam centres", err));

    console.log(examCentre);
  }, []);

  /* ------------ Exam Years ------------ */
  const getExamYears = () => {
    const y = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => y - 2 + i);
  };

  /* ------------ Calculate Student Totals ------------ */
  const calculateStudentData = (student) => {
    const allSubjects = getAllSubjects();
    const subjectMarksMap = {};
    
    // Create a map of subject marks
    (student.subjects || []).forEach(sub => {
      subjectMarksMap[sub.subjectName] = {
        marks: sub.marks,
        totalMarks: sub.totalMarks
      };
    });

    let totalMaxMarks = 0;
    let totalObtainedMarks = 0;
    let hasAbsent = false;

    // Build subject data in order
    const orderedSubjects = allSubjects.map(subjectName => {
      const subjectData = subjectMarksMap[subjectName];
      
      if (!subjectData) {
        // Not eligible for this subject
        return { name: subjectName, value: "", isAbsent: false, isNotEligible: true };
      }

      totalMaxMarks += subjectData.totalMarks;

      if (subjectData.marks === null) {
        // Absent
        hasAbsent = true;
        return { name: subjectName, value: "A", isAbsent: true, isNotEligible: false };
      }

      // Has marks
      totalObtainedMarks += subjectData.marks;
      return { name: subjectName, value: subjectData.marks, isAbsent: false, isNotEligible: false };
    });

    // Calculate percentage
    let percentage = "";
    if (hasAbsent) {
      percentage = "Absent";
    } else if (totalMaxMarks > 0) {
      percentage = ((totalObtainedMarks / totalMaxMarks) * 100).toFixed(2) + "%";
    }

    return {
      orderedSubjects,
      totalMaxMarks,
      totalObtainedMarks: hasAbsent ? "Absent" : totalObtainedMarks,
      percentage
    };
  };

  /* ------------ Fetch All Students and Export ------------ */
  const handleExport = async () => {
    if (!standard || !examYear) {
      alert("Please select Standard and Exam Year!");
      return;
    }

    setLoading(true);
    setExportProgress("Fetching student data...");

    try {
      // Fetch all students (no batch limit)
      const response = await api.get("/admin/exportStudentsWithMarks", {
        params: {
          standard,
          examYear,
          ...(examCentre && { examCentre }) // Include only if selected
        },
      });

      const students = response.data || [];

      if (students.length === 0) {
        alert("No students found for the selected criteria!");
        setLoading(false);
        setExportProgress("");
        return;
      }

      setExportProgress(`Processing ${students.length} students...`);

      // Generate Excel
      const allSubjects = getAllSubjects();
      
      const excelData = students.map((student, idx) => {
        const calculatedData = calculateStudentData(student);
        
        // Build the row object
        const row = {
          "Sr No.": idx + 1,
          "Student ID": student.studentId,
          "Student Name": student.studentName,
          "Seat No.": `DE${String(student.examCentre).padStart(2, "0")}${String(student.seatNum).padStart(3, "0")}`,
          "Group": student.subjectGroup
        };

        // Add subject columns
        calculatedData.orderedSubjects.forEach((subject, index) => {
          const subjectCol = `${index + 1}. ${subject.name}`;
          if (subject.isNotEligible) {
            row[subjectCol] = "";
          } else if (subject.isAbsent) {
            row[subjectCol] = "A";
          } else {
            row[subjectCol] = subject.value;
          }
        });

        // Add totals
        row["Max Marks"] = calculatedData.totalMaxMarks;
        row["Obtained Marks"] = calculatedData.totalObtainedMarks;
        row["Percentage"] = calculatedData.percentage;

        return row;
      });

      setExportProgress("Creating Excel file...");

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 8 },  // Sr No
        { wch: 12 }, // Student ID
        { wch: 25 }, // Student Name
        { wch: 12 }, // Seat No
        { wch: 8 },  // Group
      ];

      // Add width for each subject column
      allSubjects.forEach(() => {
        colWidths.push({ wch: 12 });
      });

      // Add width for totals
      colWidths.push({ wch: 12 }); // Max Marks
      colWidths.push({ wch: 15 }); // Obtained Marks
      colWidths.push({ wch: 12 }); // Percentage

      ws['!cols'] = colWidths;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Student Marks");

      // Generate filename
      const centerPart = examCentre ? `Centre${examCentre}_` : "AllCentres_";
      const fileName = `Marks_${standard}_${centerPart}${examYear}.xlsx`;

      setExportProgress("Downloading...");

      // Export
      XLSX.writeFile(wb, fileName);

      setExportProgress("");
      setLoading(false);
      
      alert(`Successfully exported ${students.length} students!`);

    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
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
              <h2 className="text-xl font-bold text-white">Excel Export - Student Marks</h2>
              {/* <p className="text-sm text-green-100">
                Export complete student marks data to Excel with automatic calculations
              </p> */}
            </div>
          </div>

          <div className="p-6">
            {/* Export Criteria */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-900">
                    Exam Centre <span className="font-normal text-gray-500">(Optional)</span>
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
                  <p className="mt-1 text-sm text-gray-500">Leave empty to export all centres</p>
                </div>

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
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{exportProgress || "Processing..."}</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Export to Excel</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Info Cards */}
            {/* <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-blue-900">Export Features</h3>
                    <ul className="mt-2 space-y-1 text-sm text-blue-800">
                      <li>• Exports all students in one file</li>
                      <li>• No batch limits or preview needed</li>
                      <li>• Automatic calculations included</li>
                      <li>• Professional formatting applied</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-amber-900">Excel Legend</h3>
                    <ul className="mt-2 space-y-1 text-sm text-amber-800">
                      <li><span className="font-semibold">A</span> = Absent (no marks record)</li>
                      <li><span className="font-semibold">0-100</span> = Marks obtained</li>
                      <li><span className="font-semibold">Blank</span> = Subject not eligible</li>
                      <li><span className="font-semibold">Absent</span> = In totals if any subject absent</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Requirements Note */}
            {/* <div className="mt-6 rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
              <div className="flex">
                <svg className="h-5 w-5 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-900">
                    Export will include all students matching the selected criteria with their complete marks data, calculations, and properly formatted columns.
                  </p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
    
  );
};

export default MarksExcelExport;