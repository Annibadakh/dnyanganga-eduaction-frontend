import React from 'react';

const CourseCard = ({ title, description, buttonText }) => {
  return (
    <div className="bg-blue-100 rounded-lg shadow-md p-6">
     
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-700">{description}</p>
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
    <div className="flex justify-between items-start">
      
      <div className="w-1/2 pr-8 ml-20 mt-10">
        <h1 className="text-5xl font-bold mb-4">Our Online Courses</h1>
        <h1 className="text-5xl font-bold mb-4 text-blue-500"> Courses</h1>
        <p className="text-gray-600 text-2xl">
          We offer a range of online courses designed to help students succeed in their board exams.
          Choose from 10th and 12th class courses with expert teaching and study material.
        </p>
      </div>

      
      <div className="w-1/2 grid grid-cols-1 gap-4">
        {courses.map((course) => (
          <CourseCard key={course.title} {...course} />
        ))}
      </div>
    </div>
  );
};

export default Courses;
