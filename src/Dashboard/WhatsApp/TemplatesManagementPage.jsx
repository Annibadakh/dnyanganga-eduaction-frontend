import { useState, useEffect } from "react";
import { CheckCircle2, Plus, Search, X, XCircle } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text }

  // =========================
  // Fetch Templates
  // =========================
  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

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
          variables: [...(t.variables || [])].sort((a, b) => a.var_index - b.var_index),
        }));

        setTemplates(cleaned);
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
      setNotice({ type: "error", text: "Could not load templates" });
    } finally {
      setLoading(false);
    }
  };

  const errorText = (err, fallback) => err.response?.data?.message || fallback;

  // =========================
  // Create / Update Template
  // =========================
  const handleCreate = async (formData) => {
    try {
      await api.post("/templates", formData);
      setNotice({ type: "success", text: "Template created successfully" });
      await fetchTemplates();
      setView("list");
    } catch (err) {
      console.error("Error creating template:", err);
      alert(errorText(err, "Error creating template"));
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await api.put(`/templates/${editingTemplate.id}`, formData);
      setNotice({ type: "success", text: "Template updated successfully" });
      await fetchTemplates();
      setView("list");
      setEditingTemplate(null);
    } catch (err) {
      console.error("Error updating template:", err);
      alert(errorText(err, "Error updating template"));
    }
  };

  // =========================
  // Delete Template
  // =========================
  const handleDelete = async (id) => {
    try {
      await api.delete(`/templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setNotice({ type: "success", text: "Template deleted" });
    } catch (err) {
      // e.g. "This template is used by 3 jobs…"
      console.error("Error deleting template:", err);
      setNotice({ type: "error", text: errorText(err, "Error deleting template") });
    }
  };

  // =========================
  // Create / Edit View
  // =========================
  if (view === "create" || view === "edit") {
    const close = () => {
      setView("list");
      setEditingTemplate(null);
    };
    return (
      <div className="p-3 md:p-6">
        <TemplateForm
          key={editingTemplate?.id || "new"}
          initialData={view === "edit" ? editingTemplate : null}
          onSubmit={view === "edit" ? handleUpdate : handleCreate}
          onCancel={close}
        />
      </div>
    );
  }

  const query = search.trim().toLowerCase();
  const shown = query
    ? templates.filter(
        (t) =>
          t.name?.toLowerCase().includes(query) ||
          t.provider_template_id?.toLowerCase().includes(query) ||
          t.body?.toLowerCase().includes(query),
      )
    : templates;

  // =========================
  // List View
  // =========================
  return (
    <div className="max-w-7xl mx-auto p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">
            WhatsApp Templates
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Manage message templates with headers and variables
          </p>
        </div>

        <button
          onClick={() => setView("create")}
          className="px-5 py-2 bg-primary text-white rounded hover:bg-secondary flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Create Template
        </button>
      </div>

      {notice && (
        <div
          className={`mb-4 p-3 rounded border flex items-start gap-2 text-sm ${
            notice.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notice.type === "success" ? <CheckCircle2 size={18} className="shrink-0" /> : <XCircle size={18} className="shrink-0" />}
          <span className="flex-1">{notice.text}</span>
          <button onClick={() => setNotice(null)} aria-label="Close">
            <X size={16} />
          </button>
        </div>
      )}

      {templates.length > 0 && (
        <div className="relative mb-4 max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates"
            className="border border-gray-300 rounded pl-9 pr-3 py-2 w-full focus:outline-none focus:border-primary"
          />
        </div>
      )}

      {/* Templates List */}
      <TemplatesList
        templates={shown}
        loading={loading}
        onDelete={handleDelete}
        onTest={setTestingTemplate}
        onEdit={(t) => {
          setEditingTemplate(t);
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
