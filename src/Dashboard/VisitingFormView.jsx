import React from "react";

const VisitingFormView = ({ visitData, onClose }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-2xl font-bold">Visiting Form Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">
                Personal Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Student Name:</span>
                  <p className="text-gray-900">{visitData.studentName || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Gender:</span>
                  <p className="text-gray-900">{visitData.gender || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Date of Birth:</span>
                  <p className="text-gray-900">
                    {visitData.dob ? formatDate(visitData.dob) : 'N/A'}
                  </p>
                </div>
                {/* <div>
                  <span className="font-medium text-gray-700">Mother's Name:</span>
                  <p className="text-gray-900">{visitData.motherName || 'N/A'}</p>
                </div> */}
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-900">{visitData.address || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Pincode:</span>
                  <p className="text-gray-900">{visitData.pincode || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Student Number:</span>
                  <p className="text-gray-900">{visitData.studentNo || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Parent Number:</span>
                  <p className="text-gray-900">{visitData.parentsNo || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Notification Number:</span>
                  <p className="text-gray-900">{visitData.notificationNo || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{visitData.email || 'N/A'}</p>
                </div>
                
              </div>
            </div>

            {/* Address Information */}
            {/* <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">
                Address Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-900">{visitData.address || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Pincode:</span>
                  <p className="text-gray-900">{visitData.pincode || 'N/A'}</p>
                </div>
              </div>
            </div> */}

            {/* Academic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">
                Academic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">School/College:</span>
                  <p className="text-gray-900">{visitData.schoolCollege || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Current Standard:</span>
                  <p className="text-gray-900">{visitData.standard || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Group/Medium:</span>
                  <p className="text-gray-900">{visitData.branch || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Previous Year:</span>
                  <p className="text-gray-900">{visitData.previousYear || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Previous Year Percentage:</span>
                  <p className="text-gray-900">
                    {visitData.previousYearPercent ? `${visitData.previousYearPercent}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Visit Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">
                Visit Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Demo Given:</span>
                  <p className="text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      visitData.demoGiven === 'YES' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {visitData.demoGiven || 'N/A'}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Reason:</span>
                  <p className="text-gray-900">{visitData.reason || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Counsellor:</span>
                  <p className="text-gray-900">{visitData.counsellor || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Counsellor Branch:</span>
                  <p className="text-gray-900">{visitData.counsellorBranch || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">
                System Information
              </h3>
              <div className="space-y-3">
                {/* <div>
                  <span className="font-medium text-gray-700">Visit ID:</span>
                  <p className="text-gray-900">{visitData.id || 'N/A'}</p>
                </div> */}
                <div>
                  <span className="font-medium text-gray-700">Created At:</span>
                  <p className="text-gray-900">
                    {visitData.createdAt ? formatDateTime(visitData.createdAt) : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Updated At:</span>
                  <p className="text-gray-900">
                    {visitData.updatedAt ? formatDateTime(visitData.updatedAt) : 'N/A'}
                  </p>
                </div>
                {/* <div>
                  <span className="font-medium text-gray-700">Created By:</span>
                  <p className="text-gray-900 text-sm font-mono">
                    {visitData.createdBy || 'N/A'}
                  </p>
                </div> */}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitingFormView;