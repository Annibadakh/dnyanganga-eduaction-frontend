import React, { useEffect, useState } from 'react';
import { MapPin, Users, Award, School2 } from 'lucide-react';
import api from "../Api";

import img7 from "../Images/gallery/img7.jpg";
import img8 from "../Images/gallery/img8.jpg";
import img9 from "../Images/gallery/img9.jpg";
import img10 from "../Images/gallery/img10.jpg";
import img11 from "../Images/gallery/img11.jpg";
import img12 from "../Images/gallery/img12.jpg";
import img13 from "../Images/gallery/img13.jpg";
import img14 from "../Images/gallery/img14.jpg";


const ExamCenters = () => {
  const [centers, setCenters] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchCenters = async (pageNumber = 1) => {
    try {
      const res = await api.get(`/simple/examCenter?limit=6&page=${pageNumber}`);

      if (pageNumber === 1) {
        setCenters(res.data.data);
      } else {
        setCenters(prev => [...prev, ...res.data.data]); // 🔥 append
      }

      setHasMore(res.data.pagination.hasMore);
    } catch (err) {
      console.error("Error fetching centers", err);
    }
  };

  useEffect(() => {
    fetchCenters(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCenters(nextPage);
  };
  const galleryImages = [
    img7, img8, img9, img10, img11, img12, img13, img14
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
      <section className="hero-gradient py-20">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {centers.map((center, index) => {
              const remaining = (center.capicity || 0) - center.studentCount;

              return (
                <div
                  key={center.centerId}
                  className="relative bg-customwhite rounded-xl shadow-custom overflow-hidden transform hover:scale-105 transition-all duration-300"
                >
                  {index === 0 && (
                    <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                      Top Centre
                    </div>
                  )}

                  <div className="flex items-center justify-center h-28 bg-primary/10">
                    <School2 size={70} className="text-primary" />
                  </div>
                  {/* <div className="relative h-44">
                            <img
                              src="https://images.unsplash.com/photo-1562774053-701939374585"
                              alt="Exam Center"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20"></div>
          
                            {index === 0 && (
                              <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                                Top Center
                              </div>
                            )}
                          </div> */}


                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-customblack mb-2 text-center">
                      {center.centerName}
                    </h3>

                    <div className="space-y-3 mt-4">

                      {/* Location */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          {center.collegeName || "N/A"}
                        </span>
                      </div>

                      {/* Students */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="text-sm">
                          {center.studentCount} Students
                        </span>
                      </div>

                      {/* Capacity */}
                      {/* <div className="flex items-center gap-2 text-gray-600">
                                <TrendingUp className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">
                                  Capacity: {center.capicity || "N/A"}
                                </span>
                              </div> */}

                      {/* Remaining */}
                      {/* <div className="flex items-center gap-2 text-gray-600">
                                <Users className="w-4 h-4 text-red-500" />
                                <span className="text-sm">
                                  Remaining: {remaining >= 0 ? remaining : 0}
                                </span>
                              </div> */}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
              >
                View More Centres
              </button>
            </div>
          )}
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