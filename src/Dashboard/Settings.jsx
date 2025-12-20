import { useState, useEffect } from 'react';
import api from '../Api';

function Settings() {
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectName: '',
    language: 'English',
    standard: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  const [examData, setExamData] = useState({
    examDate: '',
    fromHour: '',
    fromMinute: '',
    fromPeriod: 'AM',
    toHour: '',
    toMinute: '',
    toPeriod: 'AM',
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
      setSubjects(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects');
    }
  };

  // Sort subjects by standard first, then alphabetically by subject name
  const getSortedSubjects = () => {
    const standardOrder = ['10th', '12th'];
    
    return [...subjects].sort((a, b) => {
      // First, sort by standard
      const standardIndexA = standardOrder.indexOf(a.standard);
      const standardIndexB = standardOrder.indexOf(b.standard);
      
      if (standardIndexA !== standardIndexB) {
        return standardIndexA - standardIndexB;
      }
      
      // If same standard, sort alphabetically by subject name
      // return a.subjectName.localeCompare(b.subjectName);
      return Number(a.subjectCode) - Number(b.subjectCode);
    });
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
      [name]: value,
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

    const parseTime = (timeStr = '') => {
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) return { hour: '1', minute: '00', period: 'AM' };
      return {
        hour: match[1].padStart(2, '0'),
        minute: match[2].padStart(2, '0'),
        period: match[3].toUpperCase(),
      };
    };

    const fromTime = parseTime(from);
    const toTime = parseTime(to);

    setSelectedSubject(subject);
    setExamData({
      examDate: subject.examDate ? new Date(subject.examDate).toISOString().split('T')[0] : '',
      fromHour: fromTime.hour,
      fromMinute: fromTime.minute,
      fromPeriod: fromTime.period,
      toHour: toTime.hour,
      toMinute: toTime.minute,
      toPeriod: toTime.period,
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

    const {
      examDate, fromHour, fromMinute, fromPeriod,
      toHour, toMinute, toPeriod
    } = examData;

    if (!examDate || !fromHour || !fromMinute || !fromPeriod || !toHour || !toMinute || !toPeriod) {
      setModalError('All fields are required');
      return;
    }

    const examTimeFrom = `${fromHour}:${fromMinute} ${fromPeriod}`;
    const examTimeTo = `${toHour}:${toMinute} ${toPeriod}`;
    
    const updatedExamData = {
      examDate,
      examTime: `${examTimeFrom}-${examTimeTo}`,
    };

    setUpdateLoader(true);
    try {
      await api.put(`/admin/addDates/${selectedSubject.subjectCode}`, updatedExamData);
      fetchSubjects();
      closeExamModal();
    } catch (err) {
      console.error('Error updating exam details:', err);
      setModalError(err.response?.data?.message || 'Failed to update exam details');
    } finally {
      setUpdateLoader(false);
    }
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-GB') : 'Not set';
  const formatTime = (timeString) => timeString || 'Not set';

  // Get sorted subjects for display
  const sortedSubjects = getSortedSubjects();

  // Group subjects by standard for merged display
  const groupSubjectsByStandard = () => {
    const grouped = {};
    sortedSubjects.forEach(subject => {
      if (!grouped[subject.standard]) {
        grouped[subject.standard] = [];
      }
      grouped[subject.standard].push(subject);
    });
    return grouped;
  };

  const groupedSubjects = groupSubjectsByStandard();
  const standardOrder = ['10th', '12th'];
  const orderedStandards = standardOrder.filter(std => groupedSubjects[std]);

  return (
    <div className="container mx-auto p-2">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">Subject Management</h1>

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
        <div className="bg-white md:p-6 p-2 rounded shadow-custom mb-6">
          <h2 className="text-xl font-semibold mb-4 text-secondary">Add New Subject</h2>
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubjectSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="subjectCode" className="block mb-2 text-customblack">Subject Code*</label>
                <input
                  type="number"
                  id="subjectCode"
                  name="subjectCode"
                  value={formData.subjectCode}
                  onChange={handleFormChange}
                  onWheel={(e) => e.target.blur()}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="subjectName" className="block mb-2 text-customblack">Subject Name*</label>
                <input
                  type="text"
                  id="subjectName"
                  name="subjectName"
                  value={formData.subjectName}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="language" className="block mb-2 text-customblack">Language*</label>
                <input
                  type="text"
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="standard" className="block mb-2 text-customblack">Standard*</label>
                <select
                  id="standard"
                  name="standard"
                  value={formData.standard}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-gray-300 rounded"
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
                {submitLoader ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white md:p-6 p-2 rounded shadow-custom">
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : subjects.length === 0 ? (
          <p>No subjects found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-center border-gray-300">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-4 py-2 whitespace-nowrap border">Standard</th>
                  <th className="px-4 py-2 whitespace-nowrap border">Subject Details</th>
                </tr>
              </thead>
              <tbody>
                {orderedStandards.map((standard, standardIndex) => (
                  <tr key={standard} className="text-center border-b hover:bg-gray-100 transition">
                    <td className="p-2 border font-semibold text-primary align-center">{standard}</td>
                    <td className="p-2 border">
                      <table className="w-full text-sm border border-gray-300">
                        <thead>
                          <tr className="bg-gray-300">
                            <th className="p-2 border">Code</th>
                            <th className="p-2 border">Subject Name</th>
                            <th className="p-2 border">Language</th>
                            <th className="p-2 border">Exam Date</th>
                            <th className="p-2 border">Exam Time</th>
                            <th className="p-2 border">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedSubjects[standard].map((subject) => (
                            <tr key={subject.subjectCode} className="hover:bg-gray-50">
                              <td className="p-2 border">{subject.subjectCode}</td>
                              <td className="p-2 border font-medium">{subject.subjectName}</td>
                              <td className="p-2 border">{subject.language}</td>
                              <td className="p-2 border">{formatDate(subject.examDate)}</td>
                              <td className="p-2 border">{formatTime(subject.examTime)}</td>
                              <td className="p-2 border">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => openExamModal(subject)}
                                    className="bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded text-sm"
                                  >
                                    {subject.examDate ? 'Update' : 'Add'}
                                  </button>
                                  <button
                                    onClick={() => deleteSubject(subject.subjectCode)}
                                    disabled={deleteLoader == subject.subjectCode}
                                    className="bg-red-500 hover:bg-red-700 disabled:opacity-50 text-white px-2 py-1 rounded text-sm min-w-12 flex items-center justify-center"
                                  >
                                    {deleteLoader == subject.subjectCode ? 
                                      <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span> : 
                                      "Delete"
                                    }
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
                  <label className="block mb-2">From*</label>
                  <div className="flex gap-2">
                    <select name="fromHour" value={examData.fromHour} onChange={handleExamFormChange} className="w-1/3 p-2 border rounded" required>
                      {[...Array(12)].map((_, i) => (
                        <option key={i+1} value={String(i+1).padStart(2, '0')}>{i+1}</option>
                      ))}
                    </select>
                    <select name="fromMinute" value={examData.fromMinute} onChange={handleExamFormChange} className="w-1/3 p-2 border rounded" required>
                      {[...Array(60)].map((_, i) => (
                        <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
                      ))}
                    </select>
                    <select name="fromPeriod" value={examData.fromPeriod} onChange={handleExamFormChange} className="w-1/3 p-2 border rounded">
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2">To*</label>
                  <div className="flex gap-2">
                    <select name="toHour" value={examData.toHour} onChange={handleExamFormChange} className="w-1/3 p-2 border rounded" required>
                      {[...Array(12)].map((_, i) => (
                        <option key={i+1} value={String(i+1).padStart(2, '0')}>{i+1}</option>
                      ))}
                    </select>
                    <select name="toMinute" value={examData.toMinute} onChange={handleExamFormChange} className="w-1/3 p-2 border rounded" required>
                      {[...Array(60)].map((_, i) => (
                        <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
                      ))}
                    </select>
                    <select name="toPeriod" value={examData.toPeriod} onChange={handleExamFormChange} className="w-1/3 p-2 border rounded">
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
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