import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { DashboardProvider } from "./Context/DashboardContext";
import { useAuth } from "./Context/AuthContext";
import {
  ProtectedRoute,
  ProtectedRoleBasedRoute,
  StudentProtectedRoute,
} from "./ProtectedRoute";

import "./App.css";

import Loader from "./Pages/Loader";
import LandingLayout from "./LandingLayout";
import Main from "./Pages/Main";
import Login from "./Components/Login";
import Quizz from "./Dashboard/Quizz";
import CounsellorReport from "./Dashboard/CounsellorReport";
import StudentLogin from "./Components/StudentLogin";
import StudentQuizPlay from "./Dashboard/Student/StudentQuizPlay";
import StudentAllQuizzes from "./Dashboard/Student/StudentAllQuizzes";
import StudentQuizView from "./Dashboard/Student/StudentQuizView";
import StudentQuizResult from "./Dashboard/Student/StudentQuizResult";
import StudentQuizzDashboard from "./Dashboard/Student/StudentQuizzDashboard";
import ChapterManager from "./Dashboard/QuestionBank/ChapterManager";
import StudentSubjects from "./Dashboard/Student/QuestionBank/StudentSubjects";
import StudentChapters from "./Dashboard/Student/QuestionBank/StudentChapters";
import StudentQuestions from "./Dashboard/Student/QuestionBank/StudentQuestions";
import {
  counsellorLikeRoles,
  paymentTableAccess,
  reportAccess,
  challanAccess,
  registrationTableAccess,
  adminControlsAccess,
  userManageAccess,
  marksAccess,
  questionBankManageAccess,
  quizManageAccess,
  bookEntryAccess,
  caAccess,
} from "./utils/roleArrays";

// Landing
const About = lazy(() => import("./Pages/About"));
const Courses = lazy(() => import("./Pages/Courses"));
const Achievements = lazy(() => import("./Pages/Achievements"));
const ExamCenters = lazy(() => import("./Pages/ExamCenters"));
const Gallery = lazy(() => import("./Pages/GalleryPage"));
const ContactUs = lazy(() => import("./Pages/ContactUs"));
const InfoPage = lazy(() => import("./Pages/InfoPage"));

// Public
const HallTicket = lazy(() => import("./Components/HallTicket"));
const Result = lazy(() => import("./Components/Result"));
const SeprateResult = lazy(() => import("./Components/SeprateResult"));

// Dashboard Layout
const Dashboard = lazy(() => import("./Dashboard/Layout/Dashboard"));
const Home = lazy(() => import("./Dashboard/Home/Home"));
const Profile = lazy(() => import("./Dashboard/Layout/Profile"));

// Admin
const StandardSubjectManagement = lazy(
  () => import("./Dashboard/AdminControls/StandardSubjectManagement"),
);
const GSTReceiptManagement = lazy(
  () => import("./Dashboard/AdminControls/GSTReceiptManagement"),
);
const StandardReceiptBills = lazy(
  () => import("./Dashboard/AdminControls/StandardReceiptBills"),
);
const AddUser = lazy(() => import("./Dashboard/AdminControls/AddUser"));
const AddCenter = lazy(() => import("./Dashboard/AdminControls/AddCenter"));
const AdminCollection = lazy(
  () => import("./Dashboard/Collection/AdminCollection"),
);
const TemplatesManagementPage = lazy(
  () => import("./Dashboard/WhatsApp/TemplatesManagementPage"),
);
const JobCreation = lazy(() => import("./Dashboard/WhatsApp/JobCreation"));
const JobsList = lazy(() => import("./Dashboard/WhatsApp/JobsList"));
const MarksContextSelector = lazy(
  () => import("./Dashboard/Result/MarksContextSelector"),
);

// Counsellor & Shared
const RegistrationTable = lazy(
  () => import("./Dashboard/Registration/RegistrationTable"),
);
const RegistrationForm = lazy(
  () => import("./Dashboard/Registration/RegistrationForm"),
);
const PaymentTable = lazy(() => import("./Dashboard/Payment/PaymentTable"));
const VisitingForm = lazy(() => import("./Dashboard/Visiting/VisitingForm"));
const VisitingTable = lazy(() => import("./Dashboard/Visiting/VisitingTable"));
const ChallanManagement = lazy(
  () => import("./Dashboard/Books/ChallanManagement"),
);
const AddBookEntry = lazy(() => import("./Dashboard/Books/AddBookEntry"));
const CounsellorBooks = lazy(() => import("./Dashboard/Books/CounsellorBooks"));
const CounsellorCollection = lazy(
  () => import("./Dashboard/Collection/CounsellorCollection"),
);

// CA
const CaStudents = lazy(() => import("./Dashboard/CA/CaStudents"));

////// student dashboard

const PageNotFound = lazy(() => import("./Pages/PageNotFound"));

