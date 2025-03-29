// SubjectManagement.jsx
import { useState, useEffect } from 'react';
import api from '../Api';

function Settings() {
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectName: '',
    language: '',
    standard: '',
  });
  
  const [showModal, setShowModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [examData, setExamData] = useState({
    examDate: '',
    examTime: ''
  });
  
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/admin/getsubjects');
      console.log(response.data.data);
      setSubjects(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'subjectCode' ? parseInt(value, 10) || '' : value
    });
  };

  const handleExamFormChange = (e) => {
    const { name, value } = e.target;
    setExamData({
      ...examData,
      [name]: value
    });
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subjectCode || !formData.subjectName || !formData.language) {
      setFormError('All fields are required');
      return;
    }
    
    try {
      const response = await api.post('/admin/addSubject', formData);
      fetchSubjects();
      
      setFormData({
        subjectCode: '',
        subjectName: '',
        language: '',
        standard: '',
      });
      setFormError(null);
      setShowAddForm(false); // Close the form after successful submission
    } catch (err) {
      console.error('Error adding subject:', err);
      setFormError(err.response?.data?.message || 'Failed to add subject');
    }
  };

  const openExamModal = (subject) => {
    setSelectedSubject(subject);
    setExamData({
      examDate: subject.examDate ? new Date(subject.examDate).toISOString().split('T')[0] : '',
      examTime: subject.examTime ? subject.examTime.substring(0, 5) : ''
    });
    setShowModal(true);
    setModalError(null);
  };

  const closeExamModal = () => {
    setShowModal(false);
    setSelectedSubject(null);
    setModalError(null);
  };

  const openAddForm = () => {
    setShowAddForm(true);
    setFormError(null);
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setFormData({
      subjectCode: '',
      subjectName: '',
      language: '',
      standard: '',
    });
    setFormError(null);
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSubject) return;
    
    if (!examData.examDate || !examData.examTime) {
      setModalError('Both exam date and time are required');
      return;
    }
    
    try {
      await api.put(`/admin/addDates/${selectedSubject.subjectCode}`, examData);  
      fetchSubjects();
      
      closeExamModal();
    } catch (err) {
      console.error('Error updating exam details:', err);
      setModalError(err.response?.data?.message || 'Failed to update exam details');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not set';
    return timeString.substring(0, 5); 
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-primary">Subject Management System</h1>
  
      {/* Add Subject Button */}
      {!showAddForm && (
        <div className="mb-6">
          <button
            onClick={openAddForm}
            className="bg-primary hover:bg-secondary text-customwhite font-bold py-2 px-4 rounded shadow-custom"
          >
            Add Subject
          </button>
        </div>
      )}
  
      {/* Add Subject Form */}
      {showAddForm && (
        <div className="bg-customwhite p-6 rounded shadow-custom mb-6">
          <h2 className="text-xl font-semibold mb-4 text-secondary">Add New Subject</h2>
  
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {formError}
            </div>
          )}
  
          <form onSubmit={handleSubjectSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-customblack mb-2" htmlFor="subjectCode">
                  Subject Code*
                </label>
                <input
                  type="number"
                  id="subjectCode"
                  name="subjectCode"
                  value={formData.subjectCode}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-customgray rounded"
                  required
                />
              </div>
  
              <div>
                <label className="block text-customblack mb-2" htmlFor="subjectName">
                  Subject Name*
                </label>
                <input
                  type="text"
                  id="subjectName"
                  name="subjectName"
                  value={formData.subjectName}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-customgray rounded"
                  required
                />
              </div>
  
              <div>
                <label className="block text-customblack mb-2" htmlFor="language">
                  Language*
                </label>
                <input
                  type="text"
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-customgray rounded"
                  required
                />
              </div>
  
              <div>
                <label className="block text-customblack mb-2" htmlFor="standard">
                  Standard*
                </label>
                <select
                  id="standard"
                  name="standard"
                  value={formData.standard}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-customgray rounded"
                  required
                >
                  <option value="">Select Standard</option>
                  <option value="10th">10th</option>
                  <option value="12th">12th</option>
                </select>
              </div>
            </div>
  
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={closeAddForm}
                className="bg-fourthcolor hover:bg-gray-400 text-customblack font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-secondary text-customwhite font-bold py-2 px-4 rounded shadow-custom"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
  
      {/* Subjects Table */}
      <div className="bg-customwhite p-6 rounded shadow-custom">
        <h2 className="text-xl font-semibold mb-4 text-secondary">Subjects List</h2>
  
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : subjects.length === 0 ? (
          <p className="text-customblack">No subjects found. Add a subject to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-customwhite border border-customgray">
              <thead>
                <tr className="bg-tertiary text-customwhite">
                  <th className="px-4 py-2 border">Subject Code</th>
                  <th className="px-4 py-2 border">Subject Name</th>
                  <th className="px-4 py-2 border">Language</th>
                  <th className="px-4 py-2 border">Exam Date</th>
                  <th className="px-4 py-2 border">Exam Time</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.subjectCode} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border">{subject.subjectCode}</td>
                    <td className="px-4 py-2 border">{subject.subjectName}</td>
                    <td className="px-4 py-2 border">{subject.language}</td>
                    <td className="px-4 py-2 border">{formatDate(subject.examDate)}</td>
                    <td className="px-4 py-2 border">{formatTime(subject.examTime)}</td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => openExamModal(subject)}
                        className="bg-green-500 hover:bg-green-700 text-customwhite font-bold py-1 px-2 rounded text-sm shadow-custom"
                      >
                        {subject.examDate ? 'Update Exam' : 'Add Exam'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
  
      {/* Exam Details Modal */}
      {showModal && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-customwhite rounded-lg p-6 max-w-md w-full shadow-custom">
            <h2 className="text-xl font-semibold mb-4 text-secondary">
              {selectedSubject.examDate ? 'Update Exam Details' : 'Add Exam Details'}
            </h2>
            <p className="mb-4 text-customblack">
              <strong>Subject:</strong> {selectedSubject.subjectName} ({selectedSubject.subjectCode})
            </p>
  
            {modalError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {modalError}
              </div>
            )}
  
            <form onSubmit={handleExamSubmit}>
              <div className="mb-4">
                <label className="block text-customblack mb-2" htmlFor="examDate">
                  Exam Date*
                </label>
                <input
                  type="date"
                  id="examDate"
                  name="examDate"
                  value={examData.examDate}
                  onChange={handleExamFormChange}
                  className="w-full p-2 border border-customgray rounded"
                  required
                />
              </div>
  
              <div className="mb-4">
                <label className="block text-customblack mb-2" htmlFor="examTime">
                  Exam Time*
                </label>
                <input
                  type="time"
                  id="examTime"
                  name="examTime"
                  value={examData.examTime}
                  onChange={handleExamFormChange}
                  className="w-full p-2 border border-customgray rounded"
                  required
                />
              </div>
  
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeExamModal}
                  className="bg-fourthcolor hover:bg-gray-400 text-customblack font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-secondary text-customwhite font-bold py-2 px-4 rounded shadow-custom"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
  
  
}

export default Settings;