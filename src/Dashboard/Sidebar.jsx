import { Outlet, Link } from "react-router-dom";
import logo from '../Images/logo.png'
const Sidebar = () => {
    return(
        <>
        <nav className="px-4">
            <div>
                <img src={logo} alt="logo" className="h-24" />
            </div>
            <div className="flex flex-col">
            <Link to="profile">Profile</Link>
            <Link to="settings">Settings</Link>
            </div>
        </nav>
        <Outlet />
        </>
    )
};

export default Sidebar;