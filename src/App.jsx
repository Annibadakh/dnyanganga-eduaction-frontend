import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Dashboard from './Dashboard/Dashboard';
import Profile from './Dashboard/Profile';
import Settings from './Dashboard/Settings';
import Home from './Dashboard/Home';
import Main from './Components/Main';


function App() {

  return (
    <div className="font-custom">
      <BrowserRouter>
        <Routes>    
          <Route path='/' element={<Main />} />
          <Route path='dashboard ' element={<Dashboard />}>
            <Route path="home" element={<Main />}/>
            <Route path="profile" element={<Main />} />
            <Route path='settings' element={<Main />} />
          </Route>
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
