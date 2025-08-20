import React, { useState } from 'react';
import { BookOpen, Clock, Award, Users, CheckCircle, Download } from 'lucide-react';

const Courses = () => {
  const [activeTab, setActiveTab] = useState('10th');

  const coursesData = {
    '10th': {
      title: 'Class 10th Mock Board Exam Program',
      subtitle: 'Comprehensive SSC Board Exam Preparation',
      duration: '8 Months Program',
      tests: '12 Mock Examinations',
      description:
        'Our Class 10th program is meticulously designed to prepare students for their SSC board examinations through comprehensive mock tests, detailed performance analysis, and expert guidance.',

      subjects: [
        { name: 'Mathematics', topics: 'Algebra, Geometry, Trigonometry, Statistics' },
        { name: 'Science & Technology', topics: 'Physics, Chemistry, Biology' },
        { name: 'Social Studies', topics: 'History, Geography, Civics, Economics' },
        { name: 'English', topics: 'Grammar, Literature, Composition' },
        { name: 'Hindi/Marathi', topics: 'Grammar, Literature, Essay Writing' },
      ],

      features: [
        'Complete syllabus coverage as per latest Maharashtra State Board pattern',
        'Monthly mock examinations with board-level difficulty',
        'Detailed answer sheets evaluation and feedback',
        'Subject-wise performance analysis and improvement suggestions',
        'Expert doubt resolution sessions every week',
        'Study material including question banks and practice papers',
        'Time management and exam strategy workshops',
        'Parent-teacher meetings for progress discussions',
      ],

      benefits: [
        'Build confidence through regular practice',
        'Identify and improve weak areas early',
        'Get familiar with board exam pattern and marking scheme',
        'Develop effective time management skills',
        'Reduce exam anxiety through repeated exposure',
        'Improve answer writing techniques',
      ],

      studyMaterial: [
        'Comprehensive question banks for all subjects',
        'Previous 10 years solved board papers',
        'Chapter-wise practice tests',
        'Quick revision notes and formulas',
        'Model answer papers for reference',
      ],
    },

    '12th': {
      title: 'Class 12th Mock Board Exam Program',
      subtitle: 'Advanced HSC Board & Competitive Exam Preparation',
      duration: '10 Months Program',
      tests: '15 Mock Examinations',
      description:
        'Our Class 12th program provides intensive preparation for HSC board examinations while also preparing students for competitive entrance exams like JEE, NEET, and CET.',

      subjects: [
        { name: 'Physics', topics: 'Mechanics, Thermodynamics, Optics, Modern Physics' },
        { name: 'Chemistry', topics: 'Physical, Inorganic & Organic Chemistry' },
        { name: 'Mathematics', topics: 'Calculus, Algebra, Coordinate Geometry, Statistics' },
        { name: 'Biology', topics: 'Botany, Zoology, Human Physiology' },
        { name: 'English', topics: 'Advanced Grammar, Literature, Communication Skills' },
      ],

      features: [
        'Stream-specific preparation (Science, Commerce, Arts)',
        'Board pattern mock tests with competitive exam level questions',
        'Detailed performance analytics with percentile rankings',
        'Individual mentoring sessions for career guidance',
        'Regular doubt clearing sessions with subject experts',
        'Comprehensive study material with latest updates',
        'College admission guidance and counseling',
        'Scholarship exam preparation support',
      ],

      benefits: [
        'Excel in both board exams and competitive tests',
        'Develop advanced problem-solving skills',
        'Build foundation for higher education',
        'Career counseling for future planning',
        'College admission preparation',
        'Scholarship opportunities guidance',
      ],

      studyMaterial: [
        'Advanced question banks with varying difficulty levels',
        'Board papers from last 15 years with solutions',
        'Competitive exam pattern practice papers',
        'Concept-wise study modules',
        'Formula sheets and quick reference guides',
        'Online practice tests and assessments',
      ],
    },
  };

  const currentCourse = coursesData[activeTab];

  return (
    <div className="pt-0">
      {/* Hero Section */}
      <section className="hero-gradient pt-32 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-customwhite">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-custom">Our Courses</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Comprehensive mock board exam programs designed for academic excellence
          </p>
        </div>
      </section>

      {/* Course Selection Tabs */}
      <section className="py-8 bg-customwhite sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="bg-gray-100 rounded-lg p-1">
              {Object.keys(coursesData).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 sm:px-8 py-3 text-sm sm:text-base rounded-md font-semibold transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-primary text-customwhite shadow-md'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Class {tab} Program
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Course Details */}
      <section className="py-16 bg-customwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Course Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-customblack mb-4 font-custom">
              {currentCourse.title}
            </h2>
            <p className="text-xl text-secondary font-semibold mb-4">{currentCourse.subtitle}</p>
            <div className="flex flex-wrap justify-center gap-6 text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-secondary" />
                <span>{currentCourse.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-secondary" />
                <span>{currentCourse.tests}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Description */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-customblack mb-4">Course Overview</h3>
                <p className="text-gray-600 leading-relaxed">{currentCourse.description}</p>
              </div>

              {/* Subjects Covered */}
              <div className="bg-customwhite rounded-xl shadow-custom p-6">
                <h3 className="text-2xl font-bold text-customblack mb-6">Subjects Covered</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCourse.subjects.map((subject, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-bold text-primary mb-2">{subject.name}</h4>
                      <p className="text-sm text-gray-600">{subject.topics}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <div className="bg-customwhite rounded-xl shadow-custom p-6">
                <h3 className="text-2xl font-bold text-customblack mb-6">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCourse.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-gradient-to-br from-primary to-tertiary rounded-xl p-6 text-customwhite">
                <h3 className="text-2xl font-bold mb-6">Benefits of Our Program</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCourse.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Study Material */}
              <div className="bg-customwhite rounded-xl shadow-custom p-6">
                <h3 className="text-xl font-bold text-customblack mb-4">Study Material Included</h3>
                <ul className="space-y-2">
                  {currentCourse.studyMaterial.map((material, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Download className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{material}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Enrollment Card */}
              <div className="bg-secondary text-customwhite rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold mb-4">Ready to Enroll?</h3>
                <p className="mb-6">Join thousands of successful students</p>
                <button className="w-full bg-customwhite text-secondary hover:bg-opacity-90 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Register Now</span>
                </button>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-customblack mb-4">Need More Information?</h3>
                <div className="space-y-3 text-sm">
                  <p className="text-gray-600">Call us for detailed course information</p>
                  <p className="font-medium text-primary">+91 98765 43210</p>
                  <p className="text-gray-600">Email: courses@dnyangangaedu.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Courses;
