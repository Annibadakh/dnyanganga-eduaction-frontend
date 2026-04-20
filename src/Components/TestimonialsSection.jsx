import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star, User } from 'lucide-react';

const TestimonialsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // ✅ ALL testimonials
  const testimonials = [
    "Dnyanganga Education gave me the right direction for my studies. Even difficult subjects became interesting. The mock tests and practice papers helped me prepare confidently for board exams.",

    "I learned how to study effectively, manage time, and focus on important topics. The video lectures and test series helped me understand the real exam pattern.",

    "Mock exams helped me identify my mistakes early and improve before final board exams. It increased my confidence a lot.",

    "Through regular tests, I understood how to write answers properly in board exams. The experience was structured and very helpful.",

    "Recorded lectures cleared many doubts. This program is useful for both board exams and CET preparation.",

    "Weekly mock tests helped me stay consistent and complete multiple chapters every week.",

    "The initiative helped remove exam fear and built confidence. Stepwise marking and solutions were very useful.",

    "I understood board exam preparation strategy and paper pattern clearly through this program.",

    "CET mock tests and seminars helped me understand career opportunities after 12th.",

    "This initiative is very beneficial for rural students. Practice papers and test series helped a lot.",

    "Online videos made difficult concepts easy. Learning became enjoyable and effective.",

    "Test series, lectures, and study material made preparation strong and improved confidence."
  ];

  // 🔥 Split
  const sliderTestimonials = testimonials.slice(0, 6);
  const gridTestimonials = testimonials.slice(6);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderTestimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [sliderTestimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderTestimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderTestimonials.length) % sliderTestimonials.length);
  };

  return (
    <section className="py-16 bg-customwhite">
      <div className="max-w-7xl mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-12">
          <div className="mb-10">
            <h1 className="md:w-72 w-52 p-2 text-white text-xl md:text-2xl font-semibold text-end bg-primary">
              Success Stories
            </h1>
            <div className="md:w-48 w-40 h-2 bg-secondary"></div>
          </div>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real experiences from students who improved their performance with our guidance
          </p>
        </div>

        {/* 🔹 SLIDER */}
        {/* <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {sliderTestimonials.map((feedback, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="bg-gradient-to-br from-primary to-tertiary p-8 md:p-12">
                    <div className="max-w-4xl mx-auto text-center text-white">

                      <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white/20">
                          <User className="w-10 h-10 text-white" />
                        </div>
                      </div>

                      <Quote className="w-8 h-8 text-secondary mx-auto mb-4" />

                      <p className="text-lg md:text-xl mb-6 leading-relaxed">
                        "{feedback}"
                      </p>

                      <p className="text-secondary font-semibold mb-3">
                        Student Feedback
                      </p>

                      <div className="flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-secondary fill-current" />
                        ))}
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full"
          >
            <ChevronLeft className="w-6 h-6 text-primary" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full"
          >
            <ChevronRight className="w-6 h-6 text-primary" />
          </button>

          <div className="flex justify-center mt-8 gap-2">
            {sliderTestimonials.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-3 h-3 rounded-full cursor-pointer ${i === currentSlide ? 'bg-primary' : 'bg-gray-300'
                  }`}
              />
            ))}
          </div>
        </div> */}

        {/* 🔹 GRID (ALL REMAINING STORIES) */}
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sliderTestimonials.map((feedback, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition h-full flex flex-col"
            >
              <Quote className="w-6 h-6 text-primary mb-3" />

              <p className="text-gray-700 text-sm leading-relaxed mb-4 flex-grow">
                "{feedback}"
              </p>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-semibold text-secondary">
                  Student Feedback
                </span>

                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-secondary fill-current" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;