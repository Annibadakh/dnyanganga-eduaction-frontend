import { useState, useEffect } from 'react';
import api from '../Api';
import { useAuth } from '../Context/AuthContext';

export default function Home() {
  const {user} = useAuth();
  console.log(user);
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
}

  useEffect(() => {
    setHallLoading(true);
    setResultLoading(true);
    getFlag();
    setHallLoading(false);
    setResultLoading(false);
  }, []);

  const toggleFlag = async (flagName, currentValue) => {
    if(flagName == "RESULT"){
      setResultLoading(true);
    }
    else if(flagName == "HALLTICKET"){
      setHallLoading(true);
    }
    try {
      const response = await api.put(`/admin/updateSettingFlag/${flagName}`, {
        flagValue: (!currentValue).toString(),
      });
      console.log(response);
      // setFn(!currentValue);
      getFlag();
    } catch (error) {
      console.error(`Error updating ${flagName}`, error);
    }
    finally{
      setHallLoading(false);
      setResultLoading(false);
    }
  };

  return (
    <div className=" bg-gray-100 flex justify-center">
      {user.role == "admin" ? (
        <div className="p-8 bg-white rounded-xl shadow-xl space-y-6 w-80">
        <h1 className="text-xl font-semibold text-center">Admin Controls</h1>

        {/* Hall Ticket Toggle */}
        
        <div className="flex items-center justify-between">
          <span className="font-medium">Hall Ticket</span>
          <div className='grid place-items-center'>
            {hallLoading ? <span className="animate-spin h-7 w-7 border-2 border-black border-t-transparent rounded-full"></span> : <button
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
          </button>}
          </div>
        </div>

        {/* Result Declared Toggle */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Result Declared</span>
              <div className='grid place-items-center'>
              {resultLoading ? <span className="animate-spin h-7 w-7 border-2 border-black border-t-transparent rounded-full"></span> : <button
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
          </button>}

              </div>
        </div>
      </div>
      ) : (
        <h1>{user.userName} welcome</h1>
      )}
    </div>
  );
}
