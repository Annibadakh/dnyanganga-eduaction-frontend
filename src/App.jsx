import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'

import Main from './Components/Main';
import Login from "./Components/Login";
import Home from "./Dashboard/Home";
import Dashboard from "./Dashboard/Dashboard";
import Profile from "./Dashboard/Profile";
import Settings from "./Dashboard/Settings";
import {ProtectedRoute, ProtectedRoleBasedRoute} from './ProtectedRoute';
import VisitingForm from "./Dashboard/VisitingForm";
import RegistrationForm from "./Dashboard/RegistrationForm";


function App() {

  return (
    
    <div className="font-custom">
      <BrowserRouter>
        <Routes>    
          <Route path='/' element={<Main />} />
          <Route path="login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path='dashboard' element={<Dashboard />}>
              <Route path="" element={<Home />}/>
              <Route path="home" element={<Home />}/>
              <Route path='profile' element={<Profile />} />
              <Route element={<ProtectedRoleBasedRoute allowedRoles='counsellor'/> } >
                <Route path='register' element={<RegistrationForm />} />
                <Route path='visiting' element={<VisitingForm /> } />
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
