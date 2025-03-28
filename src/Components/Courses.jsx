import React from 'react';

const CourseCard = ({ title, description, buttonText }) => {
  return (
    <div className="bg-blue-100 rounded-lg shadow-md p-6 flex flex-col items-center sm:items-start">
      <h2 className="text-xl font-semibold mb-2 text-center sm:text-left">{title}</h2>
      <p className="text-gray-700 text-center sm:text-left">{description}</p>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
        {buttonText}
      </button>
    </div>
  );
};

const Courses = () => {
  const courses = [
    {
      title: '10th Class',
      description: 'Online classes for 10th class students in all subjects to help with board exams.',
      buttonText: 'Explore Now',
    },
    {
      title: '12th Class',
      description: 'Online classes for 12th class students in all streams, including Science, Commerce, and Arts.',
      buttonText: 'Explore Now',
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-wrap justify-center md:justify-between items-center">
        
        {/* Left Section (Text) */}
        <div className="w-full md:w-1/2 px-6 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">Our Online</h1>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-blue-500">Courses</h1>
          <p className="text-gray-600 text-lg sm:text-2xl">
            We offer a range of online courses designed to help students succeed in their board exams.
            Choose from 10th and 12th class courses with expert teaching and study material.
          </p>
        </div>

        {/* Right Section (Cards) */}
        <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {courses.map((course) => (
            <CourseCard key={course.title} {...course} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
