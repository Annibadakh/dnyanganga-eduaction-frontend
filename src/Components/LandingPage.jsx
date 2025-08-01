
import { Outlet } from "react-router-dom";
import Navbar from './Navbar.jsx';

const LandingPage = () => {
    return (
        <>
        <Navbar />
        <Outlet />
        </>
    );

}

export default LandingPage;