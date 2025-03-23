import { useState, useEffect } from 'react';
import api from '../Api';

export default function Home() {
  const [hallTicket, setHallTicket] = useState(false);
  const [resultDeclared, setResultDeclared] = useState(false);

  // Fetch initial state
  useEffect(() => {
    api.get('/admin/getSettingFlags')
      .then(res => {
        const data = res.data.data;
        const hallTicketFlag = data.find(flag => flag.flagName === 'HALLTICKET');
        const resultDeclaredFlag = data.find(flag => flag.flagName === 'RESULT');
  
        if (hallTicketFlag) setHallTicket(hallTicketFlag.flagValue === 'true');
        if (resultDeclaredFlag) setResultDeclared(resultDeclaredFlag.flagValue === 'true');
      })
      .catch(err => console.error('Error fetching flags', err));
  }, []);

  const toggleFlag = async (flagName, currentValue, setFn) => {
    try {
      await api.put(`/admin/updateSettingFlag/${flagName}`, {
        flagValue: (!currentValue).toString(),
      });
      setFn(!currentValue);
    } catch (error) {
      console.error(`Error updating ${flagName}`, error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="p-8 bg-white rounded-xl shadow-xl space-y-6 w-80">
        <h1 className="text-xl font-semibold text-center">Admin Controls</h1>

        {/* Hall Ticket Toggle */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Hall Ticket</span>
          <button
            onClick={() => toggleFlag('HALLTICKET', hallTicket, setHallTicket)}
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
        </div>

        {/* Result Declared Toggle */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Result Declared</span>
          <button
            onClick={() => toggleFlag('RESULT', resultDeclared, setResultDeclared)}
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
        </div>
      </div>
    </div>
  );
}
