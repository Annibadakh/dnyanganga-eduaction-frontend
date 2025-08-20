import React, { useState } from 'react';
import { BookOpen, Clock, Award } from 'lucide-react';
import onlinetest from "../Images/students.png";
import studentlearn from "../Images/studentlearning.png";
const CoursesSection = () => {
  const [activeTab, setActiveTab] = useState('10th');

  const courses = {
    '10th': {
      title: 'Class 10th Mock Board Exams',
      description: 'Comprehensive mock board examination program designed to prepare students for their SSC board exams with confidence.',
      features: [
        'Complete syllabus coverage as per latest board pattern',
        'Monthly mock tests with detailed performance analysis',
        'Subject-wise practice papers and solution guides',
        'Expert doubt resolution sessions',
        'Performance tracking and improvement suggestions'
      ],
      subjects: ['Mathematics', 'Science', 'Social Studies', 'English', 'Hindi'],
      duration: '8 Months',
      tests: '12 Mock Tests',
      image: onlinetest
    },
    '12th': {
      title: 'Class 12th Mock Board Exams',
      description: 'Advanced mock board examination program for HSC students focusing on board exam pattern and competitive exam preparation.',
      features: [
        'Stream-specific preparation (Science, Commerce, Arts)',
        'Board pattern mock tests with time management training',
        'Previous year question paper practice sessions',
        'Career counseling and guidance sessions',
        'College admission preparation support'
      ],
      subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'],
      duration: '10 Months',
      tests: '15 Mock Tests',
      image: studentlearn
    }
  };

  const currentCourse = courses[activeTab];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* <h2 className="text-3xl md:text-4xl font-bold text-customblack mb-4 font-custom">
            Courses Offered
          </h2> */}
          <div className='mb-10'>
                <h1 className='md:w-72 w-52 p-2 capitalize text-white text-xl md:text-2xl font-semibold md:pr-10 pr-5 text-end mb-2 bg-primary'>Courses Offered</h1>
                <div className='md:w-48 w-36 h-2 bg-secondary'></div>
            </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose from our carefully designed mock board exam programs
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-customwhite rounded-lg p-1 shadow-custom">
            {Object.keys(courses).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-6 py-3 text-sm sm:text-base rounded-md font-semibold transition-all duration-300 ${
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

        {/* Course Content */}
        <div className="bg-customwhite rounded-2xl shadow-custom overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-8 lg:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-customblack mb-4 font-custom">
                {currentCourse.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {currentCourse.description}
              </p>

              {/* Course Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-medium">{currentCourse.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-medium">{currentCourse.tests}</span>
                </div>
              </div>

              {/* Features List */}
              <h4 className="text-lg font-semibold text-customblack mb-4">Key Features:</h4>
              <ul className="space-y-3 mb-6">
                {currentCourse.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Subjects */}
              <h4 className="text-lg font-semibold text-customblack mb-4">Subjects Covered:</h4>
              <div className="flex flex-wrap gap-2 mb-6">
                {currentCourse.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="bg-tertiary bg-opacity-10 text-customwhite px-3 py-2 rounded-full text-sm font-medium"
                  >
                    {subject}
                  </span>
                ))}
              </div>

              <button className="bg-primary hover:bg-opacity-90 text-customwhite px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Explore This Course</span>
              </button>
            </div>

            <div className="relative h-64 p-2 lg:h-auto">
              <img
                src={currentCourse.image}
                alt={currentCourse.title}
                className="w-full h-full object-cover"
              />
              
              {/* <div className="absolute inset-0 bg-primary bg-opacity-20"></div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
