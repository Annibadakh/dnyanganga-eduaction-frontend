import React, { useState, useEffect } from 'react';
import api from '../../Api';
import { FileUploadHook } from '../FileUploadHook';
import FileUpload from '../FileUpload';

// Template Form Component
const TemplateForm = ({ onSubmit, onCancel, initialData = null }) => {
  const headerFile = FileUploadHook();
  
  const [formData, setFormData] = useState({
    name: '',
    body: '',
    language: 'en',
    provider_template_id: '',
    header_type: 'none',
    headerFileUrl: ''
  });
  
  const [detectedVariables, setDetectedVariables] = useState([]);
  const [variableLabels, setVariableLabels] = useState({});
  const [errors, setErrors] = useState({});
  const [submitLoader, setSubmitLoader] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        body: initialData.body || '',
        language: initialData.language || 'en',
        provider_template_id: initialData.provider_template_id || '',
        header_type: initialData.header_type || 'none',
        headerFileUrl: initialData.header_url || ''
      });
      
      if (initialData.variables_json) {
        const labels = {};
        initialData.variables_json.forEach(v => {
          labels[v.index] = v.label;
        });
        setVariableLabels(labels);
      }
      
      extractVariablesFromBody(initialData.body);
    }
  }, [initialData]);

  const extractVariablesFromBody = (text) => {
    const regex = /\{\{(\d+)\}\}/g;
    const variables = new Set();
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      variables.add(match[1]);
    }
    
    const sortedVars = Array.from(variables).sort((a, b) => parseInt(a) - parseInt(b));
    setDetectedVariables(sortedVars);
    
    setVariableLabels(prev => {
      const newLabels = { ...prev };
      sortedVars.forEach(varIndex => {
        if (!newLabels[varIndex]) {
          newLabels[varIndex] = '';
        }
      });
      return newLabels;
    });
  };

  const handleBodyChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, body: value }));
    extractVariablesFromBody(value);
    if (errors.body) setErrors(prev => ({ ...prev, body: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleHeaderTypeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, header_type: value }));
    
    if (value === 'none') {
      headerFile.removePhoto();
      setFormData(prev => ({ ...prev, headerFileUrl: '' }));
    }
  };

  const handleHeaderFileUpload = async () => {
    const uploadedUrl = await headerFile.uploadImage();
    if (uploadedUrl) {
      setFormData(prev => ({ ...prev, headerFileUrl: uploadedUrl }));
    }
  };

  const handleLabelChange = (varIndex, label) => {
    setVariableLabels(prev => ({ ...prev, [varIndex]: label }));
    if (errors[`label_${varIndex}`]) {
      setErrors(prev => ({ ...prev, [`label_${varIndex}`]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Template name is required';
    if (!formData.body.trim()) newErrors.body = 'Template body is required';
    
    if (formData.header_type !== 'none' && !headerFile.isSaved && !formData.headerFileUrl) {
      newErrors.header_file = 'Please upload and save header file';
    }
    
    detectedVariables.forEach(varIndex => {
      if (!variableLabels[varIndex] || !variableLabels[varIndex].trim()) {
        newErrors[`label_${varIndex}`] = 'Label is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitLoader(true);
    
    const variables_json = detectedVariables.map(index => ({
      index,
      label: variableLabels[index].trim()
    }));
    
    const dataToSend = {
      name: formData.name,
      body: formData.body,
      language: formData.language,
      provider_template_id: formData.provider_template_id,
      header_type: formData.header_type,
      header_url: formData.headerFileUrl,
      variables_json
    };
    
    try {
      await onSubmit(dataToSend);
    } finally {
      setSubmitLoader(false);
    }
  };

  return (
    <div className="max-w-4xl bg-white shadow-custom mx-auto md:p-6 p-4">
      <h2 className="text-2xl text-secondary text-center font-bold mb-6">
        {initialData ? 'Edit Template' : 'Create New Template'}
      </h2>
      
      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">Template Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`border p-2 w-full rounded ${errors.name ? 'border-red-500' : ''}`}
            placeholder="e.g., Payment Confirmation"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">Language *</label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">Header Type *</label>
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

        {formData.header_type !== 'none' && (
          <div className="mb-6">
            <FileUpload
              title={formData.header_type === 'image' ? 'Template Header Image' : 'Template Header Document'}
              imageUrl={headerFile.imageUrl || formData.headerFileUrl}
              error={headerFile.error}
              loader={headerFile.loader}
              isSaved={headerFile.isSaved || !!formData.headerFileUrl}
              imageType={formData.header_type}
              onFileUpload={headerFile.handleFileUpload}
              onUploadImage={handleHeaderFileUpload}
              onRemovePhoto={() => {
                headerFile.removePhoto();
                setFormData(prev => ({ ...prev, headerFileUrl: '' }));
              }}
            />
          </div>
        )}

        <div className="mb-3">
          <label className="block text-sm font-medium text-black mb-2">Template Body *</label>
          <textarea
            name="body"
            value={formData.body}
            onChange={handleBodyChange}
            rows={6}
            className={`border p-2 w-full rounded font-mono text-sm ${errors.body ? 'border-red-500' : ''}`}
            placeholder="Hello {{1}}, your payment of Rs.{{2}} has been received on {{3}}."
          />
          {errors.body && <p className="text-red-500 text-sm mt-1">{errors.body}</p>}
          <p className="text-gray-600 text-sm mt-2">
            Use <code className="bg-gray-100 px-2 py-1 rounded">{'{{1}}'}</code>, 
            <code className="bg-gray-100 px-2 py-1 rounded ml-1">{'{{2}}'}</code>, etc. for variables
          </p>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-black mb-2">Provider Template ID (Optional)</label>
          <input
            type="text"
            name="provider_template_id"
            value={formData.provider_template_id}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            placeholder="WhatsApp BSP template ID"
          />
        </div>

        {detectedVariables.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="text-lg font-semibold text-secondary">
                Label Your Variables ({detectedVariables.length})
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Give meaningful names to each variable for easy mapping during job creation
            </p>
            
            <div className="space-y-3">
              {detectedVariables.map((varIndex) => (
                <div key={varIndex} className="bg-white rounded p-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary text-white rounded flex items-center justify-center font-bold">
                        {varIndex}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block">
                        Variable {'{{'}{varIndex}{'}}'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={variableLabels[varIndex] || ''}
                        onChange={(e) => handleLabelChange(varIndex, e.target.value)}
                        className={`border p-2 w-full rounded ${errors[`label_${varIndex}`] ? 'border-red-500' : ''}`}
                        placeholder={`e.g., ${varIndex === '1' ? 'student_name' : varIndex === '2' ? 'amount' : 'field_name'}`}
                      />
                      {errors[`label_${varIndex}`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`label_${varIndex}`]}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        This label will be used to map database columns
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {errors.header_file && (
          <div className="mb-4">
            <p className="text-amber-600 text-sm font-medium bg-amber-50 border border-amber-200 rounded p-3">
              📸 {errors.header_file}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {!errors.name && !errors.body && (!formData.header_type || formData.header_type === 'none' || headerFile.isSaved || formData.headerFileUrl) && detectedVariables.length > 0 && Object.values(variableLabels).every(v => v.trim()) ? (
            <button
              onClick={handleSubmit}
              disabled={submitLoader}
              className="bg-primary min-w-36 disabled:opacity-50 grid place-items-center text-white px-4 py-2 rounded hover:bg-secondary"
            >
              {submitLoader ? (
                <span className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                initialData ? 'Update Template' : 'Create Template'
              )}
            </button>
          ) : (
            <div className="mb-4 w-full">
              <p className="text-amber-600 text-sm font-medium bg-amber-50 border border-amber-200 rounded p-3">
                {formData.header_type !== 'none' && !headerFile.isSaved && !formData.headerFileUrl
                  ? '📸 Please upload and save header file first'
                  : detectedVariables.length === 0
                  ? '⚠️ Add variables to template body using {{1}}, {{2}}, etc.'
                  : '⚠️ Please fill all required fields and label all variables'}
              </p>
            </div>
          )}
          <button
            onClick={onCancel}
            disabled={submitLoader}
            className="bg-red-500 disabled:opacity-50 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

// Test Template Modal
const TestTemplateModal = ({ template, onClose }) => {
  const [phone, setPhone] = useState('');
  const [testData, setTestData] = useState({});
  const [submitLoader, setSubmitLoader] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const initialData = {};
    template.variables_json.forEach(v => {
      initialData[v.label] = '';
    });
    setTestData(initialData);
  }, [template]);

  const handleTestDataChange = (label, value) => {
    setTestData(prev => ({ ...prev, [label]: value }));
  };

  const handleSendTest = async () => {
    if (!phone.trim()) {
      alert('Please enter a phone number');
      return;
    }

    const missingData = Object.entries(testData).filter(([_, value]) => !value.trim());
    if (missingData.length > 0) {
      alert('Please fill all variable values');
      return;
    }

    setSubmitLoader(true);
    setResult(null);

    try {
      const response = await api.post(`/templates/${template.id}/test`, {
        phone,
        test_data: testData
      });

      if (response.data.success) {
        const cleaned = response.data.data.rendered_message
            ?.replace(/\\n/g, '\n')   // convert escaped \n
            ?.replace(/\r\n/g, '\n')
        // console.log(response.data);
        setResult({ success: true, message: response.data.message, rendered: cleaned });
        alert('Test message sent successfully!');
      } else {
        setResult({ success: false, message: response.data.message });
      }
    } catch (err) {
      setResult({ success: false, message: 'Failed to send test message' });
      console.error('Test error:', err);
    } finally {
      setSubmitLoader(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-custom">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-secondary">Test: {template.name}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-black">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
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


            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <h4 className="text-sm font-semibold text-secondary mb-3">Variable Values</h4>
              <div className="space-y-3">
                {template.variables_json.map((variable) => (
                  <div key={variable.index} className="mb-3">
                    <label className="block">
                      {variable.label} ({'{{'}{variable.index}{'}}'})*
                    </label>
                    <input
                      type="text"
                      value={testData[variable.label] || ''}
                      onChange={(e) => handleTestDataChange(variable.label, e.target.value)}
                      className="border p-2 w-full rounded"
                      placeholder={`Enter ${variable.label}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {result && (
              <div className={`p-4 rounded mb-4 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.message}
                </p>
                {result.rendered && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <p className="text-sm text-black font-mono whitespace-pre-line">{result.rendered}</p>
                  </div>
                )}
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
                className="flex-1 bg-primary min-w-36 disabled:opacity-50 grid place-items-center text-white px-4 py-2 rounded hover:bg-secondary"
                disabled={submitLoader}
              >
                {submitLoader ? (
                  <span className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  'Send Test'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Templates List
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
        <div key={template.id} className="bg-white border rounded shadow-custom p-4 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-secondary flex-1">{template.name}</h3>
            <div className="flex gap-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                {template.language === 'en' ? '🇬🇧 EN' : template.language === 'hi' ? '🇮🇳 हिं' : '🇮🇳 मरा'}
              </span>
              {template.header_type !== 'none' && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {template.header_type}
                </span>
              )}
            </div>
          </div>

          {template.header_url && template.header_type === 'image' && (
            <div className="mb-3 flex justify-center">
              <img src={`${imgUrl}${template.header_url}`} alt="Header" className="w-40 h-40 object-contain rounded" />
            </div>
          )}

          <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded border mb-3 whitespace-pre-line">
            {template.body}
        </p>


          {template.variables_json?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 mb-2">Variables:</p>
              <div className="flex flex-wrap gap-1">
                {template.variables_json.map((v, i) => (
                  <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {'{{'}{v.index}{'}}'}→{v.label}
                  </span>
                ))}
              </div>
            </div>
          )}

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

          {deleteConfirm === template.id && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800 mb-2">Delete "{template.name}"?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { onDelete(template.id); setDeleteConfirm(null); }}
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

// Main Page
const TemplatesManagementPage = () => {
  const [view, setView] = useState('list');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [testingTemplate, setTestingTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/templates');
        if (response.data.success) {
            const cleaned = response.data.data.map(t => ({
            ...t,
            body: t.body
            ?.replace(/\\n/g, '\n')   // convert escaped \n
            ?.replace(/\r\n/g, '\n')  // normalize windows newlines
        }));
        setTemplates(cleaned);
        console.log(cleaned);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      const response = await api.post('/templates', formData);
      if (response.data.success) {
        alert('Template created successfully!');
        await fetchTemplates();
        setView('list');
      } else {
        alert(response.data.message || 'Failed to create template');
      }
    } catch (err) {
      console.error('Error creating template:', err);
      alert('Error creating template');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const response = await api.put(`/templates/${editingTemplate.id}`, formData);
      if (response.data.success) {
        alert('Template updated successfully!');
        await fetchTemplates();
        setView('list');
        setEditingTemplate(null);
      } else {
        alert(response.data.message || 'Failed to update template');
      }
    } catch (err) {
      console.error('Error updating template:', err);
      alert('Error updating template');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/templates/${id}`);
      if (response.data.success) {
        alert('Template deleted successfully!');
        setTemplates(templates.filter(t => t.id !== id));
      } else {
        alert(response.data.message || 'Failed to delete template');
      }
    } catch (err) {
      console.error('Error deleting template:', err);
      alert('Error deleting template');
    }
  };

  if (view === 'create') {
    return (
      <div className="p-6">
        <TemplateForm onSubmit={handleCreate} onCancel={() => setView('list')} />
      </div>
    );
  }

  if (view === 'edit') {
    return (
      <div className="p-6">
        <TemplateForm
          initialData={editingTemplate}
          onSubmit={handleUpdate}
          onCancel={() => { setView('list'); setEditingTemplate(null); }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary">WhatsApp Templates</h1>
          <p className="text-gray-600 mt-1">Manage message templates with headers and variables</p>
        </div>
        <button
          onClick={() => setView('create')}
          className="px-6 py-2 bg-primary text-white rounded hover:bg-secondary flex items-center gap-2"
        >
          <span>+</span> Create Template
        </button>
      </div>

      <TemplatesList
        templates={templates}
        onEdit={(t) => { setEditingTemplate(t); setView('edit'); }}
        onDelete={handleDelete}
        onTest={setTestingTemplate}
        loading={loading}
      />

      {testingTemplate && (
        <TestTemplateModal template={testingTemplate} onClose={() => setTestingTemplate(null)} />
      )}
    </div>
  );
};

export default TemplatesManagementPage;