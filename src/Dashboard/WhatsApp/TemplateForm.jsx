import { useState, useEffect } from "react";
import { ChevronLeft, FileText, Lock, RefreshCw, Save } from "lucide-react";
import { FileUploadHook } from "../FileUpload/FileUploadHook";
import FileUpload from "../FileUpload/FileUpload";
import { fileUrl } from "../../utils/fileUrl";
import MessagePreview from "./MessagePreview";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी (Hindi)" },
  { value: "mr", label: "मराठी (Marathi)" },
];

const HEADER_TYPES = [
  { value: "none", label: "None" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "document", label: "Document" },
];

const HEADER_TITLES = { image: "Header Image", video: "Header Video", document: "Header Document" };

// {{1}} {{2}} … found in the body, in order
const placeholdersIn = (text) =>
  [...new Set([...text.matchAll(/\{\{(\d+)\}\}/g)].map((m) => m[1]))].sort((a, b) => Number(a) - Number(b));

const inputClass = (error) =>
  `border p-2 w-full rounded focus:outline-none focus:border-primary ${error ? "border-red-500" : "border-gray-300"}`;

const Field = ({ label, error, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-black mb-1">{label}</label>
    {children}
    {hint && !error && <p className="text-gray-500 text-xs mt-1">{hint}</p>}
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const TemplateForm = ({ onSubmit, onCancel, initialData = null }) => {
  const isEdit = !!initialData;
  const headerFile = FileUploadHook();

  const [formData, setFormData] = useState({
    name: "",
    body: "",
    language: "en",
    provider_template_id: "",
    header_type: "none",
    headerFileUrl: "",
  });

  const [variableLabels, setVariableLabels] = useState({});
  const [errors, setErrors] = useState({});
  const [submitLoader, setSubmitLoader] = useState(false);

  const detectedVariables = placeholdersIn(formData.body);

  // =========================
  // Load Edit Data
  // =========================
  useEffect(() => {
    if (!initialData) return;
    setFormData({
      name: initialData.name || "",
      body: initialData.body || "",
      language: initialData.language || "en",
      provider_template_id: initialData.provider_template_id || "",
      header_type: initialData.header_type || "none",
      headerFileUrl: initialData.header_url || "",
    });
    setVariableLabels(
      Object.fromEntries((initialData.variables || []).map((v) => [String(v.var_index), v.label])),
    );
  }, [initialData]);

  const clearError = (key) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  // A new header type needs a new file
  const handleHeaderTypeChange = (e) => {
    headerFile.removePhoto();
    setFormData((prev) => ({ ...prev, header_type: e.target.value, headerFileUrl: "" }));
    clearError("header_file");
  };

  const handleHeaderFileUpload = async (type) => {
    const uploadedUrl = await headerFile.uploadImage(type);
    if (uploadedUrl) {
      setFormData((prev) => ({ ...prev, headerFileUrl: uploadedUrl }));
      clearError("header_file");
    }
  };

  // Drop the current header so a different file can be picked
  const changeHeaderFile = () => {
    headerFile.removePhoto();
    setFormData((prev) => ({ ...prev, headerFileUrl: "" }));
  };

  const handleLabelChange = (varIndex, label) => {
    setVariableLabels((prev) => ({ ...prev, [varIndex]: label }));
    clearError(`label_${varIndex}`);
  };

  // =========================
  // Validation
  // =========================
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Template name is required";
    if (!formData.body.trim()) newErrors.body = "Template body is required";
    if (!formData.provider_template_id.trim())
      newErrors.provider_template_id = "Provider template ID is required";
    if (!LANGUAGES.some((l) => l.value === formData.language)) newErrors.language = "Select a language";
    if (!HEADER_TYPES.some((h) => h.value === formData.header_type)) newErrors.header_type = "Select a header type";

    if (formData.header_type !== "none" && !formData.headerFileUrl) {
      newErrors.header_file = headerFile.file
        ? `Click "Save ${HEADER_TITLES[formData.header_type]}" to upload it`
        : `Please upload the ${HEADER_TITLES[formData.header_type].toLowerCase()}`;
    }

    // Every variable needs a name, and no two variables may share one
    const seen = {};
    detectedVariables.forEach((varIndex) => {
      const label = variableLabels[varIndex]?.trim();
      if (!label) {
        newErrors[`label_${varIndex}`] = "Name is required";
        return;
      }
      const key = label.toLowerCase();
      if (seen[key]) {
        newErrors[`label_${varIndex}`] = `Same name as {{${seen[key]}}}`;
      } else {
        seen[key] = varIndex;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // Submit
  // =========================
  const handleSubmit = async () => {
    if (submitLoader || !validateForm()) return;

    setSubmitLoader(true);

    const variables = detectedVariables.map((index) => ({
      var_index: Number(index),
      label: variableLabels[index].trim(),
    }));

    const dataToSend = {
      name: formData.name.trim(),
      body: formData.body.trim(),
      language: formData.language,
      provider_template_id: formData.provider_template_id.trim(),
      header_type: formData.header_type,
      header_url: formData.header_type === "none" ? null : formData.headerFileUrl,
      variable_count: variables.length,
      variables,
    };

    try {
      await onSubmit(dataToSend);
    } finally {
      setSubmitLoader(false);
    }
  };

  const headerTitle = HEADER_TITLES[formData.header_type];
  const savedHeader = formData.headerFileUrl;
  // While changing the header of a saved template, the old file can still be kept
  const originalHeader =
    initialData?.header_type === formData.header_type ? initialData?.header_url || "" : "";

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-custom rounded">
      {/* Title bar */}
      <div className="flex items-center gap-3 border-b px-4 py-3 md:px-6">
        <button
          onClick={onCancel}
          disabled={submitLoader}
          className="p-1.5 rounded hover:bg-gray-100 text-secondary"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl md:text-2xl text-secondary font-bold">
          {isEdit ? "Edit Template" : "Create New Template"}
        </h2>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 p-4 md:p-6">
        {/* ── Form ── */}
        <div className="space-y-5 min-w-0">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Template Name *" error={errors.name}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Exam result announcement"
                className={inputClass(errors.name)}
              />
            </Field>

            <Field
              label="Provider Template ID *"
              error={errors.provider_template_id}
              hint="The template name exactly as approved on Meta"
            >
              <input
                type="text"
                name="provider_template_id"
                value={formData.provider_template_id}
                onChange={handleChange}
                placeholder="e.g. exam_result_2026"
                className={inputClass(errors.provider_template_id)}
              />
            </Field>

            <Field
              label="Language *"
              error={errors.language}
              hint={isEdit ? "The language can't be changed after creating a template" : ""}
            >
              <div className="relative">
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  disabled={isEdit}
                  className={`${inputClass(errors.language)} disabled:bg-gray-100 disabled:text-gray-500`}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                {isEdit && <Lock size={14} className="absolute right-8 top-3 text-gray-400" />}
              </div>
            </Field>

            <Field label="Header Type *" error={errors.header_type}>
              <select
                name="header_type"
                value={formData.header_type}
                onChange={handleHeaderTypeChange}
                className={inputClass(errors.header_type)}
              >
                {HEADER_TYPES.map((h) => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Header file */}
          {formData.header_type !== "none" && (
            <div className={`border rounded p-4 ${errors.header_file ? "border-red-400 bg-red-50" : "bg-gray-50"}`}>
              {savedHeader ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {formData.header_type === "image" && (
                    <img src={fileUrl(savedHeader)} alt="Header" className="w-full sm:w-40 max-h-40 object-contain rounded bg-white border" />
                  )}
                  {formData.header_type === "video" && (
                    <video src={fileUrl(savedHeader)} controls className="w-full sm:w-56 max-h-40 rounded bg-black" />
                  )}
                  {formData.header_type === "document" && (
                    <a
                      href={fileUrl(savedHeader)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary underline"
                    >
                      <FileText size={20} /> View header document
                    </a>
                  )}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-green-700 font-medium">{headerTitle} saved</p>
                    <button
                      type="button"
                      onClick={changeHeaderFile}
                      disabled={submitLoader}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors text-sm"
                    >
                      <RefreshCw size={14} /> Change {headerTitle}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                {originalHeader && !headerFile.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, headerFileUrl: originalHeader }))}
                    className="mb-3 text-sm text-primary underline"
                  >
                    Keep the current {headerTitle.toLowerCase()}
                  </button>
                )}
                <FileUpload
                  title={headerTitle}
                  imageUrl={headerFile.imageUrl}
                  error={headerFile.error}
                  loader={headerFile.loader}
                  isSaved={headerFile.isSaved}
                  imageType={
                    formData.header_type === "image" ? "template" : formData.header_type
                  }
                  onFileUpload={headerFile.handleFileUpload}
                  onUploadImage={handleHeaderFileUpload}
                  onRemovePhoto={changeHeaderFile}
                />
                </>
              )}
              {errors.header_file && <p className="text-red-500 text-sm">{errors.header_file}</p>}
            </div>
          )}

          {/* Body */}
          <Field
            label="Template Body *"
            error={errors.body}
            hint="Use {{1}}, {{2}} … where each receiver's own value goes"
          >
            <textarea
              name="body"
              value={formData.body}
              onChange={handleChange}
              rows={7}
              className={`${inputClass(errors.body)} font-mono text-sm`}
              placeholder="Hello {{1}}, your payment of Rs.{{2}} has been received."
            />
          </Field>

          {/* Variable names */}
          {detectedVariables.length > 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-semibold text-secondary mb-3">
                Name Your Variables ({detectedVariables.length})
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {detectedVariables.map((varIndex) => (
                  <div key={varIndex}>
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 text-xs font-mono bg-primary text-white rounded px-2 py-1">
                        {`{{${varIndex}}}`}
                      </span>
                      <input
                        value={variableLabels[varIndex] || ""}
                        onChange={(e) => handleLabelChange(varIndex, e.target.value)}
                        placeholder="e.g. Student Name"
                        className={`${inputClass(errors[`label_${varIndex}`])} bg-white`}
                      />
                    </div>
                    {errors[`label_${varIndex}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`label_${varIndex}`]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            formData.body.trim() && (
              <p className="text-sm text-gray-500">
                No variables — every receiver gets the same message.
              </p>
            )
          )}
        </div>

        {/* ── Live preview ── */}
        <div className="lg:sticky lg:top-4 self-start">
          <p className="text-sm font-medium text-black mb-2">Preview</p>
          <MessagePreview
            body={formData.body}
            headerType={formData.header_type}
            headerUrl={savedHeader || headerFile.imageUrl}
            labels={variableLabels}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t px-4 py-3 md:px-6">
        <button
          onClick={onCancel}
          disabled={submitLoader}
          className="px-5 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitLoader || headerFile.loader}
          className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-2 rounded hover:bg-secondary disabled:opacity-50 min-w-40"
        >
          {submitLoader ? (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <Save size={16} /> {isEdit ? "Update Template" : "Save Template"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TemplateForm;
