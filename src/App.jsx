import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import { Navigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from "axios";

import Login from "./Components/Login";
import HallTicket from "./Components/HallTicket";
import Result from "./Components/Result";

import Dashboard from "./Dashboard/Dashboard";
import Home from "./Dashboard/Home";
import Profile from "./Dashboard/Profile";
import SubjectManagement from "./Dashboard/SubjectManagement";
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
import AddBookEntry from "./Dashboard/AddBookEntry";
import CounsellorBooks from "./Dashboard/CounsellorBooks";
import AdminCollection from "./Dashboard/AdminCollection";
import CounsellorCollection from "./Dashboard/CounsellorCollection";
import ChallanManagement from "./Dashboard/ChallanManagement";
import ExcelTableUploader from "./Dashboard/ExcelTableUploader";
import TemplatesManagementPage from "./Dashboard/WhatsApp/TemplatesManagementPage";
import JobCreation from "./Dashboard/WhatsApp/JobCreation";
import JobsList from "./Dashboard/WhatsApp/JobsList";
import BulkGenerateQR from "./BulkGenerateQR";
import MarksContextSelector from "./Dashboard/Result/MarksContextSelector";
import MarksExcelExport from "./Dashboard/Result/MarksExcelExport";

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
          <Route path="bulkqrcode" element={<BulkGenerateQR />} />
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
            <Route path="dashboard" element={<Dashboard />}>
              <Route index element={<Navigate to="home" replace />} />
              
              <Route path="home" element={<Home />} />
              <Route path='profile' element={<Profile />} />
              
              <Route element={<ProtectedRoleBasedRoute allowedRoles={['counsellor', 'admin']} />}>
                <Route path='paymenttable' element={<PaymentTable />} />
              </Route>

              <Route element={<ProtectedRoleBasedRoute allowedRoles={['counsellor', 'admin', 'logistics']} />}>
                <Route path='chalan' element={<ChallanManagement />} />
              </Route>

              <Route element={<ProtectedRoleBasedRoute allowedRoles={['counsellor', 'admin', "followUp"]} />}>
                <Route path='visitingtable' element={<VisitingTable />} />
                <Route path='registertable' element={<RegistrationTable />} />
              </Route>
              
              <Route element={<ProtectedRoleBasedRoute allowedRoles={['counsellor']} />}>
                <Route path='register' element={<RegistrationForm />} />
                <Route path='visiting' element={<VisitingForm />} />
                <Route path='bookdistribution' element={<CounsellorBooks />} />
                <Route path='settlement' element={<CounsellorCollection />} />
              </Route>
              
              <Route element={<ProtectedRoleBasedRoute allowedRoles={['admin']} />}>
                <Route path='user' element={<AddUser />} />
                <Route path='subject' element={<SubjectManagement />} />
                <Route path='examcenter' element={<AddCenter />} />
                <Route path='collection' element={<AdminCollection />} />
                <Route path='excelupload' element={<ExcelTableUploader />} />
                <Route path='template' element={<TemplatesManagementPage />} />
                <Route path='jobCreation' element={<JobCreation />} />
                <Route path="jobs" element={<JobsList />} />
                <Route path="marksentry" element={<MarksContextSelector />} />
                <Route path="marksexport" element={<MarksExcelExport />} />

                {/* <Route path='studentedit' element={<StudentEditPage />} /> */}
                {/* <Route path='hallticket' element={<BulkHallTicketGenerator />} /> */}


              </Route>
              <Route element={<ProtectedRoleBasedRoute allowedRoles={['admin', 'logistics']} />}>
                <Route path='bookentries' element={<AddBookEntry />} />
              </Route>

              
              

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
