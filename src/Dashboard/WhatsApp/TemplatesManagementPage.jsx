import { useState, useEffect } from "react";
import api from "../../Api";

import TemplateForm from "./TemplateForm";
import TemplatesList from "./TemplatesList";
import TestTemplateModal from "./TestTemplateModal";

const TemplatesManagementPage = () => {
  const [view, setView] = useState("list");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [testingTemplate, setTestingTemplate] = useState(null);

  // =========================
  // Fetch Templates
  // =========================
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);

      const response = await api.get("/templates");

      if (response.data.success) {
        const cleaned = response.data.data.map((t) => ({
          ...t,
          body: t.body
            ?.replace(/\\n/g, "\n")
            ?.replace(/\r\n/g, "\n"),
        }));

        setTemplates(cleaned);

        // Reset testing modal if list refreshes
        setTestingTemplate(null);
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Create Template
  // =========================
  const handleCreate = async (formData) => {
    try {
      const response = await api.post("/templates", formData);

      if (response.data.success) {
        alert("Template created successfully!");
        await fetchTemplates();
        setView("list");
      } else {
        alert(response.data.message || "Failed to create template");
      }
    } catch (err) {
      console.error("Error creating template:", err);
      alert(err.response?.data?.message || "Error creating template");
    }
  };

  // =========================
  // Update Template
  // =========================
  const handleUpdate = async (formData) => {
    try {
      const response = await api.put(
        `/templates/${editingTemplate.id}`,
        formData
      );

      if (response.data.success) {
        alert("Template updated successfully!");
        await fetchTemplates();
        setView("list");
        setEditingTemplate(null);
      } else {
        alert(response.data.message || "Failed to update template");
      }
    } catch (err) {
      console.error("Error updating template:", err);
      alert(err.response?.data?.message || "Error updating template");
    }
  };

  // =========================
  // Delete Template
  // =========================
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/templates/${id}`);

      if (response.data.success) {
        alert("Template deleted successfully!");

        // Safe state update
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert(response.data.message || "Failed to delete template");
      }
    } catch (err) {
      console.error("Error deleting template:", err);
      alert(err.response?.data?.message || "Error deleting template");
    }
  };

  // =========================
  // Create View
  // =========================
  if (view === "create") {
    return (
      <div className="p-6">
        <TemplateForm
          onSubmit={handleCreate}
          onCancel={() => setView("list")}
        />
      </div>
    );
  }

  // =========================
  // Edit View
  // =========================
  if (view === "edit") {
    return (
      <div className="p-6">
        <TemplateForm
          initialData={editingTemplate}
          onSubmit={handleUpdate}
          onCancel={() => {
            setView("list");
            setEditingTemplate(null);
          }}
        />
      </div>
    );
  }

  // =========================
  // List View
  // =========================
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary">
            WhatsApp Templates
          </h1>
          <p className="text-gray-600 mt-1">
            Manage message templates with headers and variables
          </p>
        </div>

        <button
          onClick={() => setView("create")}
          className="px-6 py-2 bg-primary text-white rounded hover:bg-secondary flex items-center gap-2"
        >
          <span>+</span> Create Template
        </button>
      </div>

      {/* Templates List */}
      <TemplatesList
        templates={templates}
        loading={loading}
        onDelete={handleDelete}
        onTest={setTestingTemplate}
        onEdit={(t) => {
          // Ensure variables ordered properly
          const normalized = {
            ...t,
            variables: (t.variables || []).sort(
              (a, b) => a.var_index - b.var_index
            ),
          };

          setEditingTemplate(normalized);
          setView("edit");
        }}
      />

      {/* Test Modal */}
      {testingTemplate && (
        <TestTemplateModal
          template={testingTemplate}
          onClose={() => setTestingTemplate(null)}
        />
      )}
    </div>
  );
};

export default TemplatesManagementPage;