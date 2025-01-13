
import { Routes, Route } from 'react-router-dom';
import Profile from './Profile';
import Settings from './Settings';
import Home from './Home';
import logo from '../Images/logo.png'


const Main = () => {
    return(
        <main className=" relative flex-1 bg-gray-100 p-6 overflow-y-auto">
            <div className='absolute flex justify-center items-center w-full'>
            <img src={logo} alt="" className='h-[500px] opacity-30' />
            </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path='settings' element={<Settings />} />
          </Routes>
        
        </main>
    )
};

export default Main;