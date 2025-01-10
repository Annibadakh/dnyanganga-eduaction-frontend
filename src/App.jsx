import { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.css'
import Navbar from './Components/Navbar';
import Dashboard from './Dashboard/Dashboard';
import Profile from './Dashboard/Profile';
import Settings from './Dashboard/Settings';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      
      
      <BrowserRouter>
        <Routes>
          
          <Route path='/' element={<Navbar />} />
          <Route path='dashboard' element={<Dashboard />}>
            <Route path="profile" element={<Profile />} />
            <Route path='settings' element={<Settings />} />
          </Route>
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
