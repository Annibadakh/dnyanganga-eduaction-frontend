import React, { useState, useEffect } from 'react';
import api from '../../Api';
import ExcelUploadJob from './ExcelUploadJob';

const JobCreation = () => {
  const [step, setStep] = useState(1); // 1: Select Template, 2: Select Source, 3: Filter/Upload, 4: Map Variables, 5: Schedule
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [dataSource, setDataSource] = useState(''); // 'students' or 'excel'
  
  // For Students source
  const [users, setUsers] = useState([]);
  const [examCentres, setExamCentres] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState('');
  const [selectedCounsellor, setSelectedCounsellor] = useState('');
  const [selectedExamCentre, setSelectedExamCentre] = useState('');
  const [selectedExamYear, setSelectedExamYear] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [onlyZeroRemaining, setOnlyZeroRemaining] = useState(false);
  const [onlyNonZeroRemaining, setOnlyNonZeroRemaining] = useState(false);
  
  // For Excel source
  const [excelData, setExcelData] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  
  // Preview & Mapping
  const [previewData, setPreviewData] = useState([]);
  const [variableMapping, setVariableMapping] = useState({});
  const [phoneMapping, setPhoneMapping] = useState(''); // For Excel phone number mapping
  
  // Job details
  const [jobName, setJobName] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  console.log('JobCreation render - step:', step, 'dataSource:', dataSource, 'excelData:', excelData.length);

  // Available fields for mapping (combined for both sources)
  const getAvailableFields = () => {
    if (dataSource === 'students') {
      return [
        { value: 'studentName', label: 'Student Name' },
        { value: 'studentNo', label: 'Student Phone' },
        { value: 'parentsNo', label: 'Parent Phone' },
        { value: 'standard', label: 'Standard' },
        { value: 'branch', label: 'Group/Medium' },
        { value: 'schoolCollege', label: 'School/College' },
        { value: 'amountPaid', label: 'Amount Paid' },
        { value: 'amountRemaining', label: 'Amount Remaining' },
        { value: 'dueDate', label: 'Due Date' },
        { value: 'address', label: 'Address' },
        { value: 'examYear', label: 'Exam Year' }
      ];
    } else {
      // For Excel, use column names
      return excelColumns.map(col => ({ value: col, label: col }));
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [templatesRes, usersRes, examCentresRes] = await Promise.all([
        api.get('/templates'),
        api.get('/admin/getUser'),
        api.get('/admin/getExamCenters')
      ]);

      if (templatesRes.data.success) {
        setTemplates(templatesRes.data.data);
      }

      const counsellors = usersRes.data.data.filter(u => u.role === 'counsellor');
      setUsers(counsellors);
      setExamCentres(examCentresRes.data.data);

    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setStep(2);
  };

  const handleSourceSelect = (source) => {
    console.log('Source selected:', source);
    setDataSource(source);
    setStep(3);
    console.log('Moving to step 3');
  };

  const handleExcelDataReady = (data, cols) => {
    setExcelData(data);
    setExcelColumns(cols);
    setPreviewData(data);
    
    // Initialize variable mapping
    if (selectedTemplate.variables_json && selectedTemplate.variables_json.length > 0) {
      const initialMapping = {};
      selectedTemplate.variables_json.forEach(v => {
        initialMapping[v.label] = '';
      });
      setVariableMapping(initialMapping);
    }
    
    setStep(4);
  };

  const handleExcelCancel = () => {
    setStep(2);
    setDataSource('');
  };

  const handlePreviewStudents = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.post('/jobs/preview-students', {
        standard: selectedStandard || null,
        counsellor: selectedCounsellor || null,
        examCentre: selectedExamCentre || null,
        examYear: selectedExamYear || null,
        fromDate: fromDate || null,
        toDate: toDate || null,
        onlyZeroRemaining,
        onlyNonZeroRemaining
      });

      if (response.data.success) {
        setPreviewData(response.data.data);
        
        if (response.data.count === 0) {
          setError('No students found with selected filters');
          return;
        }

        // Initialize variable mapping
        if (selectedTemplate.variables_json && selectedTemplate.variables_json.length > 0) {
          const initialMapping = {};
          selectedTemplate.variables_json.forEach(v => {
            initialMapping[v.label] = '';
          });
          setVariableMapping(initialMapping);
        }

        setStep(4);
      }

    } catch (err) {
      setError('Failed to preview students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVariableMappingChange = (variableLabel, fieldValue) => {
    setVariableMapping(prev => ({
      ...prev,
      [variableLabel]: fieldValue
    }));
  };

  const handleCreateJob = async () => {
    if (!jobName.trim()) {
      setError('Job name is required');
      return;
    }

    if (!scheduledDate) {
      setError('Scheduled date is required');
      return;
    }

    // For Excel source, validate phone mapping
    if (dataSource === 'excel' && !phoneMapping) {
      setError('Please select a phone number column');
      return;
    }

    // Validate all variables are mapped
    const unmappedVars = Object.entries(variableMapping).filter(([_, value]) => !value);
    if (unmappedVars.length > 0) {
      setError('Please map all template variables');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Prepare receivers data with phone mapping for Excel
      let receiversData = null;
      if (dataSource === 'excel') {
        receiversData = excelData.map(row => ({
          ...row,
          phone: row[phoneMapping] // Map the selected column to 'phone' field
        }));
      }

      const response = await api.post('/jobs', {
        template_id: selectedTemplate.id,
        job_name: jobName,
        scheduled_date: scheduledDate,
        filters: dataSource === 'students' ? {
          standard: selectedStandard || null,
          counsellor: selectedCounsellor || null,
          examCentre: selectedExamCentre || null,
          examYear: selectedExamYear || null,
          fromDate: fromDate || null,
          toDate: toDate || null,
          onlyZeroRemaining,
          onlyNonZeroRemaining
        } : null,
        receivers: receiversData,
        variable_mapping: variableMapping
      });

      if (response.data.success) {
        alert(`Job created successfully! Total ${response.data.data.total_records} messages scheduled.`);
        // Reset form
        setStep(1);
        setSelectedTemplate(null);
        setDataSource('');
        setJobName('');
        setScheduledDate('');
        setVariableMapping({});
        setPhoneMapping('');
        setPreviewData([]);
        setExcelData([]);
        setExcelColumns([]);
      }

    } catch (err) {
      setError('Failed to create job');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getExamYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -1; i < 5; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  return (
    <div className="p-6 bg-white shadow-custom max-w-7xl mx-auto">
      <h1 className="text-2xl mb-4 text-center font-bold text-secondary">Create WhatsApp Job</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          Loading...
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {s}
              </div>
              {s < 5 && <div className={`w-12 h-1 ${step > s ? 'bg-primary' : 'bg-gray-300'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 1: Select Template */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold text-primary mb-4">Step 1: Select Template</h2>
          
          {templates.length === 0 ? (
            <p className="text-gray-600">No templates available. Create a template first.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded p-4 hover:shadow-lg transition cursor-pointer"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <h3 className="font-semibold text-secondary mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{template.body}</p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {template.language.toUpperCase()}
                    </span>
                    {template.variables_json && template.variables_json.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {template.variables_json.length} vars
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Data Source */}
      {step === 2 && selectedTemplate && (
        <div>
          <h2 className="text-xl font-semibold text-primary mb-4">Step 2: Select Data Source</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <h3 className="font-semibold text-secondary mb-2">Selected Template: {selectedTemplate.name}</h3>
            <p className="text-sm text-gray-600">{selectedTemplate.body}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div
              onClick={() => handleSourceSelect('students')}
              className="border-2 border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary hover:bg-blue-50 transition"
            >
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-secondary mb-2">Students Database</h3>
              <p className="text-sm text-gray-600">
                Select students from your database using filters
              </p>
            </div>

            <div
              onClick={() => handleSourceSelect('excel')}
              className="border-2 border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary hover:bg-blue-50 transition"
            >
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-secondary mb-2">Upload Excel File</h3>
              <p className="text-sm text-gray-600">
                Upload an Excel file with recipient data
              </p>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="px-6 py-2 border border-gray-300 rounded text-black hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      )}

      {/* Step 3: Filter Students or Upload Excel */}
      {step === 3 && dataSource === 'students' && (
        <div>
          <h2 className="text-xl font-semibold text-primary mb-4">Step 3: Filter Students</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <h3 className="font-semibold text-secondary mb-2">Selected Template: {selectedTemplate.name}</h3>
            <p className="text-sm text-gray-600">{selectedTemplate.body}</p>
          </div>

          <div>
            <h3 className="font-semibold text-black mb-3">Filter Students</h3>
              
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <select
                value={selectedStandard}
                onChange={(e) => setSelectedStandard(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">All Standards</option>
                <option value="9th+10th">9th+10th</option>
                <option value="10th">10th</option>
                <option value="11th+12th">11th+12th</option>
                <option value="12th">12th</option>
              </select>

              <select
                value={selectedCounsellor}
                onChange={(e) => setSelectedCounsellor(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">All Counsellors</option>
                {users.map(u => (
                  <option key={u.uuid} value={u.uuid}>{u.name}</option>
                ))}
              </select>

              <select
                value={selectedExamCentre}
                onChange={(e) => setSelectedExamCentre(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">All Exam Centres</option>
                {examCentres.map(ec => (
                  <option key={ec.centerId} value={ec.centerId}>{ec.centerName}</option>
                ))}
              </select>

              <select
                value={selectedExamYear}
                onChange={(e) => setSelectedExamYear(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">All Exam Years</option>
                {getExamYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border p-2 rounded"
                placeholder="From Date"
              />

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border p-2 rounded"
                placeholder="To Date"
              />
            </div>

            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={onlyZeroRemaining}
                  onChange={(e) => {
                    setOnlyZeroRemaining(e.target.checked);
                    if (e.target.checked) setOnlyNonZeroRemaining(false);
                  }}
                />
                <span>Amount Remaining = 0</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={onlyNonZeroRemaining}
                  onChange={(e) => {
                    setOnlyNonZeroRemaining(e.target.checked);
                    if (e.target.checked) setOnlyZeroRemaining(false);
                  }}
                />
                <span>Amount Remaining != 0</span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-gray-300 rounded text-black hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handlePreviewStudents}
                className="px-6 py-2 bg-primary text-white rounded hover:bg-secondary"
                disabled={loading}
              >
                Preview Students
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Upload Excel */}
      {step === 3 && dataSource === 'excel' && (
        <ExcelUploadJob 
          onDataReady={handleExcelDataReady}
          onCancel={handleExcelCancel}
        />
      )}

      {/* Step 4: Map Variables */}
      {step === 4 && (
        <div>
          <h2 className="text-xl font-semibold text-primary mb-4">Step 4: Map Fields</h2>
          
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
            <p className="text-green-800">
              <strong>{previewData.length}</strong> {dataSource === 'students' ? 'students' : 'records'} found!
            </p>
          </div>

          {/* Phone Number Mapping (Excel only) - ALWAYS REQUIRED */}
          {dataSource === 'excel' && (
            <div className="border-2 border-red-300 rounded-lg p-4 mb-6 bg-red-50">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <span className="text-xl">📱</span>
                Phone Number Column *
                <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">REQUIRED</span>
              </h3>
              <p className="text-sm text-red-700 mb-3">
                Select the column that contains phone/mobile numbers of recipients. This is mandatory for sending messages.
              </p>
              <select
                value={phoneMapping}
                onChange={(e) => setPhoneMapping(e.target.value)}
                className={`border-2 p-3 w-full rounded-lg bg-white ${
                  !phoneMapping ? 'border-red-400' : 'border-green-400'
                }`}
              >
                <option value="">-- Select Phone Number Column --</option>
                {excelColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              {!phoneMapping && (
                <p className="text-xs text-red-600 mt-2">⚠ You must select a phone number column to proceed</p>
              )}
            </div>
          )}

          {/* Template Variables Mapping */}
          {selectedTemplate.variables_json && selectedTemplate.variables_json.length > 0 ? (
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Template Variables Mapping</h3>
              <p className="text-sm text-gray-600 mb-3">
                Map template variables to your data fields
              </p>
              {selectedTemplate.variables_json.map((variable) => (
                <div key={variable.index} className="border rounded p-4">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="bg-primary text-white px-3 py-1 rounded font-bold">
                      {'{{'}{variable.index}{'}}'}
                    </span>
                    <span className="font-semibold text-black">{variable.label}</span>
                  </div>
                  
                  <select
                    value={variableMapping[variable.label] || ''}
                    onChange={(e) => handleVariableMappingChange(variable.label, e.target.value)}
                    className="border p-2 w-full rounded"
                  >
                    <option value="">-- Select Field --</option>
                    {getAvailableFields().map(field => (
                      <option key={field.value} value={field.value}>{field.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
              <p className="text-gray-600">No template variables to map for this template.</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2 border border-gray-300 rounded text-black hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (dataSource === 'excel' && !phoneMapping) {
                  setError('Please select a phone number column');
                  return;
                }
                setError('');
                setStep(5);
              }}
              className={`px-6 py-2 rounded ${
                dataSource === 'excel' && !phoneMapping
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-secondary'
              }`}
              disabled={dataSource === 'excel' && !phoneMapping}
            >
              Next: Schedule Job
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Schedule & Create */}
      {step === 5 && (
        <div>
          <h2 className="text-xl font-semibold text-primary mb-4">Step 5: Schedule Job</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block mb-2">Job Name *</label>
              <input
                type="text"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                className="border p-2 w-full rounded"
                placeholder="e.g., Payment Reminder - January 2026"
              />
            </div>

            <div>
              <label className="block mb-2">Scheduled Date *</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="border p-2 w-full rounded"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-semibold text-secondary mb-2">Summary</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Template: <strong>{selectedTemplate.name}</strong></li>
                <li>Language: <strong>{selectedTemplate.language.toUpperCase()}</strong></li>
                <li>Source: <strong>{dataSource === 'students' ? 'Students Database' : 'Excel Upload'}</strong></li>
                {dataSource === 'excel' && phoneMapping && (
                  <li>Phone Column: <strong>{phoneMapping}</strong></li>
                )}
                <li>Recipients: <strong>{previewData.length} {dataSource === 'students' ? 'students' : 'records'}</strong></li>
                <li>Scheduled: <strong>{scheduledDate || 'Not set'}</strong></li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2 border border-gray-300 rounded text-black hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleCreateJob}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCreation;