import React from 'react';
import homeImage from '../Images/book.jpg'; 
import ImageSlider from './ImageSlider';
import ContentSlide from './ContentSlide';

function Home() {
  return (
    <section className="relative mt-16 mb-10 sm:mt-0 p-0 border-0">
      {/* <div className="relative">
        <img
          src={homeImage}
          alt="Home"
          className="object-cover w-full opacity-60 blur-[4px] h-screen"
        />
        
        <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r shadow-2xl text-white flex flex-col items-center justify-center text-center">
          <h1 className="text-[30px] sm:mt-20 md:text-[40px] lg:text-[60px] lg:mt-10 mt-8 font-semibold text-black">Shaping Futures, Building Dreams</h1>
          <h3 className="mt-2 text-[30px]  text-black">Dedicated to delivering quality education and empowering students for academic excellence.</h3>
          <p className=" hidden sm:block mt-4 text-[24px] text-justify px-12 text-black">Dnyangange Education is a trusted name in providing comprehensive educational services. From expert guidance to innovative teaching methods, we are committed to preparing students for a brighter tomorrow. Our team of experienced educators ensures a nurturing environment that fosters learning, growth, and success.</p>
          <div>
          <button className="mt-6 mr-6 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary transition-all duration-300">
            join Us
          </button>
          <button className="mt-6 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary transition-all duration-300">
            Explore Courses
          </button>
          </div>
        </div>
      </div> */}
      <ImageSlider />
      {/* <ContentSlide /> */}
    </section>
  );
}

export default Home;
