import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import { Navigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from "axios";
import { DashboardProvider } from "./Context/DashboardContext";

import LandingLayout from "./LandingLayout";
import Main from "./Pages/Main";
import About from "./Pages/About";
import Courses from "./Pages/Courses";
import Achievements from "./Pages/Achievements";
import ExamCenters from "./Pages/ExamCenters";
import Gallery from "./Pages/GalleryPage";
import ContactUs from "./Pages/ContactUs";

import Login from "./Components/Login";
import HallTicket from "./Components/HallTicket";
import Result from "./Components/Result";
import SeprateResult from "./Components/SeprateResult";
import InfoPage from "./Pages/InfoPage";

import Dashboard from "./Dashboard/Layout/Dashboard";
import Home from "./Dashboard/Home/Home";
import Profile from "./Dashboard/Layout/Profile";

import SubjectManagement from "./Dashboard/AdminControls/SubjectManagement";
import AddUser from "./Dashboard/AdminControls/AddUser";
import AddCenter from "./Dashboard/AdminControls/AddCenter";

import VisitingForm from "./Dashboard/Visiting/VisitingForm";
import VisitingTable from "./Dashboard/Visiting/VisitingTable";


import RegistrationTable from "./Dashboard/Registration/RegistrationTable";
import RegistrationForm from "./Dashboard/Registration/RegistrationForm";

import PaymentTable from "./Dashboard/Payment/PaymentTable";

import ChallanManagement from "./Dashboard/Books/ChallanManagement";
import AddBookEntry from "./Dashboard/Books/AddBookEntry";
import CounsellorBooks from "./Dashboard/Books/CounsellorBooks";

import AdminCollection from "./Dashboard/Collection/AdminCollection";
import CounsellorCollection from "./Dashboard/Collection/CounsellorCollection";

import TemplatesManagementPage from "./Dashboard/WhatsApp/TemplatesManagementPage";
import JobCreation from "./Dashboard/WhatsApp/JobCreation";
import JobsList from "./Dashboard/WhatsApp/JobsList";

import MarksContextSelector from "./Dashboard/Result/MarksContextSelector";

import { ProtectedRoute, ProtectedRoleBasedRoute } from './ProtectedRoute';
import PageNotFound from "./Pages/PageNotFound";
import BulkGenerateQR from "./BulkGenerateQR";

import { ToastContainer } from 'react-toastify';

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
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="!bg-customwhite text-customblack shadow-medium rounded-xl"
        bodyClassName="text-sm text-customblack font-medium"
      />
      <BrowserRouter>
        <Routes>
          <Route path="login" element={<Login />} />
          {/* <Route path="bulkqrcode" element={<BulkGenerateQR />} /> */}
          <Route
            path="hallticket"
            element={hallTicket ? <HallTicket /> : <InfoPage type="hallticket" />}
          />
          <Route
            path="result"
            element={resultDeclared ? <Result /> : <InfoPage type="result" />}
          />
          <Route
            path="seprate-result"
            element={resultDeclared ? <SeprateResult /> : <InfoPage type="result" />}
          />

          <Route element={<LandingLayout />}>
            <Route path="/" element={<Main />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/exam-centers" element={<ExamCenters />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact-us" element={<ContactUs />} />
          </Route>

          {/* ✅ Dashboard (Protected) */}
          <Route element={<DashboardProvider><ProtectedRoute /></DashboardProvider>}>
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
                <Route path='template' element={<TemplatesManagementPage />} />
                <Route path='jobCreation' element={<JobCreation />} />
                <Route path="jobs" element={<JobsList />} />
                <Route path="marksentry" element={<MarksContextSelector />} />


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
