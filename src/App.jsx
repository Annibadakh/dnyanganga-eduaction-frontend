import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import { useState, useEffect } from 'react';
import Main from './Components/Main';
import Login from "./Components/Login";
import HallTicket from "./Components/HallTicket";
import Home from "./Dashboard/Home";
import Dashboard from "./Dashboard/Dashboard";
import Profile from "./Dashboard/Profile";
import Settings from "./Dashboard/Settings";
import {ProtectedRoute, ProtectedRoleBasedRoute} from './ProtectedRoute';
import VisitingForm from "./Dashboard/VisitingForm";
import VisitingTable from "./Dashboard/VisitingTable";
import RegistrationTable from "./Dashboard/RegistrationTable";
import RegistrationForm from "./Dashboard/RegistrationForm";
import AddUser from "./Dashboard/AddUser";
import AddCenter from "./Dashboard/AddCenter";
import PaymentTable from "./Dashboard/PaymentTable";
import Result from "./Components/Result";
import axios from "axios";
import CoursesPage from "./Components/CoursesPage";
import AchievementPage from "./Components/AchievementPage";
import LandingPage from "./Components/LandingPage";

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [hallTicket, setHallTicket] = useState(false);
  const [resultDeclared, setResultDeclared] = useState(false);
  useEffect(() => {
    axios.get(`${apiUrl}/admin/getSettingFlags`)
      .then(res => {
        const data = res.data.data;
        const hallTicketFlag = data.find(flag => flag.flagName === 'HALLTICKET');
        const resultDeclaredFlag = data.find(flag => flag.flagName === 'RESULT');
        if (hallTicketFlag) setHallTicket(hallTicketFlag.flagValue === 'true');
        if (resultDeclaredFlag) setResultDeclared(resultDeclaredFlag.flagValue === 'true');
      })
      .catch(err => console.error('Error fetching flags', err));
  }, []);
  return (
    
    <div className="font-custom">
      <BrowserRouter>
        <Routes>
          <Route path="login" element={<Login />} /> 
          <Route path="hallticket" element={hallTicket ? <HallTicket /> : <h2>Hall Ticket not yet declare !!</h2>} />
          <Route path="result" element={resultDeclared ? <Result /> : <h2>Result not yet declare</h2>} />   
          <Route path='/' element={<LandingPage />}>
            <Route path="" element={<Main />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="achievement" element={<AchievementPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path='dashboard' element={<Dashboard />}>
              <Route path="" element={<Home />}/>
              <Route path="home" element={<Home />}/>
              <Route path='profile' element={<Profile />} />
              <Route element={<ProtectedRoleBasedRoute allowedRoles={['counsellor', 'admin']}/> } >
                <Route path='visitingtable' element={<VisitingTable /> } />
                <Route path='registertable' element={<RegistrationTable /> } />
                <Route path='paymenttable' element={<PaymentTable /> } />

              </Route>
              <Route element={<ProtectedRoleBasedRoute allowedRoles={['counsellor']}/> } >
                <Route path='register' element={<RegistrationForm />} />
                <Route path='visiting' element={<VisitingForm /> } />
              </Route>
              <Route element={<ProtectedRoleBasedRoute allowedRoles={['admin']}/> } >
                <Route path='user' element={<AddUser />} />
                <Route path='examcenter' element={<AddCenter />} />
              </Route>
              <Route path='settings' element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App;
