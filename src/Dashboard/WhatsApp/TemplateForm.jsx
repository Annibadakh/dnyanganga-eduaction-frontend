import React, { useState, useEffect } from 'react';

const TemplateForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    body: '',
    provider_template_id: ''
  });
  const [extractedVariables, setExtractedVariables] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        body: initialData.body || '',
        provider_template_id: initialData.provider_template_id || ''
      });
      setExtractedVariables(initialData.variables_json || []);
    }
  }, [initialData]);

  // Extract variables from template body
  const extractVariables = (text) => {
    const regex = /\{\{(\w+)\}\}/g;
    const variables = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    return variables;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Extract variables when body changes
    if (name === 'body') {
      const variables = extractVariables(value);
      setExtractedVariables(variables);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (!formData.body.trim()) {
      newErrors.body = 'Template body is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {initialData ? 'Edit Template' : 'Create New Template'}
      </h2>

      <div className="space-y-6">
        {/* Template Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Template Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Welcome Message"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Template Body */}
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
            Template Body *
          </label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            rows={6}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.body ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Hello {{name}}, your payment of {{amount}} has been received."
          />
          {errors.body && (
            <p className="mt-1 text-sm text-red-600">{errors.body}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Use <code className="bg-gray-100 px-1 py-0.5 rounded">{'{{variable}}'}</code> format for dynamic values
          </p>
        </div>

        {/* Provider Template ID */}
        <div>
          <label htmlFor="provider_template_id" className="block text-sm font-medium text-gray-700 mb-2">
            Provider Template ID (Optional)
          </label>
          <input
            type="text"
            id="provider_template_id"
            name="provider_template_id"
            value={formData.provider_template_id}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="BSP template ID"
          />
        </div>

        {/* Extracted Variables Display */}
        {extractedVariables.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Detected Variables ({extractedVariables.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {extractedVariables.map((variable, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {variable}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Template' : 'Create Template')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateForm;