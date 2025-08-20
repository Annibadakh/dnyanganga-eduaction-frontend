import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, TrendingUp, ArrowRight } from 'lucide-react';

const ExamCentersPreview = () => {
  const centers = [
    {
      name: 'Mumbai Central Campus',
      location: 'Dadar, Mumbai',
      capacity: '500 Students',
      successRate: '94%',
      image: 'https://images.pexels.com/photos/5427659/pexels-photo-5427659.jpeg'
    },
    {
      name: 'Pune Education Hub',
      location: 'Shivajinagar, Pune',
      capacity: '400 Students',
      successRate: '91%',
      image: 'https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg'
    },
    {
      name: 'Nashik Learning Center',
      location: 'College Road, Nashik',
      capacity: '300 Students',
      successRate: '89%',
      image: 'https://images.pexels.com/photos/5212329/pexels-photo-5212329.jpeg'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className='mb-10'>
                <h1 className='md:w-72 w-52 p-2 capitalize text-white text-xl md:text-2xl font-semibold md:pr-10 pr-5 text-end mb-2 bg-primary'>Exam Centers</h1>
                <div className='md:w-48 w-40 h-2 bg-secondary'></div>
            </div>
          {/* <h2 className="text-3xl md:text-4xl font-bold text-customblack mb-4 font-custom">
            Our Exam Centers
          </h2> */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Strategically located centers equipped with modern facilities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {centers.map((center, index) => (
            <div
              key={index}
              className="bg-customwhite rounded-xl shadow-custom overflow-hidden transform hover:scale-105 transition-all duration-300"
            >
              <div className="relative h-48">
                <img
                  src={center.image}
                  alt={center.name}
                  className="w-full h-full object-cover"
                />
                {/* <div className="absolute inset-0 bg-primary bg-opacity-20"></div> */}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-customblack mb-2">{center.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{center.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{center.capacity}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Success Rate: {center.successRate}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/exam-centers"
            className="inline-flex items-center space-x-2 bg-primary hover:bg-opacity-90 text-customwhite px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            <span>Explore All Centers</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ExamCentersPreview;