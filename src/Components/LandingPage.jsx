
import { Outlet } from "react-router-dom";
import Navbar from './Navbar.jsx';
import Footer from "./Footer.jsx";

const LandingPage = () => {
    return (
        <>
        <Navbar />
        <Outlet />
        <Footer />
        </>
    );

}

export default LandingPage;