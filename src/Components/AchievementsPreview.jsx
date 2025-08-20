import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Star, ArrowRight } from 'lucide-react';

const AchievementsPreview = () => {
  const achievements = [
    {
      icon: Trophy,
      title: 'State Topper Recognition',
      description: 'Our students consistently rank among state toppers',
      stat: '150+ Toppers'
    },
    {
      icon: Award,
      title: 'Excellence Awards',
      description: 'Recognized for outstanding contribution to education',
      stat: '25+ Awards'
    },
    {
      icon: Star,
      title: 'Success Rate',
      description: 'Students achieving distinction in board exams',
      stat: '92% Success'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-secondary to-orange-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className='mb-10'>
                <h1 className='md:w-72 w-52 p-2 capitalize text-white text-lg md:text-2xl font-semibold md:pr-10 pr-5 text-end mb-2 bg-primary'>Our Achievements</h1>
                <div className='md:w-48 w-40 h-2 bg-customwhite'></div>
            </div>
          {/* <h2 className="text-3xl md:text-4xl font-bold text-customwhite mb-4 font-custom">
            Our Achievements
          </h2> */}
          <p className="text-xl text-customwhite opacity-90 max-w-2xl mx-auto">
            Celebrating excellence and recognizing outstanding performance in education
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="bg-customwhite bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <achievement.icon className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">{achievement.title}</h3>
              <p className="text-fourthcolor opacity-90 mb-4">{achievement.description}</p>
              <div className="text-2xl font-bold text-secondary">{achievement.stat}</div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/achievements"
            className="inline-flex items-center space-x-2 bg-customwhite text-secondary hover:bg-opacity-90 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            <span>View All Achievements</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AchievementsPreview;