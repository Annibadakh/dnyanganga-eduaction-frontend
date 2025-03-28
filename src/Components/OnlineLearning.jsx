import React from 'react';

const OnlineLearning = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="container mx-auto p-4 relative">
        <div className="flex flex-wrap justify-center md:justify-between space-y-6 md:space-y-0">
          
          {/* Left Section */}
          <div className="flex-1 w-full sm:w-96 bg-white rounded-lg p-6 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold mb-2">Online</h1>
            <h1 className="text-4xl sm:text-5xl font-bold mb-2">Learning With</h1>
            <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-blue-500">Dnyanganga</h1>
            <p className="text-lg mt-6">
              Discover a wide range of online learning opportunities with Dnyanganga. We offer personalized
              classes in various subjects and languages, from school to college level and beyond.
            </p>
          </div>

          {/* Right Section (Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
            
            <div className="bg-blue-100 rounded-lg p-6 w-full sm:w-64 h-64 flex flex-col justify-center">
              <h2 className="text-xl font-semibold mb-2">Classes for School & College Students</h2>
              <p>We offer online classes for students in school & college.</p>
            </div>

            <div className="bg-green-100 rounded-lg p-6 w-full sm:w-64 h-64 flex flex-col justify-center">
              <h2 className="text-xl font-semibold mb-2">Book Demo Class</h2>
              <p>Just choose your subject/course & take a free trial class.</p>
            </div>

            <div className="bg-yellow-100 rounded-lg p-6 w-full sm:w-64 h-64 flex flex-col justify-center">
              <h2 className="text-xl font-semibold mb-2">Classes in Regional Language</h2>
              <p>Find teachers who will teach you in your mother tongue.</p>
            </div>

            <div className="bg-purple-100 rounded-lg p-6 w-full sm:w-64 h-64 flex flex-col justify-center">
              <h2 className="text-xl font-semibold mb-2">Diverse Courses</h2>
              <p>Coding, Foreign languages, Dance, Music. Take online classes for all.</p>
            </div>

            <div className="bg-orange-100 rounded-lg p-6 w-full sm:w-64 h-64 flex flex-col justify-center">
              <h2 className="text-xl font-semibold mb-2">Experienced Teachers</h2>
              <p>Take lessons from the Best Teachers in India.</p>
            </div>

            <div className="bg-pink-100 rounded-lg p-6 w-full sm:w-64 h-64 flex flex-col justify-center">
              <h2 className="text-xl font-semibold mb-2">Student's Results</h2>
              <p>Every student's results & reviews are important to us.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineLearning;
