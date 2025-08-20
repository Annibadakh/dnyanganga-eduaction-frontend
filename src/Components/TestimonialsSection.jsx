import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

const TestimonialsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      name: 'Priya Sharma',
      class: 'Class 10th Topper',
      score: '95.2%',
      image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg',
      feedback: 'The mock exams at Dnyanganga Education helped me understand the exact board exam pattern. The detailed analysis after each test showed me exactly where I needed to improve.',
      rating: 5
    },
    {
      name: 'Rahul Patil',
      class: 'Class 12th Science',
      score: '92.8%',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      feedback: 'Thanks to the comprehensive study material and expert guidance, I was able to secure admission in my dream engineering college. The mock tests built my confidence.',
      rating: 5
    },
    {
      name: 'Sneha Desai',
      class: 'Class 10th',
      score: '89.4%',
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
      feedback: 'The teachers here are exceptional. They not only helped me with academics but also guided me in choosing the right stream for my future. Highly recommended!',
      rating: 5
    },
    {
      name: 'Arjun Kumar',
      class: 'Class 12th Commerce',
      score: '91.6%',
      image: 'https://images.pexels.com/photos/2104252/pexels-photo-2104252.jpeg',
      feedback: 'The regular mock tests and performance tracking helped me identify my weak areas early. The personalized attention from teachers made all the difference.',
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="py-16 bg-customwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className='mb-10'>
                <h1 className='md:w-72 w-52 p-2 capitalize text-white text-xl md:text-2xl font-semibold md:pr-10 pr-5 text-end mb-2 bg-primary'>Success Stories</h1>
                <div className='md:w-48 w-40 h-2 bg-secondary'></div>
            </div>
          {/* <h2 className="text-3xl md:text-4xl font-bold text-customblack mb-4 font-custom">
            Student Success Stories
          </h2> */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hear from our successful students who achieved their academic goals
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="bg-gradient-to-br from-primary to-tertiary p-8 md:p-12">
                    <div className="max-w-4xl mx-auto">
                      <div className="flex flex-col lg:flex-row items-center gap-8">
                        <div className="flex-shrink-0">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-secondary"
                          />
                        </div>
                        
                        <div className="text-center lg:text-left text-customwhite">
                          <Quote className="w-8 h-8 text-secondary mb-4 mx-auto lg:mx-0" />
                          <p className="text-lg md:text-xl mb-6 leading-relaxed">
                            "{testimonial.feedback}"
                          </p>
                          
                          <div className="mb-4">
                            <h4 className="text-xl md:text-2xl font-bold mb-1">{testimonial.name}</h4>
                            <p className="text-secondary font-medium">{testimonial.class}</p>
                            <p className="text-sm opacity-90">Board Score: {testimonial.score}</p>
                          </div>
                          
                          <div className="flex justify-center lg:justify-start">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-5 h-5 text-secondary fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-customwhite bg-opacity-20 hover:bg-opacity-30 text-primary p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-customwhite bg-opacity-20 hover:bg-opacity-30 text-primary p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
