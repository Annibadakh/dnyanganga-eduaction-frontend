import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'

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


function App() {

  return (
    
    <div className="font-custom">
      <BrowserRouter>
        <Routes>    
          <Route path='/' element={<Main />} />
          <Route path="login" element={<Login />} />
          <Route path="hallticket" element={<HallTicket />} />
          <Route element={<ProtectedRoute />}>
            <Route path='dashboard' element={<Dashboard />}>
              <Route path="" element={<Home />}/>
              <Route path="home" element={<Home />}/>
              <Route path='profile' element={<Profile />} />
              <Route element={<ProtectedRoleBasedRoute allowedRoles={['counsellor', 'admin']}/> } >
                <Route path='visitingtable' element={<VisitingTable /> } />
                <Route path='registertable' element={<RegistrationTable /> } />
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
