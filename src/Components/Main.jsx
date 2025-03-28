import AboutUs from './AboutUs.jsx';
import Home from './Home.jsx';
import Navbar from './Navbar.jsx';
import ContactForm from './ContactForm.jsx';
import OnlineLearning from './OnlineLearning.jsx';
import Courses from './Courses.jsx';
import Footer from './Footer.jsx';

const Main = () => {
    return(
        <>
        <Navbar />
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