import React from 'react';
import homeImage from '../Images/home1.jpg'; 

function Home() {
  return (
    <section className="relative p-0 border-0">
      <div className="relative">
        <img
          src={homeImage}
          alt="Home"
          className="object-cover w-full h-screen"
        />
        
        <div className="absolute bottom-0 left-0 m-8 w-80 p-8 bg-gradient-to-r ml-36 mb-20 bg-gray-300 shadow-2xl rounded-3xl text-white flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-semibold text-black">Admission</h2>
          <h1 className="text-5xl font-semibold text-black mt-2">Open</h1>
          <p className="mt-4 text-black">
            Join our classes today. Get the best coaching for your future with expert guidance.
          </p>
          <button className="mt-6 w-full bg-blue-300 text-black py-3 px-6 rounded-lg hover:bg-blue-300 transition-all duration-300">
            Apply Now
          </button>
        </div>
      </div>
    </section>
  );
}

export default Home;
