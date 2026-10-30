import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, FileText, Search } from "lucide-react";
import api from "../../Api";
import ExcelUploadEditor from "./ExcelUploadEditor";
import JobExecutionSetupStep from "./JobExecutionSetupStep.jsx";

const CHUNK_SIZE = 500;
const STEPS = ["Template", "Receivers", "Setup"];

// Creates a WhatsApp job from an Excel file: pick a template → upload and check the
// receivers → map the variables and schedule. The receivers are saved in chunks
// (draft → chunks → finalize) so large files never hit a request size limit.
// onCreated / onCancel come from the jobs list; on its own route it goes back to /dashboard/jobs.
const JobCreation = ({ onCreated, onCancel }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [excel, setExcel] = useState(null); // { rows, columns, phoneField, fileName }
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(null);
  const [saveError, setSaveError] = useState("");
  // State updates too late to stop a double click; the ref doesn't
  const savingRef = useRef(false);

  useEffect(() => {
    api
      .get("/templates")
      .then((res) => {
        if (res.data.success) setTemplates(res.data.data);
      })
      .catch((err) => console.error("Failed to fetch templates", err))
      .finally(() => setLoadingTemplates(false));
  }, []);

  const goToJobs = (message) => {
    if (onCreated) onCreated(message);
    else navigate("/dashboard/jobs", { state: { message } });
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate("/dashboard/jobs");
  };

  const handleSubmit = async ({ draft, receivers }) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError("");
    setProgress({ done: 0, total: receivers.length });

    let jobId = null;
    try {
      const { data } = await api.post("/jobs/draft", draft);
      jobId = data.data.job_id;

      for (let i = 0; i < receivers.length; i += CHUNK_SIZE) {
        const chunk = receivers.slice(i, i + CHUNK_SIZE);
        await api.post(`/jobs/${jobId}/receivers/chunk`, { receivers_raw: chunk });
        setProgress({ done: Math.min(i + CHUNK_SIZE, receivers.length), total: receivers.length });
      }

      setProgress(null);
      const { data: finalized } = await api.post(`/jobs/${jobId}/finalize`, {
        expected_total_receivers: receivers.length,
      });
      jobId = null; // the job exists now — never remove it below

      goToJobs(
        finalized.data?.scheduler_status === "failed"
          ? `Job "${draft.job_name}" was created but could not be scheduled — use Retry in the list.`
          : `Job "${draft.job_name}" created for ${receivers.length} receivers.`,
      );
    } catch (err) {
      console.error("Job creation failed:", err);
      setSaveError(err.response?.data?.message || "Could not create the job. Please try again.");
      // Remove the half-uploaded draft so the job name can be used again
      if (jobId) api.delete(`/jobs/${jobId}`).catch(() => {});
      savingRef.current = false;
      setSaving(false);
      setProgress(null);
    }
  };

  const query = search.trim().toLowerCase();
  const shownTemplates = query
    ? templates.filter((t) => t.name?.toLowerCase().includes(query) || t.body?.toLowerCase().includes(query))
    : templates;

  return (
    <div className="p-3 md:p-6 bg-white shadow-custom rounded max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl text-center font-bold text-secondary mb-4">
        Create WhatsApp Job
      </h1>

      {/* Stepper */}
      <ol className="flex items-center justify-center gap-2 md:gap-4 mb-6 text-sm">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full grid place-items-center font-semibold ${
                  done ? "bg-green-600 text-white" : active ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {done ? <Check size={14} /> : n}
              </span>
              <span className={`${active ? "text-primary font-medium" : "text-gray-500"} hidden sm:inline`}>{label}</span>
              {n < STEPS.length && <span className="w-6 md:w-12 h-px bg-gray-300" />}
            </li>
          );
        })}
      </ol>

      {/* STEP 1: Select Template */}
      {step === 1 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-primary">Select Template</h2>
            {templates.length > 0 && (
              <div className="relative sm:w-72">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search templates"
                  className="border border-gray-300 rounded pl-9 pr-3 py-2 w-full focus:outline-none focus:border-primary"
                />
              </div>
            )}
          </div>

          {loadingTemplates ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : shownTemplates.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded text-gray-500">
              <FileText size={36} className="mx-auto mb-2 text-gray-300" />
              No templates found
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shownTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTemplate(t);
                    setStep(2);
                  }}
                  className={`text-left border rounded p-4 hover:shadow-lg hover:border-primary transition flex flex-col ${
                    selectedTemplate?.id === t.id ? "border-primary ring-1 ring-primary" : ""
                  }`}
                >
                  <h3 className="font-semibold text-secondary break-words">{t.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line mt-1 flex-1">{t.body}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {t.variables?.length || 0} variables
                    </span>
                    {t.header_type !== "none" && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded capitalize">{t.header_type} header</span>
                    )}
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded uppercase">{t.language}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6">
            <button onClick={handleCancel} className="px-5 py-2 border border-gray-300 rounded text-gray-600 hover:border-primary hover:text-primary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Excel Upload */}
      {step === 2 && (
        <ExcelUploadEditor
          initial={excel}
          onDataReady={(data) => {
            setExcel(data);
            setStep(3);
          }}
          onCancel={() => setStep(1)}
        />
      )}

      {/* STEP 3: Setup + create */}
      {step === 3 && selectedTemplate && excel && (
        <>
          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm">{saveError}</div>
          )}
          <JobExecutionSetupStep
            key={selectedTemplate.id}
            template={selectedTemplate}
            excel={excel}
            saving={saving}
            progress={progress}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
};

export default JobCreation;
