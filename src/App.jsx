import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import { useState, useEffect } from 'react';
import axios from "axios";

import Login from "./Components/Login";
import HallTicket from "./Components/HallTicket";
import Result from "./Components/Result";

import Dashboard from "./Dashboard/Dashboard";
import Home from "./Dashboard/Home";
import Profile from "./Dashboard/Profile";
import Settings from "./Dashboard/Settings";
import VisitingForm from "./Dashboard/VisitingForm";
import VisitingTable from "./Dashboard/VisitingTable";
import RegistrationTable from "./Dashboard/RegistrationTable";
import RegistrationForm from "./Dashboard/RegistrationForm";
import AddUser from "./Dashboard/AddUser";
import AddCenter from "./Dashboard/AddCenter";
import PaymentTable from "./Dashboard/PaymentTable";

import Main from "./Pages/Main";
import About from "./Pages/About";
import Courses from "./Pages/Courses";
import Achievements from "./Pages/Achievements";
import ExamCenters from "./Pages/ExamCenters";

import LandingLayout from "./LandingLayout"; 
import { ProtectedRoute, ProtectedRoleBasedRoute } from './ProtectedRoute';
import Gallery from "./Pages/GalleryPage";
import PageNotFound from "./Pages/PageNotFound";
import InfoPage from "./Pages/InfoPage";

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
          {/* ❌ No Navbar & Footer here */}
          <Route path="login" element={<Login />} /> 
          {/* <Route path="hallticket" element={hallTicket ? <HallTicket /> : <h2>Hall Ticket not yet declared !!</h2>} />
          <Route path="result" element={resultDeclared ? <Result /> : <h2>Result not yet declared</h2>} /> */}
          <Route
            path="hallticket"
            element={hallTicket ? <HallTicket /> : <InfoPage type="hallticket" />}
          />
          <Route
            path="result"
            element={resultDeclared ? <Result /> : <InfoPage type="result" />}
          />
          {/* ✅ Landing Pages with Navbar + Footer */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={<Main />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/exam-centers" element={<ExamCenters />} />
            <Route path="/gallery" element={<Gallery />} />
          </Route>

          {/* ✅ Dashboard (Protected) */}
          <Route element={<ProtectedRoute />}>
            <Route path='dashboard' element={<Dashboard />}>
              <Route index element={<Home />} />
              <Route path="home" element={<Home />} />
              <Route path='profile' element={<Profile />} />
              
              <Route element={<ProtectedRoleBasedRoute allowedRoles={['counsellor', 'admin']} />}>
                <Route path='visitingtable' element={<VisitingTable />} />
                <Route path='registertable' element={<RegistrationTable />} />
                <Route path='paymenttable' element={<PaymentTable />} />
              </Route>
              
              <Route element={<ProtectedRoleBasedRoute allowedRoles={['counsellor']} />}>
                <Route path='register' element={<RegistrationForm />} />
                <Route path='visiting' element={<VisitingForm />} />
              </Route>
              
              <Route element={<ProtectedRoleBasedRoute allowedRoles={['admin']} />}>
                <Route path='user' element={<AddUser />} />
                <Route path='examcenter' element={<AddCenter />} />
              </Route>

              <Route path='settings' element={<Settings />} />
            </Route>
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App;
