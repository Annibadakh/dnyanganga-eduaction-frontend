import { useState } from "react";
import { FileText, Pencil, Send, Trash2 } from "lucide-react";
import { fileUrl } from "../../utils/fileUrl";

const LANGUAGE_LABELS = { en: "English", hi: "हिंदी", mr: "मराठी" };

const TemplatesList = ({ templates, onEdit, onDelete, onTest, loading }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded">
        <FileText size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 text-lg">No templates found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <div
          key={template.id}
          className="bg-white border rounded shadow-custom flex flex-col overflow-hidden hover:shadow-lg transition-all"
        >
          {/* Header image / video */}
          {template.header_url && template.header_type === "image" && (
            <img
              src={fileUrl(template.header_url)}
              alt="Header"
              className="w-full h-40 object-cover bg-gray-100"
            />
          )}
          {template.header_url && template.header_type === "video" && (
            <video controls preload="metadata" className="w-full h-40 bg-black">
              <source src={fileUrl(template.header_url)} type="video/mp4" />
            </video>
          )}

          <div className="p-4 flex flex-col flex-1">
            {/* Title */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-lg font-semibold text-secondary break-words min-w-0">
                {template.name}
              </h3>
              <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                {LANGUAGE_LABELS[template.language] || template.language}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-gray-500">
              {template.provider_template_id && (
                <span className="font-mono break-all">{template.provider_template_id}</span>
              )}
              {template.header_type !== "none" && (
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded capitalize">
                  {template.header_type} header
                </span>
              )}
            </div>

            {/* Header document */}
            {template.header_url && template.header_type === "document" && (
              <a
                href={fileUrl(template.header_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 flex items-center gap-2 text-sm text-primary underline"
              >
                <FileText size={16} /> Open header document
              </a>
            )}

            {/* Body */}
            <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-4 mb-3">
              {template.body}
            </p>

            {/* Variables */}
            {template.variables?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {template.variables.map((v) => (
                  <span
                    key={v.id}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >
                    {`{{${v.var_index}}}`} → {v.label}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-auto pt-2">
              <button
                onClick={() => onTest(template)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                <Send size={14} /> Test
              </button>

              <button
                onClick={() => onEdit(template)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-black rounded hover:bg-gray-200 text-sm"
              >
                <Pencil size={14} /> Edit
              </button>

              <button
                onClick={() => setDeleteConfirm(template.id)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>

            {/* Delete Confirm */}
            {deleteConfirm === template.id && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800 mb-2">
                  Delete "{template.name}"?
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onDelete(template.id);
                      setDeleteConfirm(null);
                    }}
                    className="flex-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-3 py-1 bg-gray-200 text-black rounded hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplatesList;
