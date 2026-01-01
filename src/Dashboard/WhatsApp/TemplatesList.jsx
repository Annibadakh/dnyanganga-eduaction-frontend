import React, { useState, useEffect } from 'react';

const TemplatesList = ({ onEdit, onDelete, onCreateNew }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.data);
      } else {
        setError('Failed to load templates');
      }
    } catch (err) {
      setError('Error loading templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTemplates(templates.filter(t => t.id !== id));
        setDeleteConfirm(null);
      } else {
        alert('Failed to delete template');
      }
    } catch (err) {
      alert('Error deleting template');
      console.error(err);
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">WhatsApp Templates</h1>
        <button
          onClick={onCreateNew}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>Create Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">No templates found</p>
          <button
            onClick={onCreateNew}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Template
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              {/* Template Name */}
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {template.name}
              </h3>

              {/* Template Body Preview */}
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {truncateText(template.body)}
              </p>

              {/* Variables */}
              {template.variables_json && template.variables_json.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables_json.map((variable, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Provider Template ID */}
              {template.provider_template_id && (
                <p className="text-xs text-gray-500 mb-4">
                  Provider ID: {template.provider_template_id}
                </p>
              )}

              {/* Created Date */}
              <p className="text-xs text-gray-400 mb-4">
                Created: {new Date(template.created_at).toLocaleDateString()}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(template)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(template.id)}
                  className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === template.id && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 mb-3">
                    Are you sure you want to delete this template?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="flex-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplatesList;