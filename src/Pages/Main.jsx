import AboutPreview from "../Components/AboutPreview";
import AchievementsPreview from "../Components/AchievementsPreview";
import CoursesSection from "../Components/CoursesSection";
import EnquiryForm from "../Components/EnquiryForm";
import ExamCentersPreview from "../Components/ExamCentersPreview";
import Gallery from "../Components/Gallery";
import Hero from "../Components/Hero";
import StatisticsSection from "../Components/StatisticsSection";
import TestimonialsSection from "../Components/TestimonialsSection";


const Home = () => {
  return (
    <div>
      <Hero />
      <AboutPreview />
      <CoursesSection />
      <AchievementsPreview />
      <StatisticsSection />
      <TestimonialsSection />
      <ExamCentersPreview />
      <Gallery />
      <EnquiryForm />
    </div>
  );
};

export default Home;