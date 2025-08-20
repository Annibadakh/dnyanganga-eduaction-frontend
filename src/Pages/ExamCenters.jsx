import React from 'react';
import { MapPin, Users, TrendingUp, Phone, Clock, Award } from 'lucide-react';

const ExamCenters = () => {
  const centers = [
    {
      name: 'Mumbai Central Campus',
      location: 'Dadar, Mumbai - 400014',
      address: '123 Education Street, Near Railway Station',
      capacity: '500 Students',
      successRate: '94%',
      toppers: '25 State/District Toppers',
      contact: '+91 98765 43210',
      timings: '8:00 AM - 6:00 PM',
      facilities: ['Air Conditioned Halls', 'CCTV Surveillance', 'Separate Washrooms', 'Cafeteria'],
      image: 'https://images.pexels.com/photos/5427659/pexels-photo-5427659.jpeg',
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.2043553445436!2d72.8448119148717!3d19.018532587111896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce7b8e1e6c0b%3A0x7e4b8e0b8e1e6c0b!2sDadar%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1234567890123"
    },
    {
      name: 'Pune Education Hub',
      location: 'Shivajinagar, Pune - 411005',
      address: '456 Knowledge Park, FC Road',
      capacity: '400 Students',
      successRate: '91%',
      toppers: '18 State/District Toppers',
      contact: '+91 98765 43211',
      timings: '8:30 AM - 5:30 PM',
      facilities: ['Modern Infrastructure', 'Library Access', 'Parking Facility', 'Medical Room'],
      image: 'https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg',
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.2043553445436!2d73.8448119148717!3d18.518532587111896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf7b8e1e6c0b%3A0x7e4b8e0b8e1e6c0b!2sShivajinagar%2C%20Pune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1234567890123"
    },
    {
      name: 'Nashik Learning Center',
      location: 'College Road, Nashik - 422005',
      address: '789 Academic Avenue, Near Bus Stand',
      capacity: '300 Students',
      successRate: '89%',
      toppers: '12 State/District Toppers',
      contact: '+91 98765 43212',
      timings: '9:00 AM - 5:00 PM',
      facilities: ['Digital Classrooms', 'Computer Lab', 'Sports Ground', 'Canteen'],
      image: 'https://images.pexels.com/photos/5212329/pexels-photo-5212329.jpeg',
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3793.2043553445436!2d73.8448119148717!3d20.018532587111896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf7b8e1e6c0b%3A0x7e4b8e0b8e1e6c0b!2sCollege%20Road%2C%20Nashik%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1234567890123"
    }
  ];

  const galleryImages = [
    'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg',
    'https://images.pexels.com/photos/5427674/pexels-photo-5427674.jpeg',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    'https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg'
  ];

  const testimonials = [
    {
      name: 'Amit Sharma',
      center: 'Mumbai Central Campus',
      feedback: 'Excellent infrastructure and supportive staff. The mock exams here helped me score 95% in boards.',
      rating: 5
    },
    {
      name: 'Priya Desai',
      center: 'Pune Education Hub',
      feedback: 'The environment is very conducive to learning. Teachers are always available for doubt resolution.',
      rating: 5
    }
  ];

  return (
    <div className="pt-0">
      {/* Hero Section */}
      <section className="hero-gradient pt-32 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-customwhite">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-custom">Exam Centers</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            State-of-the-art facilities designed to provide the best examination experience
          </p>
        </div>
      </section>

      {/* Centers List */}
      <section className="py-16 bg-customwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className='mb-10'>
                <h1 className='md:w-72 w-60 p-2 capitalize text-white text-xl md:text-2xl font-semibold md:pr-10 pr-5 text-end mb-2 bg-primary'>Our Exam Centers</h1>
                <div className='md:w-48 w-40 h-2 bg-secondary'></div>
            </div>
            {/* <h2 className="text-3xl md:text-4xl font-bold text-customblack mb-4 font-custom">
              Our Exam Centers
            </h2> */}
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Strategically located centers with modern facilities and expert supervision
            </p>
          </div>

          <div className="space-y-16">
            {centers.map((center, index) => (
              <div key={index} className="bg-customwhite rounded-2xl shadow-custom overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  {/* Center Info */}
                  <div className="p-8 lg:p-12">
                    <h3 className="text-2xl md:text-3xl font-bold text-customblack mb-4 font-custom">
                      {center.name}
                    </h3>
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-customblack">{center.location}</p>
                          <p className="text-gray-600 text-sm">{center.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-secondary" />
                        <span className="text-gray-600">{center.contact}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-secondary" />
                        <span className="text-gray-600">{center.timings}</span>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Users className="w-6 h-6 text-primary mx-auto mb-1" />
                        <div className="font-bold text-customblack">{center.capacity}</div>
                        <div className="text-xs text-gray-600">Capacity</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-primary mx-auto mb-1" />
                        <div className="font-bold text-customblack">{center.successRate}</div>
                        <div className="text-xs text-gray-600">Success Rate</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Award className="w-6 h-6 text-primary mx-auto mb-1" />
                        <div className="font-bold text-customblack">{center.toppers}</div>
                        <div className="text-xs text-gray-600">Toppers</div>
                      </div>
                    </div>

                    {/* Facilities */}
                    <div className="mb-6">
                      <h4 className="font-bold text-customblack mb-3">Facilities Available:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {center.facilities.map((facility, facilityIndex) => (
                          <div key={facilityIndex} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-secondary rounded-full"></div>
                            <span className="text-sm text-gray-600">{facility}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="bg-primary hover:bg-opacity-90 text-customwhite px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                      Contact This Center
                    </button>
                  </div>

                  {/* Map & Image */}
                  <div className="relative">
                    <div className="h-64 lg:h-full min-h-[300px]">
                      <iframe
                        src={center.mapEmbed}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
             <div className='mb-10'>
                <h1 className='md:w-72 w-60 p-2 capitalize text-white text-xl md:text-2xl font-semibold md:pr-10 pr-5 text-end mb-2 bg-primary'>Exam Center Gallery</h1>
                <div className='md:w-48 w-40 h-2 bg-secondary'></div>
            </div>
            {/* <h2 className="text-3xl md:text-4xl font-bold text-customblack mb-4 font-custom">
              Exam Center Gallery
            </h2> */}
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Take a look at our modern facilities and examination halls
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryImages.map((image, index) => (
              <div key={index} className="relative group overflow-hidden rounded-lg shadow-custom">
                <img
                  src={image}
                  alt={`Exam center facility ${index + 1}`}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* <div className="absolute inset-0 bg-primary bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div> */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Feedback */}
      <section className="py-16 bg-customwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
             <div className='mb-10'>
                <h1 className='md:w-72 w-60 p-2 capitalize text-white text-xl md:text-2xl font-semibold md:pr-10 pr-5 text-end mb-2 bg-primary'>Student Feedback</h1>
                <div className='md:w-48 w-40 h-2 bg-secondary'></div>
            </div>
            {/* <h2 className="text-3xl md:text-4xl font-bold text-customblack mb-4 font-custom">
              Student Feedback
            </h2> */}
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              What our students say about our exam centers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Award key={i} className="w-5 h-5 text-secondary fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.feedback}"</p>
                <div>
                  <p className="font-bold text-customblack">{testimonial.name}</p>
                  <p className="text-sm text-secondary">{testimonial.center}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExamCenters;