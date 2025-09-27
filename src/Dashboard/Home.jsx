import { useState, useEffect } from 'react';
import api from '../Api';
import { useAuth } from '../Context/AuthContext';
import Excel from './Excel';

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
    <div className="bg-gray-100">
      {user.role === "admin" ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Admin Control Panel */}
          <div className="w-full lg:w-1/3 bg-white p-6 shadow-custom space-y-6">
            <h1 className="text-2xl font-bold text-primary text-center">Admin Controls</h1>

            {/* Hall Ticket Toggle */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Hall Ticket</span>
              <div className="grid place-items-center">
                {hallLoading ? (
                  <span className="animate-spin h-7 w-7 border-2 border-black border-t-transparent rounded-full"></span>
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
            </div>

            {/* Result Declared Toggle */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Result Declared</span>
              <div className="grid place-items-center">
                {resultLoading ? (
                  <span className="animate-spin h-7 w-7 border-2 border-black border-t-transparent rounded-full"></span>
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
            </div>
          </div>

          {/* Excel Export Panel */}
          <div className="w-full lg:w-2/3">
            <Excel />
          </div>
        </div>
      ) : (
        <h1 className="text-2xl font-semibold text-center text-gray-700">
          {user.role.toUpperCase()} DASHBOARD!
        </h1>
      )}
    </div>
  );
}
