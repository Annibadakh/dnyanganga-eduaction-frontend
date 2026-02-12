import { useState } from "react";

const TemplatesList = ({ templates, onEdit, onDelete, onTest, loading }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const imgUrl = import.meta.env.VITE_IMG_URL;

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
        <div className="text-6xl mb-4">📝</div>
        <p className="text-gray-500 text-lg">No templates found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <div
          key={template.id}
          className="bg-white border rounded shadow-custom p-4 hover:shadow-lg transition-all"
        >
          {/* Title */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-secondary flex-1">
              {template.name}
            </h3>

            <div className="flex gap-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                {template.language === "en"
                  ? "🇬🇧 EN"
                  : template.language === "hi"
                    ? "🇮🇳 हिं"
                    : "🇮🇳 मरा"}
              </span>

              {template.header_type !== "none" && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {template.header_type}
                </span>
              )}
            </div>
          </div>

          {/* Header Image */}
          {template.header_url && template.header_type === "image" && (
            <div className="mb-3 flex justify-center">
              <img
                src={`${imgUrl}${template.header_url}`}
                alt="Header"
                className="w-40 h-40 object-contain rounded"
              />
            </div>
          )}

          {/* Header Document */}
          {template.header_url && template.header_type === "document" && (
            <div className="mb-3 flex flex-col gap-2 items-center">
              <button className="bg-secondary p-2 rounded-md text-white">
                <a
                  href={`${imgUrl}${template.header_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Header Document
                </a>
              </button>
            </div>
          )}

          {/* Variables Section */}
          {template.variables?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                Variables:
              </p>

              <div className="flex flex-wrap gap-1">
                {template.variables.map((v) => (
                  <span
                    key={v.id}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >
                    {"{{"}
                    {v.var_index}
                    {"}}"} → {v.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => onTest(template)}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Test
            </button>

            <button
              onClick={() => onEdit(template)}
              className="flex-1 px-3 py-2 bg-gray-100 text-black rounded hover:bg-gray-200 text-sm"
            >
              Edit
            </button>

            <button
              onClick={() => setDeleteConfirm(template.id)}
              className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Delete
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
      ))}
    </div>
  );
};

export default TemplatesList;