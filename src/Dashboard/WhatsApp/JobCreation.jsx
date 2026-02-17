import React, { useEffect, useState } from "react";
import api from "../../Api";
import ExcelUploadEditor from "./ExcelUploadEditor";
import JobExecutionSetupStep from "./JobExecutionSetupStep.jsx";
import StudentPreviewSelector from "./StudentPreviewSelector.jsx";

const JobCreation = () => {
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [dataSource, setDataSource] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const [sourceFilters, setSourceFilters] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);
  const fetchTemplates = async () => {
    try {
      const res = await api.get("/templates");
      if (res.data.success) {
        setTemplates(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch templates", err);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setStep(2);
  };

  const handleSourceSelect = (source) => {
    setDataSource(source);
    setStep(3);
  };

  const handleExcelDataReady = (data, columns) => {
    setExcelData(data);
    setExcelColumns(columns);
    setStep(4);
  };

  return (
    <div className="p-6 bg-white shadow-custom max-w-7xl mx-auto">
      <h1 className="text-2xl text-center font-bold text-secondary mb-6">
        Create WhatsApp Job
      </h1>

      {/* STEP 1: Select Template */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-primary">
            Select Template
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <div
                key={t.id}
                onClick={() => handleTemplateSelect(t)}
                className="border rounded p-4 cursor-pointer hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-secondary">{t.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{t.body}</p>
                <div className="mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 inline-block rounded">
                  {t.variables?.length || 0} Variables
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Select Source */}
      {step === 2 && selectedTemplate && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-primary">
            Select Data Source
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            {["excel", "student", "visiting", "candidates"].map((source) => (
              <div
                key={source}
                onClick={() => handleSourceSelect(source)}
                className="border-2 border-gray-300 rounded p-6 text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition"
              >
                <div className="text-3xl mb-2">
                  {source === "excel" && "📊"}
                  {source === "student" && "👨‍🎓"}
                  {source === "visiting" && "🏫"}
                  {source === "candidates" && "🧑‍💼"}
                </div>
                <p className="font-semibold capitalize">{source}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep(1)}
            className="mt-6 px-6 py-2 border rounded"
          >
            Back
          </button>
        </div>
      )}

      {/* STEP 3: Excel Upload */}
      {step === 3 && dataSource === "excel" && (
        <ExcelUploadEditor
          onDataReady={handleExcelDataReady}
          onCancel={() => setStep(2)}
        />
      )}
      {step === 3 && dataSource === "student" && (
        <StudentPreviewSelector
          onDataReady={(rows, cols, filters) => {
            setExcelData(rows);
            setExcelColumns(cols);
            setSourceFilters(filters);
            setStep(4);
          }}
          onCancel={() => setStep(2)}
        />
      )}

      {step === 3 && dataSource === "candidates" && <><p>Not implemented yet</p><button onClick={() => setStep(2)}>Back</button></>}
      {step === 3 && dataSource === "visiting" && <><p>Not implemented yet</p><button onClick={() => setStep(2)}>Back</button></>}

      {/* STEP 4: Just Preview (Next Step Later) */}
      {step === 4 && (
        <JobExecutionSetupStep
          template={selectedTemplate}
          excelColumns={excelColumns}
          excelData={excelData}
          onBack={() => setStep(3)}
          onSubmit={async (payload) => {
            await api.post("/jobs/excel", payload);
            alert("Job Created Successfully");
            setStep(1);
          }}
        />
      )}
    </div>
  );
};

export default JobCreation;
