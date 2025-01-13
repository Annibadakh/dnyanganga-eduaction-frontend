import React from 'react';
import aboutus from '../Images/AboutUs.jpg';
import aboutus1 from '../Images/aboutus-2.png';

const AboutUs = () => {
  return (
    <div className='-mt-1'>
      
      <div className="relative w-full h-28">
        <img
          src={aboutus} 
          alt="About Us"
          className="w-screen h-full object-cover " 
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <h2 className="text-blue-400 text-5xl font-semibold">About Us</h2> 
        </div>
      </div>

      
      <div className="px-4 py-8 bg-gray-300">
        <h3 className="text-4xl font-bold mb-4 text-center">Our Journey in Education</h3>
        <h3 className="text-2xl mb-6 text-center">
          We specialize in providing quality education for students in the 10th and 12th classes.
        </h3>

        
        <div className='flex justify-around gap-6 mt-10'>
          
          <div className="p-6 w-[30%] h-72 bg-gray-100 border border-blue-500 rounded-3xl shadow-lg transition-transform transform hover:scale-105 hover:translate-y-[-10px] hover:shadow-2xl">
            <h4 className="text-3xl font-semibold mb-3 text-gray-800 text-center">10th Class</h4>
            <h4 className="text-xl text-gray-700">
              Our 10th class program focuses on building a strong foundation in all core subjects, preparing students for further studies and life challenges.
            </h4>
          </div>

        
          <img
            src={aboutus1} 
            alt="About Us"
            className="w-[450px] h-80 mt-0"
          />

          
          <div className="p-6 w-[30%] h-72 bg-gray-100 border border-blue-500 rounded-3xl shadow-lg transition-transform transform hover:scale-105 hover:translate-y-[-10px] hover:shadow-2xl">
            <h4 className="text-3xl font-semibold mb-3 text-gray-800 text-center">12th Class</h4>
            <h4 className="text-xl text-gray-700">
              Our 12th class program offers advanced courses and preparation for higher education, ensuring students are ready for the next chapter in their academic journey.
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
