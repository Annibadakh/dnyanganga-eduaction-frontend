import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Users } from 'lucide-react';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Excellence in Mock Board Exams",
      subtitle: "Prepare for Success with Expert Guidance",
      description:
        "Join thousands of students who have achieved their academic goals through our comprehensive mock board exam programs.",
      image:
        "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg",
    },
    {
      title: "Comprehensive Study Materials",
      subtitle: "Quality Resources for 10th & 12th Standards",
      description:
        "Access carefully curated study materials designed by expert educators to enhance your exam preparation.",
      image:
        "https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg",
    },
    {
      title: "Multiple Exam Centers",
      subtitle: "Convenient Locations Across the Region",
      description:
        "Take your mock exams at our strategically located centers with state-of-the-art facilities.",
      image:
        "https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(rgba(9, 77, 158, 0.7), rgba(73, 111, 157, 0.7)), url(${slide.image})`,
            }}
          >
            <div className="flex items-center justify-center h-full">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-customwhite">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 font-custom">
                  {slide.title}
                </h1>
                <h2 className="text-xl md:text-2xl mb-6 text-secondary font-semibold">
                  {slide.subtitle}
                </h2>
                <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
                  {slide.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-secondary hover:bg-opacity-90 text-customwhite px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Register Now</span>
                  </button>
                  <button className="border-2 border-customwhite text-customwhite hover:bg-customwhite hover:text-primary px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Explore Courses</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-customwhite p-2 rounded-full transition-all duration-300"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-customwhite p-2 rounded-full transition-all duration-300"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-secondary"
                : "bg-white bg-opacity-50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
