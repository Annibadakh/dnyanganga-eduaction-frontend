import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Eye, Users } from 'lucide-react';
import aboutimg from '../Images/aboutimg.png';

const AboutPreview = () => {
  return (
    <section className="py-16 bg-customwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className='mb-10'>
                <h1 className='md:w-72 w-52 p-2 capitalize text-white text-xl md:text-2xl font-semibold md:pr-10 pr-5 text-end mb-2 bg-primary'>About Us</h1>
                <div className='md:w-48 w-36 h-2 bg-secondary'></div>
        </div>
        {/* <h2 className="text-3xl md:text-4xl font-bold text-customblack mb-6 font-custom">
              About Dnyanganga Education
            </h2> */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            {/* <div className="absolute inset-0 bg-primary bg-opacity-5 rounded-2xl"></div> */}
            <img
              src={aboutimg}
              alt="About Dnyanganga Education"
              className="rounded-2xl shadow-custom w-full h-96 object-cover"
            />
            
          </div>
          <div>
            {/* <h2 className="text-3xl md:text-4xl font-bold text-customblack mb-6 font-custom">
              About Dnyanganga Education
            </h2> */}
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              With over 15 years of excellence in education, Dnyanganga Education Pvt. Ltd. has been 
              a trusted partner for students preparing for their board examinations. We specialize in 
              conducting comprehensive mock board exams that mirror the actual board examination pattern.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our mission is to build confidence in students through rigorous practice and expert guidance, 
              ensuring they approach their board exams with complete preparation and self-assurance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4">
                <Target className="w-8 h-8 text-secondary mx-auto mb-2" />
                <h4 className="font-semibold text-customblack">Mission</h4>
                <p className="text-sm text-gray-600">Excellence in Education</p>
              </div>
              <div className="text-center p-4">
                <Eye className="w-8 h-8 text-secondary mx-auto mb-2" />
                <h4 className="font-semibold text-customblack">Vision</h4>
                <p className="text-sm text-gray-600">Future-Ready Students</p>
              </div>
              <div className="text-center p-4">
                <Users className="w-8 h-8 text-secondary mx-auto mb-2" />
                <h4 className="font-semibold text-customblack">Values</h4>
                <p className="text-sm text-gray-600">Student-Centric Approach</p>
              </div>
            </div>

            <Link
              to="/about"
              className="inline-flex items-center space-x-2 bg-primary hover:bg-opacity-90 text-customwhite px-6 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              <span>Read More About Us</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;