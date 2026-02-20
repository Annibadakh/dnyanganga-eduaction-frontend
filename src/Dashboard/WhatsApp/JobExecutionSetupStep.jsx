import React, { useEffect, useState } from "react";

const JobExecutionSetupStep = ({
  template,
  excelColumns,
  excelData,
  onBack,
  onSubmit,
}) => {
  const [mapping, setMapping] = useState({});
  const [phoneField, setPhoneField] = useState("");
  const [jobName, setJobName] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [error, setError] = useState("");

  // Initialize mapping
  useEffect(() => {
    if (template?.variables?.length > 0) {
      const initial = {};
      template.variables.forEach((v) => {
        initial[v.var_index] = {
          type: "field",
          value: "",
        };
      });
      setMapping(initial);
    }
  }, [template]);

  const handleTypeChange = (varIndex, type) => {
    setMapping((prev) => ({
      ...prev,
      [varIndex]: { type, value: "" },
    }));
  };

  const handleValueChange = (varIndex, value) => {
    setMapping((prev) => ({
      ...prev,
      [varIndex]: { ...prev[varIndex], value },
    }));
  };

  const handleCreatePayload = () => {
    if (!phoneField) {
      setError("Phone column selection is required.");
      return;
    }

    if (!jobName.trim()) {
      setError("Job name is required.");
      return;
    }

    if (!scheduleDate) {
      setError("Schedule date is required.");
      return;
    }

    const unmapped = Object.values(mapping).some(
      (m) => !m.value || m.value.trim() === "",
    );

    if (unmapped) {
      setError("Please map all template variables.");
      return;
    }

    // -------------------------------
    // Identify Required Fields
    // -------------------------------

    const requiredFields = new Set();

    requiredFields.add(phoneField);

    Object.values(mapping).forEach((m) => {
      if (m.type === "field") {
        requiredFields.add(m.value);
      }
    });

    // -------------------------------
    // Trim Excel Data
    // -------------------------------

    const trimmedReceivers = excelData.map((row) => {
      const newRow = {};

      requiredFields.forEach((field) => {
        newRow[field] = row[field];
      });

      return newRow;
    });

    // -------------------------------
    // Prepare Variable Mapping Array
    // -------------------------------

    const variableMappingArray = Object.entries(mapping).map(
      ([var_index, config]) => ({
        var_index: Number(var_index),
        type: config.type,
        value: config.value,
      }),
    );

    // -------------------------------
    // Final Payload
    // -------------------------------

    const payload = {
      template_id: template.id,
      job_name: jobName,
      schedule_date: scheduleDate,
      receivers_raw: trimmedReceivers,
      phone_field: phoneField,
      variable_mapping: variableMappingArray,
    };

    onSubmit(payload);
  };

  return (
    <div className="p-6 bg-white shadow-custom max-w-5xl mx-auto">
      <h2 className="text-xl font-bold text-primary mb-4">
        Setup Job Execution
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Phone Mapping */}
      <div className="mb-6 border rounded p-4 bg-red-50">
        <h3 className="font-semibold text-red-800 mb-2">
          📱 Select Phone Number Column *
        </h3>

        <select
          value={phoneField}
          onChange={(e) => setPhoneField(e.target.value)}
          className="border p-2 w-full rounded"
        >
          <option value="">-- Select Phone Column --</option>
          {excelColumns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      {/* Variable Mapping */}
      <div className="space-y-5 mb-6">
        {template.variables.map((variable) => (
          <div
            key={variable.var_index}
            className="border rounded-lg p-4 bg-gray-50"
          >
            <div className="flex items-center gap-4 mb-3">
              <span className="bg-primary text-white px-3 py-1 rounded font-bold">
                {"{{"}
                {variable.var_index}
                {"}}"}
              </span>
              <span className="font-semibold text-black">{variable.label}</span>
            </div>

            <div className="flex gap-3 mb-3">
              <button
                onClick={() => handleTypeChange(variable.var_index, "field")}
                className={`px-4 py-2 rounded ${
                  mapping[variable.var_index]?.type === "field"
                    ? "bg-primary text-white"
                    : "bg-gray-200"
                }`}
              >
                📋 Map to Field
              </button>

              <button
                onClick={() => handleTypeChange(variable.var_index, "manual")}
                className={`px-4 py-2 rounded ${
                  mapping[variable.var_index]?.type === "manual"
                    ? "bg-primary text-white"
                    : "bg-gray-200"
                }`}
              >
                ✏️ Manual Value
              </button>
            </div>

            {mapping[variable.var_index]?.type === "field" ? (
              <select
                value={mapping[variable.var_index]?.value || ""}
                onChange={(e) =>
                  handleValueChange(variable.var_index, e.target.value)
                }
                className="border p-2 w-full rounded"
              >
                <option value="">-- Select Excel Field --</option>
                {excelColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={mapping[variable.var_index]?.value || ""}
                onChange={(e) =>
                  handleValueChange(variable.var_index, e.target.value)
                }
                className="border p-2 w-full rounded"
                placeholder="Enter fixed value"
              />
            )}
          </div>
        ))}
      </div>

      {/* Job Info */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block mb-2 font-medium">Job Name *</label>
          <input
            type="text"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="e.g. Result Announcement - Feb"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Schedule Date *</label>
          <input
            type="date"
            value={scheduleDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="px-6 py-2 border rounded">
          Back
        </button>

        <button
          onClick={handleCreatePayload}
          className="px-6 py-2 bg-green-600 text-white rounded"
        >
          Create Job
        </button>
      </div>
    </div>
  );
};

export default JobExecutionSetupStep;
