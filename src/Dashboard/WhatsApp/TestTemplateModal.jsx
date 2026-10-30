import { useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import api from "../../Api";
import MessagePreview from "./MessagePreview";

const TestTemplateModal = ({ template, onClose }) => {
  const [phone, setPhone] = useState("");
  // Variable values keyed by var_index (labels could repeat in older templates)
  const [testData, setTestData] = useState({});
  const [submitLoader, setSubmitLoader] = useState(false);
  const [result, setResult] = useState(null);

  const variables = template.variables || [];
  const labels = Object.fromEntries(variables.map((v) => [String(v.var_index), v.label]));

  const handleSendTest = async () => {
    if (!/^\d{10}$/.test(phone)) {
      setResult({ success: false, message: "Enter a valid 10-digit mobile number" });
      return;
    }

    const missing = variables.filter((v) => !testData[v.var_index]?.trim());
    if (missing.length > 0) {
      setResult({ success: false, message: `Enter a value for: ${missing.map((v) => v.label).join(", ")}` });
      return;
    }

    setSubmitLoader(true);
    setResult(null);

    try {
      const response = await api.post(`/templates/${template.id}/test`, {
        phone,
        test_data: testData,
      });
      setResult({ success: true, message: response.data.message });
    } catch (err) {
      console.error("Test error:", err);
      // The backend passes on WhatsApp's own reason (template not approved, wrong values…)
      setResult({
        success: false,
        message: err.response?.data?.message || "Failed to send test message",
      });
    } finally {
      setSubmitLoader(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div className="bg-white rounded-t-lg sm:rounded-lg max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-custom">
        <div className="flex justify-between items-center gap-3 border-b px-4 py-3 md:px-6 sticky top-0 bg-white z-10">
          <h3 className="text-lg md:text-xl font-bold text-secondary break-words min-w-0">
            Test: {template.name}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black shrink-0" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-5 p-4 md:p-6">
          <div className="space-y-3">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Phone Number *</label>
              <div className="flex">
                <span className="px-3 py-2 border border-r-0 border-gray-300 rounded-l bg-gray-50 text-gray-600">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  className="border border-gray-300 p-2 w-full rounded-r focus:outline-none focus:border-primary"
                  placeholder="9876543210"
                />
              </div>
            </div>

            {/* Variables */}
            {variables.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-3">
                <h4 className="text-sm font-semibold text-secondary">Variable Values</h4>
                {variables.map((variable) => (
                  <div key={variable.id ?? variable.var_index}>
                    <label className="block text-sm mb-1">
                      {variable.label} <span className="text-gray-500 font-mono">{`{{${variable.var_index}}}`}</span> *
                    </label>
                    <input
                      type="text"
                      value={testData[variable.var_index] || ""}
                      onChange={(e) =>
                        setTestData((prev) => ({ ...prev, [variable.var_index]: e.target.value }))
                      }
                      className="border border-gray-300 p-2 w-full rounded bg-white focus:outline-none focus:border-primary"
                      placeholder={`Enter ${variable.label}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-black mb-1">Preview</p>
            <MessagePreview
              body={template.body}
              headerType={template.header_type}
              headerUrl={template.header_url}
              labels={labels}
              values={testData}
            />
          </div>
        </div>

        <div className="px-4 pb-4 md:px-6 md:pb-6">
          {result && (
            <div
              className={`p-3 rounded mb-3 flex items-start gap-2 text-sm ${
                result.success
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {result.success ? <CheckCircle2 size={18} className="shrink-0" /> : <XCircle size={18} className="shrink-0" />}
              <span className="break-words">{result.message}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-black px-4 py-2 rounded hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={handleSendTest}
              className="flex-1 bg-primary disabled:opacity-50 grid place-items-center text-white px-4 py-2 rounded hover:bg-secondary"
              disabled={submitLoader}
            >
              {submitLoader ? (
                <span className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                "Send Test"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTemplateModal;
