import React, { useState, useEffect, useRef } from 'react';
import { Users, TrendingUp, MapPin, Calendar } from 'lucide-react';

const StatisticsSection = () => {
  const [counters, setCounters] = useState({
    students: 1020,
    successRate: 90,
    centers: 54,
    experience: 15
  });
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const finalValues = {
    students: 15000,
    successRate: 92,
    centers: 25,
    experience: 15
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          animateCounters();
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  const animateCounters = () => {
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setCounters({
        students: Math.round(finalValues.students * progress),
        successRate: Math.round(finalValues.successRate * progress),
        centers: Math.round(finalValues.centers * progress),
        experience: Math.round(finalValues.experience * progress)
      });

      if (step >= steps) {
        clearInterval(timer);
      }
    }, stepTime);
  };

  const stats = [
    {
      icon: Users,
      value: counters.students,
      suffix: '+',
      label: 'Total Students',
      description: 'Students trained successfully'
    },
    {
      icon: TrendingUp,
      value: counters.successRate,
      suffix: '%',
      label: 'Success Rate',
      description: 'Students scoring 90+ marks'
    },
    {
      icon: MapPin,
      value: counters.centers,
      suffix: '+',
      label: 'Exam Centers',
      description: 'Centers across the region'
    },
    {
      icon: Calendar,
      value: counters.experience,
      suffix: '+',
      label: 'Years Experience',
      description: 'Years of educational excellence'
    }
  ];

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-br from-primary to-tertiary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className='mb-10'>
                <h1 className='md:w-96 w-72 p-2 capitalize text-white text-base md:text-2xl font-semibold md:pr-10 pr-5 text-end mb-2 bg-secondary'>Our Achievements in Numbers</h1>
                <div className='md:w-64 w-56 h-2 bg-customwhite'></div>
            </div>
          {/* <h2 className="text-3xl md:text-4xl font-bold text-customwhite mb-4 font-custom">
            Our Achievements in Numbers
          </h2> */}
          <p className="text-xl text-customwhite opacity-90 max-w-2xl mx-auto">
            Discover the impact we've made in the education sector through our dedication to excellence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-customwhite bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <stat.icon className="w-12 h-12 text-secondary" />
              </div>
              <div className="mb-2">
                <span className="text-4xl md:text-5xl font-bold text-fourthcolor font-custom">
                  {stat.value.toLocaleString()}
                </span>
                <span className="text-2xl text-secondary font-bold">{stat.suffix}</span>
              </div>
              <h3 className="text-xl font-semibold text-customwhite mb-2">{stat.label}</h3>
              <p className="text-sm text-customwhite opacity-80">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
