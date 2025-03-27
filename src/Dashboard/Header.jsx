import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import logo from '../Images/logo4.png';

const Header = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className='flex justify-between gap-2 px-5 md:px-20 py-4 sm:py-1 items-center shadow-custom min-h-18 bg-white'>
            <div>
                <img src={logo} className='hidden sm:block h-16' alt="logo" />
            </div>
            
            <div>
                <h1 className='text-lg sm:text-2xl font-bold'>Dnyanganga Education Pvt. Ltd</h1>
            </div>
            
            <div>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
            </div>
        </nav>
    );
};

export default Header;
