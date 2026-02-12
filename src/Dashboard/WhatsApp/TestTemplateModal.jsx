import { useState, useEffect } from "react";
import api from "../../Api";


const TestTemplateModal = ({ template, onClose }) => {
  const [phone, setPhone] = useState("");
  const [testData, setTestData] = useState({});
  const [submitLoader, setSubmitLoader] = useState(false);
  const [result, setResult] = useState(null);

  // =========================
  // Initialize Variable Inputs
  // =========================
  useEffect(() => {
    const initialData = {};

    template.variables?.forEach((v) => {
      initialData[v.label] = "";
    });

    setTestData(initialData);
  }, [template]);

  // =========================
  // Handle Variable Input
  // =========================
  const handleTestDataChange = (label, value) => {
    setTestData((prev) => ({ ...prev, [label]: value }));
  };

  // =========================
  // Send Test Message
  // =========================
  const handleSendTest = async () => {
    if (!phone.trim()) {
      alert("Please enter a phone number");
      return;
    }

    const missingData = Object.entries(testData).filter(
      ([_, value]) => !value.trim(),
    );

    if (missingData.length > 0) {
      alert("Please fill all variable values");
      return;
    }

    setSubmitLoader(true);
    setResult(null);

    try {
      const response = await api.post(`/templates/${template.id}/test`, {
        phone,
        test_data: testData,
      });

      if (response.data.success) {
        const cleaned = response.data.rendered_message
          ?.replace(/\\n/g, "\n")
          ?.replace(/\r\n/g, "\n");

        setResult({
          success: true,
          message: response.data.message,
          rendered: cleaned,
        });

        alert("Test message sent successfully !!");
      } else {
        setResult({
          success: false,
          message: response.data.message,
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: "Failed to send test message",
      });

      console.error("Test error:", err);
    } finally {
      setSubmitLoader(false);
    }
  };

  // =========================
  // UI (UNCHANGED)
  // =========================
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-custom">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-secondary">
              Test: {template.name}
            </h3>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div>
            {/* Phone Input */}
            <div className="mb-3">
              <label className="block">Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);

                  setPhone(value);
                }}
                maxLength={10}
                className="border p-2 w-full rounded"
                placeholder="9876543210"
              />
            </div>

            {/* Variables Section */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <h4 className="text-sm font-semibold text-secondary mb-3">
                Variable Values
              </h4>

              <div className="space-y-3">
                {template.variables?.map((variable) => (
                  <div key={variable.id} className="mb-3">
                    <label className="block">
                      {variable.label} ({"{{"}
                      {variable.var_index}
                      {"}}"})*
                    </label>

                    <input
                      type="text"
                      value={testData[variable.label] || ""}
                      onChange={(e) =>
                        handleTestDataChange(variable.label, e.target.value)
                      }
                      className="border p-2 w-full rounded"
                      placeholder={`Enter ${variable.label}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Result Section */}
            {result && (
              <div
                className={`p-4 rounded mb-4 ${
                  result.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={`font-medium ${
                    result.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {result.message}
                </p>

                {result.rendered && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <p className="text-sm text-black font-mono whitespace-pre-line">
                      {result.rendered}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 text-black px-4 py-2 rounded hover:bg-gray-50"
              >
                Close
              </button>

              <button
                onClick={handleSendTest}
                className="flex-1 bg-primary min-w-36 disabled:opacity-50 grid place-items-center text-white px-4 py-2 rounded hover:bg-secondary"
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
    </div>
  );
};

export default TestTemplateModal;