// Send each role to its own landing page after login
const DashboardIndexRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user?.role === "ca" ? "ca-students" : "home"} replace />;
};

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [hallTicket, setHallTicket] = useState(false);
  const [resultDeclared, setResultDeclared] = useState(false);

  useEffect(() => {
    axios
      .get(`${apiUrl}/admin/getSettingFlags`)
      .then((res) => {
        const data = res.data.data;
        const hallTicketFlag = data.find(
          (flag) => flag.flagName === "HALLTICKET",
        );
        const resultDeclaredFlag = data.find(
          (flag) => flag.flagName === "RESULT",
        );

        if (hallTicketFlag) setHallTicket(hallTicketFlag.flagValue === "true");
        if (resultDeclaredFlag)
          setResultDeclared(resultDeclaredFlag.flagValue === "true");
      })
      .catch((err) => console.error("Error fetching flags", err));
  }, [apiUrl]);

  return (
    <div className="font-custom">
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        pauseOnHover
        toastClassName="!bg-customwhite text-customblack shadow-medium rounded-xl"
        bodyClassName="text-sm text-customblack font-medium"
      />

      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="login" element={<Login />} />
            <Route path="student-login" element={<StudentLogin />} />

            <Route
              path="hallticket"
              element={
                hallTicket ? <HallTicket /> : <InfoPage type="hallticket" />
              }
            />

            <Route
              path="result"
              element={resultDeclared ? <Result /> : <InfoPage type="result" />}
            />

            <Route
              path="seprate-result"
              element={
                resultDeclared ? <SeprateResult /> : <InfoPage type="result" />
              }
            />

            {/* Landing Layout */}
            <Route element={<LandingLayout />}>
              <Route path="/" element={<Main />} />
              <Route path="/about" element={<About />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/exam-centers" element={<ExamCenters />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact-us" element={<ContactUs />} />
            </Route>

            {/* Protected Dashboard */}
            <Route
              element={
                <DashboardProvider>
                  <ProtectedRoute />
                </DashboardProvider>
              }
            >
              <Route path="dashboard" element={<Dashboard />}>
                <Route index element={<DashboardIndexRedirect />} />

                <Route path="home" element={<Home />} />
                <Route path="profile" element={<Profile />} />

                <Route
                  element={
                    <ProtectedRoleBasedRoute allowedRoles={caAccess} />
                  }
                >
                  <Route path="ca-students" element={<CaStudents />} />
                </Route>

                <Route
                  element={
                    <ProtectedRoleBasedRoute
                      allowedRoles={paymentTableAccess}
                    />
                  }
                >
                  <Route path="paymenttable" element={<PaymentTable />} />
                  <Route path="report" element={<CounsellorReport />} />
                </Route>

                <Route
                  element={
                    <ProtectedRoleBasedRoute
                      allowedRoles={challanAccess}
                    />
                  }
                >
                  <Route path="chalan" element={<ChallanManagement />} />
                </Route>

                <Route
                  element={
                    <ProtectedRoleBasedRoute
                      allowedRoles={registrationTableAccess}
                    />
                  }
                >
                  <Route path="visitingtable" element={<VisitingTable />} />
                  <Route path="registertable" element={<RegistrationTable />} />
                </Route>

                <Route
                  element={
                    <ProtectedRoleBasedRoute allowedRoles={counsellorLikeRoles} />
                  }
                >
                  <Route path="register" element={<RegistrationForm />} />
                  <Route path="visiting" element={<VisitingForm />} />
                  <Route
                    path="bookdistribution"
                    element={<CounsellorBooks />}
                  />
                  <Route path="settlement" element={<CounsellorCollection />} />
                </Route>

                <Route
                  element={
                    <ProtectedRoleBasedRoute allowedRoles={adminControlsAccess} />
                  }
                >
                  <Route
                    path="standards"
                    element={<StandardSubjectManagement />}
                  />
                  <Route
                    path="standards/:id/receipt-bills"
                    element={<StandardReceiptBills />}
                  />
                  <Route
                    path="gst-receipt"
                    element={<GSTReceiptManagement />}
                  />
                  <Route path="examcenter" element={<AddCenter />} />
                  <Route path="collection" element={<AdminCollection />} />
                  <Route
                    path="template"
                    element={<TemplatesManagementPage />}
                  />
                  <Route path="jobCreation" element={<JobCreation />} />
                  <Route path="jobs" element={<JobsList />} />
                </Route>

                <Route
                  element={
                    <ProtectedRoleBasedRoute allowedRoles={userManageAccess} />
                  }
                >
                  <Route path="user" element={<AddUser />} />
                </Route>

                <Route
                  element={
                    <ProtectedRoleBasedRoute allowedRoles={marksAccess} />
                  }
                >
                  <Route path="marksentry" element={<MarksContextSelector />} />
                </Route>

                <Route
                  element={
                    <ProtectedRoleBasedRoute
                      allowedRoles={questionBankManageAccess}
                    />
                  }
                >
                  <Route path="question-bank" element={<ChapterManager />} />
                </Route>

                <Route
                  element={
                    <ProtectedRoleBasedRoute allowedRoles={quizManageAccess} />
                  }
                >
                  <Route path="quizz/*" element={<Quizz />} />
                </Route>

                <Route
                  element={
                    <ProtectedRoleBasedRoute
                      allowedRoles={bookEntryAccess}
                    />
                  }
                >
                  <Route path="bookentries" element={<AddBookEntry />} />
                </Route>
              </Route>
            </Route>

            <Route path="student" element={<StudentProtectedRoute />}>
              <Route element={<Dashboard />}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<StudentQuizzDashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="question-bank" element={<StudentSubjects />} />
                <Route path="question-bank/:subjectId" element={<StudentChapters />} />
                <Route path="question-bank/:subjectId/:chapterId" element={<StudentQuestions />} />
                <Route path="quizzes" element={<StudentAllQuizzes />} />
                <Route path="view-quiz/:quizId" element={<StudentQuizView />} />
                <Route
                  path="result/:studentQuizId"
                  element={<StudentQuizResult />}
                />
              </Route>
              <Route path="play/:quizId" element={<StudentQuizPlay />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
