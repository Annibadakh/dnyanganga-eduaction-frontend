import { useState, useEffect } from "react";
import { FileUploadHook } from "../FileUpload/FileUploadHook";
import FileUpload from "../FileUpload/FileUpload";

const TemplateForm = ({ onSubmit, onCancel, initialData = null }) => {
  const headerFile = FileUploadHook();

  const [formData, setFormData] = useState({
    name: "",
    body: "",
    language: "en",
    provider_template_id: "",
    header_type: "none",
    headerFileUrl: "",
  });

  const [detectedVariables, setDetectedVariables] = useState([]);
  const [variableLabels, setVariableLabels] = useState({});
  const [errors, setErrors] = useState({});
  const [submitLoader, setSubmitLoader] = useState(false);

  // =========================
  // Load Edit Data
  // =========================
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        body: initialData.body || "",
        language: initialData.language || "en",
        provider_template_id: initialData.provider_template_id || "",
        header_type: initialData.header_type || "none",
        headerFileUrl: initialData.header_url || "",
      });

      if (initialData.variables) {
        const labels = {};
        initialData.variables.forEach((v) => {
          labels[v.var_index] = v.label;
        });
        setVariableLabels(labels);
      }

      extractVariablesFromBody(initialData.body || "");
    }
  }, [initialData]);

  // =========================
  // Extract {{1}} {{2}}
  // =========================
  const extractVariablesFromBody = (text) => {
    const regex = /\{\{(\d+)\}\}/g;
    const variables = new Set();
    let match;

    while ((match = regex.exec(text)) !== null) {
      variables.add(match[1]);
    }

    const sortedVars = Array.from(variables).sort(
      (a, b) => parseInt(a) - parseInt(b),
    );

    setDetectedVariables(sortedVars);

    setVariableLabels((prev) => {
      const newLabels = { ...prev };
      sortedVars.forEach((varIndex) => {
        if (!newLabels[varIndex]) newLabels[varIndex] = "";
      });
      return newLabels;
    });
  };

  // =========================
  // Handle Body Change
  // =========================
  const handleBodyChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({ ...prev, body: value }));
    extractVariablesFromBody(value);

    if (errors.body) {
      setErrors((prev) => ({ ...prev, body: "" }));
    }
  };

  // =========================
  // Handle Normal Change
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // =========================
  // Header Type Change
  // =========================
  const handleHeaderTypeChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({ ...prev, header_type: value }));

    if (value === "none") {
      headerFile.removePhoto();
      setFormData((prev) => ({ ...prev, headerFileUrl: "" }));
    }
  };

  // =========================
  // Upload Header File
  // =========================
  const handleHeaderFileUpload = async (type) => {
    const uploadedUrl = await headerFile.uploadImage(type);

    if (uploadedUrl) {
      setFormData((prev) => ({ ...prev, headerFileUrl: uploadedUrl }));
    }
  };

  // =========================
  // Variable Label Change
  // =========================
  const handleLabelChange = (varIndex, label) => {
    setVariableLabels((prev) => ({ ...prev, [varIndex]: label }));

    if (errors[`label_${varIndex}`]) {
      setErrors((prev) => ({ ...prev, [`label_${varIndex}`]: "" }));
    }
  };

  // =========================
  // Validation
  // =========================
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Template name is required";
    if (!formData.body.trim()) newErrors.body = "Template body is required";

    if (
      formData.header_type !== "none" &&
      !headerFile.isSaved &&
      !formData.headerFileUrl
    ) {
      newErrors.header_file = "Please upload and save header file";
    }

    detectedVariables.forEach((varIndex) => {
      if (!variableLabels[varIndex]?.trim()) {
        newErrors[`label_${varIndex}`] = "Label is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // Submit
  // =========================
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitLoader(true);

    const variables = detectedVariables.map((index) => ({
      var_index: Number(index),
      label: variableLabels[index].trim(),
    }));

    const dataToSend = {
      name: formData.name.trim(),
      body: formData.body.trim(),
      language: formData.language,
      provider_template_id: formData.provider_template_id || null,
      header_type: formData.header_type,
      header_url: formData.headerFileUrl || null,
      variable_count: variables.length,
      variables,
    };

    try {
      await onSubmit(dataToSend);
    } finally {
      setSubmitLoader(false);
    }
  };

  // =========================
  // UI (UNCHANGED)
  // =========================
  return (
    <div className="max-w-4xl bg-white shadow-custom mx-auto md:p-6 p-4">
      <h2 className="text-2xl text-secondary text-center font-bold mb-6">
        {initialData ? "Edit Template" : "Create New Template"}
      </h2>

      <div>
        {/* Template Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">
            Template Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`border p-2 w-full rounded ${
              errors.name ? "border-red-500" : ""
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Language */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">
            Language *
          </label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
          </select>
        </div>

        {/* Header Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">
            Header Type *
          </label>
          <select
            name="header_type"
            value={formData.header_type}
            onChange={handleHeaderTypeChange}
            className="border p-2 w-full rounded"
          >
            <option value="none">None</option>
            <option value="image">Image</option>
            <option value="document">Document</option>
          </select>
        </div>

        {/* Header Upload */}
        {formData.header_type !== "none" && (
          <div className="mb-6">
            <FileUpload
              title={
                formData.header_type === "image"
                  ? "Template Header Image"
                  : "Template Header Document"
              }
              imageUrl={headerFile.imageUrl || formData.headerFileUrl}
              error={headerFile.error}
              loader={headerFile.loader}
              isSaved={headerFile.isSaved || !!formData.headerFileUrl}
              imageType={formData.header_type === "image" ? "template" : "document"}
              onFileUpload={headerFile.handleFileUpload}
              onUploadImage={handleHeaderFileUpload}
              onRemovePhoto={() => {
                headerFile.removePhoto();
                setFormData((prev) => ({ ...prev, headerFileUrl: "" }));
              }}
            />
          </div>
        )}

        {/* Body */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-black mb-2">
            Template Body *
          </label>
          <textarea
            name="body"
            value={formData.body}
            onChange={handleBodyChange}
            rows={6}
            className={`border p-2 w-full rounded font-mono text-sm ${
              errors.body ? "border-red-500" : ""
            }`}
            placeholder="Hello {{1}}, your payment of Rs.{{2}} has been received."
          />
          {errors.body && (
            <p className="text-red-500 text-sm mt-1">{errors.body}</p>
          )}
        </div>

        {/* Provider Template ID */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-black mb-2">
            Provider Template ID
          </label>
          <input
            type="text"
            name="provider_template_id"
            value={formData.provider_template_id}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Variable Labels */}
        {detectedVariables.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <h3 className="text-lg font-semibold text-secondary mb-3">
              Label Your Variables ({detectedVariables.length})
            </h3>

            {detectedVariables.map((varIndex) => (
              <div key={varIndex} className="mb-3">
                <label>
                  Variable {"{{"}
                  {varIndex}
                  {"}}"} *
                </label>

                <input
                  value={variableLabels[varIndex] || ""}
                  onChange={(e) => handleLabelChange(varIndex, e.target.value)}
                  className={`border p-2 w-full rounded ${
                    errors[`label_${varIndex}`] ? "border-red-500" : ""
                  }`}
                />

                {errors[`label_${varIndex}`] && (
                  <p className="text-red-500 text-sm">
                    {errors[`label_${varIndex}`]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={submitLoader}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            {submitLoader ? "Saving..." : "Save Template"}
          </button>

          <button
            onClick={onCancel}
            disabled={submitLoader}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateForm;