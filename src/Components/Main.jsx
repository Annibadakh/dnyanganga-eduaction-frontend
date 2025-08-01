import AboutUs from './AboutUs.jsx';
import Home from './Home.jsx';

import ContactForm from './ContactForm.jsx';
import OnlineLearning from './OnlineLearning.jsx';
import Courses from './Courses.jsx';
import Footer from './Footer.jsx';
import { Outlet } from "react-router-dom";


const Main = () => {
    return(
        <>
        <Home />
        <AboutUs />
        <OnlineLearning/>
        <Courses/>
        <ContactForm/>
        <Footer/>
        </>
    )
};

export default Main;