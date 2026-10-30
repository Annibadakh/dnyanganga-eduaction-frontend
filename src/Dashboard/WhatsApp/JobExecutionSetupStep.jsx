import React, { useEffect, useState } from "react";
import { CalendarClock, ChevronLeft, FileSpreadsheet, Send, Users } from "lucide-react";
import { FileUploadHook } from "../FileUpload/FileUploadHook";
import FileUpload from "../FileUpload/FileUpload";
import MessagePreview from "./MessagePreview";

const HEADER_TITLES = { image: "Job Header Image", video: "Job Header Video", document: "Job Header Document" };

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const Section = ({ title, children }) => (
  <div className="border rounded-lg p-4 bg-gray-50">
    <h3 className="font-semibold text-secondary mb-3">{title}</h3>
    {children}
  </div>
);

// Step 3 of job creation: header, variable values, job name and time.
// `progress` ({ done, total }) is shown on the button while the receivers upload.
const JobExecutionSetupStep = ({ template, excel, saving, progress, onBack, onSubmit }) => {
  const { rows, columns, phoneField, fileName } = excel;
  const jobHeaderFile = FileUploadHook();
  const variables = template.variables || [];

  const [mapping, setMapping] = useState({});
  const [jobName, setJobName] = useState("");
  const [scheduleDate, setScheduleDate] = useState(todayISO());
  const [scheduleHour, setScheduleHour] = useState("12");
  const [scheduleMinute, setScheduleMinute] = useState("00");
  const [schedulePeriod, setSchedulePeriod] = useState("PM");
  const [jobHeaderUrl, setJobHeaderUrl] = useState("");
  const [error, setError] = useState("");

  // A column named like the variable is picked for it automatically
  useEffect(() => {
    const initial = {};
    variables.forEach((v) => {
      const match = columns.find((c) => c.trim().toLowerCase() === v.label.trim().toLowerCase());
      initial[v.var_index] = { type: "field", value: match || "" };
    });
    setMapping(initial);
  }, [template, columns]);

  const headerType = template.header_type;
  const imageType = headerType === "image" ? "template" : headerType;

  const handleJobHeaderUpload = async () => {
    const uploadedUrl = await jobHeaderFile.uploadImage(imageType);
    if (uploadedUrl) setJobHeaderUrl(uploadedUrl);
  };

  const setVariable = (varIndex, changes) =>
    setMapping((prev) => ({ ...prev, [varIndex]: { ...prev[varIndex], ...changes } }));

  // Values of the first receiver, for the preview
  const sampleValues = Object.fromEntries(
    variables.map((v) => {
      const m = mapping[v.var_index];
      const value = !m?.value ? "" : m.type === "manual" ? m.value : String(rows[0]?.[m.value] ?? "");
      return [String(v.var_index), value];
    }),
  );
  const labels = Object.fromEntries(variables.map((v) => [String(v.var_index), v.label]));

  const getDateTime = () => {
    let hour24 = parseInt(scheduleHour, 10);
    if (schedulePeriod === "PM" && hour24 !== 12) hour24 += 12;
    if (schedulePeriod === "AM" && hour24 === 12) hour24 = 0;
    const time = `${String(hour24).padStart(2, "0")}:${scheduleMinute}:00`;

    const minAllowedTime = new Date();
    minAllowedTime.setMinutes(minAllowedTime.getMinutes() + 5);

    if (new Date(`${scheduleDate}T${time}`) < minAllowedTime) {
      setError("Schedule date & time must be at least 5 minutes ahead of the current time.");
      return null;
    }
    return `${scheduleDate} ${time}`;
  };

  const handleCreate = () => {
    if (saving) return;
    setError("");

    if (!jobName.trim()) return setError("Job name is required.");
    if (!scheduleDate) return setError("Schedule date is required.");

    const unmapped = variables.filter((v) => !String(mapping[v.var_index]?.value ?? "").trim());
    if (unmapped.length > 0) {
      return setError(`Choose a value for: ${unmapped.map((v) => v.label).join(", ")}`);
    }

    if (jobHeaderFile.file && !jobHeaderUrl) {
      return setError(`Click "Save ${HEADER_TITLES[headerType]}" to upload the header, or remove it.`);
    }

    const dateTime = getDateTime();
    if (!dateTime) return;

    // Only the columns the job uses are sent
    const fields = new Set([phoneField]);
    Object.values(mapping).forEach((m) => m.type === "field" && fields.add(m.value));
    const receivers = rows.map((row) => Object.fromEntries([...fields].map((f) => [f, row[f]])));

    onSubmit({
      draft: {
        template_id: template.id,
        job_name: jobName.trim(),
        schedule_date: dateTime,
        phone_field: phoneField,
        variable_mapping: variables.map((v) => ({
          var_index: Number(v.var_index),
          type: mapping[v.var_index].type,
          value: mapping[v.var_index].value,
        })),
        job_header_type: headerType,
        job_header_url: jobHeaderUrl || null,
      },
      receivers,
    });
  };

  return (
    <div>
      <h2 className="text-lg md:text-xl font-semibold text-primary mb-4">Setup Job</h2>

      {/* Summary */}
      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        <span className="bg-blue-50 border border-blue-200 text-primary px-3 py-1 rounded-full">
          Template: <b>{template.name}</b>
        </span>
        <span className="bg-green-50 border border-green-200 text-green-800 px-3 py-1 rounded-full flex items-center gap-1">
          <Users size={14} /> <b>{rows.length}</b> receivers
        </span>
        <span className="bg-gray-50 border px-3 py-1 rounded-full flex items-center gap-1 text-gray-600 max-w-full">
          <FileSpreadsheet size={14} className="shrink-0" /> <span className="truncate">{fileName}</span>
        </span>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-5">
        <div className="space-y-4 min-w-0">
          {/* Header file */}
          {headerType !== "none" && (
            <Section title="Header">
              <p className="text-sm text-gray-600 mb-3">
                The template's own {headerType} is sent. Upload a file here only to use a different one for this job.
              </p>
              <FileUpload
                title={HEADER_TITLES[headerType]}
                imageUrl={jobHeaderFile.imageUrl}
                error={jobHeaderFile.error}
                loader={jobHeaderFile.loader}
                isSaved={jobHeaderFile.isSaved}
                imageType={imageType}
                onFileUpload={jobHeaderFile.handleFileUpload}
                onUploadImage={handleJobHeaderUpload}
                onRemovePhoto={() => {
                  jobHeaderFile.removePhoto();
                  setJobHeaderUrl("");
                }}
              />
              {jobHeaderUrl && (
                <button
                  type="button"
                  onClick={() => {
                    jobHeaderFile.removePhoto();
                    setJobHeaderUrl("");
                  }}
                  className="text-sm text-primary underline"
                >
                  Use the template's {headerType} instead
                </button>
              )}
            </Section>
          )}

          {/* Variables */}
          {variables.length > 0 ? (
            <Section title={`Variable Values (${variables.length})`}>
              <div className="space-y-3">
                {variables.map((variable) => {
                  const m = mapping[variable.var_index] || { type: "field", value: "" };
                  return (
                    <div key={variable.var_index} className="bg-white border rounded p-3">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="bg-primary text-white text-xs font-mono px-2 py-1 rounded">
                          {`{{${variable.var_index}}}`}
                        </span>
                        <span className="font-medium text-black flex-1 min-w-0">{variable.label}</span>
                        <div className="flex rounded border overflow-hidden text-xs">
                          {[
                            ["field", "From Excel"],
                            ["manual", "Same for all"],
                          ].map(([type, text]) => (
                            <button
                              key={type}
                              onClick={() => setVariable(variable.var_index, { type, value: "" })}
                              className={`px-3 py-1.5 ${m.type === type ? "bg-primary text-white" : "bg-white text-gray-700"}`}
                            >
                              {text}
                            </button>
                          ))}
                        </div>
                      </div>
                      {m.type === "field" ? (
                        <select
                          value={m.value}
                          onChange={(e) => setVariable(variable.var_index, { value: e.target.value })}
                          className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:border-primary"
                        >
                          <option value="">-- Select Excel column --</option>
                          {columns.map((col) => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={m.value}
                          onChange={(e) => setVariable(variable.var_index, { value: e.target.value })}
                          className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:border-primary"
                          placeholder="Value sent to every receiver"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          ) : (
            <p className="text-sm text-gray-500">This template has no variables — every receiver gets the same message.</p>
          )}

          {/* Job name + time */}
          <Section title="Job Details">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Name *</label>
                <input
                  type="text"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:border-primary bg-white"
                  placeholder="e.g. Result Announcement - Feb"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <CalendarClock size={14} className="inline mr-1" />
                  Schedule Date &amp; Time *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-[1fr_auto_auto_auto] gap-2">
                  <input
                    type="date"
                    value={scheduleDate}
                    min={todayISO()}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="border border-gray-300 p-2 rounded col-span-3 sm:col-span-1 bg-white"
                  />
                  <select value={scheduleHour} onChange={(e) => setScheduleHour(e.target.value)} className="border border-gray-300 p-2 rounded bg-white">
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <select value={scheduleMinute} onChange={(e) => setScheduleMinute(e.target.value)} className="border border-gray-300 p-2 rounded bg-white">
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select value={schedulePeriod} onChange={(e) => setSchedulePeriod(e.target.value)} className="border border-gray-300 p-2 rounded bg-white">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-4 self-start">
          <p className="text-sm font-medium text-black mb-2">Preview (first receiver)</p>
          <MessagePreview
            body={template.body}
            headerType={headerType}
            headerUrl={jobHeaderUrl || jobHeaderFile.imageUrl || template.header_url}
            labels={labels}
            values={sampleValues}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm">{error}</div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 mt-5">
        <button
          onClick={onBack}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-5 py-2 border border-gray-300 rounded text-gray-600 hover:border-primary hover:text-primary disabled:opacity-50"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={handleCreate}
          disabled={saving || jobHeaderFile.loader}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60 min-w-48"
        >
          {saving ? (
            <>
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              {progress?.total ? `Uploading ${progress.done} / ${progress.total}` : "Creating…"}
            </>
          ) : (
            <>
              <Send size={16} /> Create Job
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default JobExecutionSetupStep;
