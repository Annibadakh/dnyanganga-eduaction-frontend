import { useState, useEffect } from 'react';
import api from '../Api';
import { useAuth } from '../Context/AuthContext';
import Excel from './Excel';
import StudentStatistics from './StudentStatistics';

export default function Home() {
  const { user } = useAuth();
  const [hallTicket, setHallTicket] = useState(false);
  const [resultDeclared, setResultDeclared] = useState(false);
  const [hallLoading, setHallLoading] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);
  

  const getFlag = () => {
    api.get('/admin/getSettingFlags')
      .then(res => {
        const data = res.data.data;
        const hallTicketFlag = data.find(flag => flag.flagName === 'HALLTICKET');
        const resultDeclaredFlag = data.find(flag => flag.flagName === 'RESULT');

        if (hallTicketFlag) setHallTicket(hallTicketFlag.flagValue === 'true');
        if (resultDeclaredFlag) setResultDeclared(resultDeclaredFlag.flagValue === 'true');
      })
      .catch(err => console.error('Error fetching flags', err));
  };


 

  useEffect(() => {
    setHallLoading(true);
    setResultLoading(true);
    getFlag();
    setHallLoading(false);
    setResultLoading(false);
  }, []);

 

  const toggleFlag = async (flagName, currentValue) => {
    if (flagName === "RESULT") setResultLoading(true);
    else if (flagName === "HALLTICKET") setHallLoading(true);

    try {
      await api.put(`/admin/updateSettingFlag/${flagName}`, {
        flagValue: (!currentValue).toString(),
      });
      getFlag();
    } catch (error) {
      console.error(`Error updating ${flagName}`, error);
    } finally {
      setHallLoading(false);
      setResultLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {user.role === 'admin' ? 'Admin Dashboard' : 'Counsellor Dashboard'}
          </h1>
          
        </div>

        
        {/* Admin Controls & Excel Export */}
        {user.role === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Admin Control Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Controls</h2>

              {/* Hall Ticket Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Hall Ticket</span>
                  {hallLoading ? (
                    <span className="animate-spin h-7 w-7 border-2 border-blue-600 border-t-transparent rounded-full"></span>
                  ) : (
                    <button
                      onClick={() => toggleFlag('HALLTICKET', hallTicket)}
                      className={`w-14 h-7 flex items-center rounded-full p-1 duration-300 ease-in-out ${
                        hallTicket ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${
                          hallTicket ? 'translate-x-7' : ''
                        }`}
                      ></div>
                    </button>
                  )}
                </div>
                {/* <p className="text-xs text-gray-500">
                  {hallTicket ? 'Hall tickets are visible to students' : 'Hall tickets are hidden from students'}
                </p> */}
              </div>

              {/* Result Declared Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Result Declared</span>
                  {resultLoading ? (
                    <span className="animate-spin h-7 w-7 border-2 border-blue-600 border-t-transparent rounded-full"></span>
                  ) : (
                    <button
                      onClick={() => toggleFlag('RESULT', resultDeclared)}
                      className={`w-14 h-7 flex items-center rounded-full p-1 duration-300 ease-in-out ${
                        resultDeclared ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${
                          resultDeclared ? 'translate-x-7' : ''
                        }`}
                      ></div>
                    </button>
                  )}
                </div>
                {/* <p className="text-xs text-gray-500">
                  {resultDeclared ? 'Results are visible to students' : 'Results are hidden from students'}
                </p> */}
              </div>
            </div>

            {/* Excel Export Panel */}
            <div className="lg:col-span-2">
              <Excel />
            </div>
          </div>
        )}

        {(user.role === 'admin' || user.role === 'counsellor') && (
          <StudentStatistics />
        )}

       
      </div>
    </div>
  );
}