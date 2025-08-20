import Hero from './Hero.jsx';
import AboutPreview from './AboutPreview.jsx';
import CoursesSection from './CoursesSection.jsx';
import AchievementsPreview from './AchievementsPreview.jsx';
import StatisticsSection from './StatisticsSection.jsx';
import TestimonialsSection from './TestimonialsSection.jsx';
import ExamCentersPreview from './ExamCentersPreview.jsx';
import Gallery from './Gallery.jsx';
import EnquiryForm from './EnquiryForm.jsx';


const Main = () => {
    return(
        <>
        <Hero />
        <AboutPreview />
        <CoursesSection />
        <AchievementsPreview />
        <StatisticsSection />
        <TestimonialsSection />
        <ExamCentersPreview />
        <Gallery />
        <EnquiryForm />
        </>
    )
};

export default Main;