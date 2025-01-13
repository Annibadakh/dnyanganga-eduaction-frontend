import React from "react";

import logo from '../Images/logo2.png'
const Header = ({ toggleSidebar }) => {
    return(
        <nav className='flex justify-between px-20 items-center shadow-custom min-h-18 bg-tertiary'>
            <div>
                <img src={logo} className='h-16' alt="logo" />
            </div>
            <button
                className="text-white bg-primary px-4 py-2 rounded"
                onClick={toggleSidebar}
            >
                ☰
            </button>
            <div>
                <h1 className='text-2xl font-bold'>Dnyanganga Education Pvt. Ltd</h1>
            </div>
            <div>
                <button>Logout</button>
            </div>
        </nav>
    )
};

export default Header;