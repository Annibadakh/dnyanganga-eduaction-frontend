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
    examTimeFrom: '',
    examTimeTo: ''
  });

  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [updateLoader, setUpdateLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/admin/getsubjects');
      const sortedSubjects = response.data.data.sort((a, b) => a.subjectCode - b.subjectCode);
      console.log(sortedSubjects);
      setSubjects(sortedSubjects);
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
    setSubmitLoader(true);
    try {
      await api.post('/admin/addSubject', formData);
      fetchSubjects();
      setFormData({
        subjectCode: '',
        subjectName: '',
        language: '',
        standard: '',
      });
      setFormError(null);
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding subject:', err);
      setFormError(err.response?.data?.message || 'Failed to add subject');
    }
    finally{
      setSubmitLoader(false);
    }
  };

  const deleteSubject = async (code) => {
    if (!window.confirm("Are you sure you want to delete subject ?")) return;
    setDeleteLoader(code);
    try {
      await api.delete(`/admin/deleteSubject/${code}`);
      fetchSubjects();
      alert("Subject deleted")
    } catch (err) {
      console.error('Error deleting subject:', err);
      alert('Failed to delete subject');
    }
    finally{
      setDeleteLoader(null);
    }
  };

  const openExamModal = (subject) => {
    const [from, to] = subject.examTime?.split('-') || ['', ''];
    setSelectedSubject(subject);
    setExamData({
      examDate: subject.examDate ? new Date(subject.examDate).toISOString().split('T')[0] : '',
      examTimeFrom: from,
      examTimeTo: to
    });
    setShowModal(true);
    setModalError(null);
  };

  const closeExamModal = () => {
    setShowModal(false);
    setSelectedSubject(null);
    setModalError(null);
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject) return;
    if (!examData.examDate || !examData.examTimeFrom || !examData.examTimeTo) {
      setModalError('All fields are required');
      return;
    }

    const updatedExamData = {
      examDate: examData.examDate,
      examTime: `${examData.examTimeFrom}-${examData.examTimeTo}`
    };
    setUpdateLoader(true);
    try {
      await api.put(`/admin/addDates/${selectedSubject.subjectCode}`, updatedExamData);
      fetchSubjects();
      closeExamModal();
    } catch (err) {
      console.error('Error updating exam details:', err);
      setModalError(err.response?.data?.message || 'Failed to update exam details');
    }
    finally{
      setUpdateLoader(false);
    }
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'Not set';
  const formatTime = (timeString) => timeString || 'Not set';

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-primary">Subject Management System</h1>

      {!showAddForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded shadow-custom"
          >
            Add Subject
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white p-6 rounded shadow-custom mb-6">
          <h2 className="text-xl font-semibold mb-4 text-secondary">Add New Subject</h2>
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubjectSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['subjectCode', 'subjectName', 'language', 'standard'].map((field, idx) => (
                <div key={idx}>
                  <label className="block mb-2 text-customblack capitalize" htmlFor={field}>
                    {field === 'subjectCode' ? 'Subject Code*' :
                      field === 'subjectName' ? 'Subject Name*' :
                      field === 'language' ? 'Language*' : 'Standard*'}
                  </label>
                  {field === 'standard' ? (
                    <select
                      id={field}
                      name={field}
                      value={formData[field]}
                      onChange={handleFormChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    >
                      <option value="">Select Standard</option>
                      <option value="10th">10th</option>
                      <option value="12th">12th</option>
                    </select>
                  ) : (
                    <input
                      type={field === 'subjectCode' ? 'number' : 'text'}
                      id={field}
                      name={field}
                      value={formData[field]}
                      onChange={handleFormChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                disabled={submitLoader}
                className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-black font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoader}
                className="bg-primary min-w-24 hover:bg-secondary disabled:opacity-50 text-white font-bold py-2 px-4 rounded grid place-items-center"
              >
                {submitLoader ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded shadow-custom">
        <h2 className="text-xl font-semibold mb-4 text-secondary">Subjects List</h2>
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : subjects.length === 0 ? (
          <p>No subjects found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-tertiary text-white">
                <tr>
                  <th className="px-4 py-2 border">Code</th>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Language</th>
                  <th className="px-4 py-2 border">Standard</th>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Time</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subject => (
                  <tr key={subject.subjectCode} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border">{subject.subjectCode}</td>
                    <td className="px-4 py-2 border">{subject.subjectName}</td>
                    <td className="px-4 py-2 border">{subject.language}</td>
                    <td className="px-4 py-2 border">{subject.standard}</td>
                    <td className="px-4 py-2 border">{formatDate(subject.examDate)}</td>
                    <td className="px-4 py-2 border">{formatTime(subject.examTime)}</td>
                    <td className="px-4 py-2 border gap-2 flex flex-row justify-center">
                      <button
                        onClick={() => openExamModal(subject)}
                        className="bg-green-500 hover:bg-green-700 text-white w-24 h-8 rounded text-sm"
                      >
                        {subject.examDate ? 'Update' : 'Add'} Exam
                      </button>
                      <button
                        onClick={() => deleteSubject(subject.subjectCode)}
                        disabled={deleteLoader == subject.subjectCode}
                        className="bg-red-500 hover:bg-red-700 disabled:opacity-50 text-white h-8 rounded text-sm min-w-16 flex items-center justify-center"
                      >
                        {deleteLoader == subject.subjectCode ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded shadow-custom w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-secondary">
              {selectedSubject.examDate ? 'Update Exam Details' : 'Add Exam Details'}
            </h2>
            <p className="mb-4"><strong>Subject:</strong> {selectedSubject.subjectName} ({selectedSubject.subjectCode})</p>
            {modalError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {modalError}
              </div>
            )}
            <form onSubmit={handleExamSubmit}>
              <div className="mb-4">
                <label htmlFor="examDate" className="block mb-2">Exam Date*</label>
                <input
                  type="date"
                  id="examDate"
                  name="examDate"
                  value={examData.examDate}
                  onChange={handleExamFormChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="examTimeFrom" className="block mb-2">From*</label>
                  <input
                    type="time"
                    id="examTimeFrom"
                    name="examTimeFrom"
                    value={examData.examTimeFrom}
                    onChange={handleExamFormChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="examTimeTo" className="block mb-2">To*</label>
                  <input
                    type="time"
                    id="examTimeTo"
                    name="examTimeTo"
                    value={examData.examTimeTo}
                    onChange={handleExamFormChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeExamModal}
                  disabled={updateLoader}
                  className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-black font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoader}
                  className="bg-primary min-w-20 hover:bg-secondary disabled:opacity-50 text-white font-bold py-2 px-4 rounded grid place-items-center"
                >
                  {updateLoader ? <span className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></span> : "Save"}
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
