import React from 'react';
import { Trophy, Award, Star, Users, TrendingUp, Medal } from 'lucide-react';

const Achievements = () => {
  const achievements = [
    {
      icon: Trophy,
      title: 'State Board Toppers',
      description: 'Our students consistently rank among the top performers in Maharashtra State Board examinations.',
      stats: '150+ State Toppers',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg'
    },
    {
      icon: Medal,
      title: 'District Level Recognition',
      description: 'Multiple students achieving district-level rankings in their respective board examinations.',
      stats: '300+ District Toppers',
      image: 'https://images.pexels.com/photos/5427674/pexels-photo-5427674.jpeg'
    },
    {
      icon: Star,
      title: 'Perfect Scores',
      description: 'Students achieving 100% marks in individual subjects across various examinations.',
      stats: '80+ Perfect Scores',
      image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg'
    }
  ];

  const awards = [
    {
      year: '2024',
      title: 'Excellence in Education Award',
      organization: 'Maharashtra Education Board',
      description: 'Recognized for outstanding contribution to student preparation and academic excellence.'
    },
    {
      year: '2023',
      title: 'Best Mock Exam Center',
      organization: 'Educational Excellence Forum',
      description: 'Awarded for maintaining highest standards in mock examination conduct.'
    },
    {
      year: '2022',
      title: 'Innovation in Teaching',
      organization: 'State Educational Council',
      description: 'Recognition for innovative teaching methodologies and student engagement techniques.'
    },
    {
      year: '2021',
      title: 'Student Success Champion',
      organization: 'Academic Achievement Society',
      description: 'Honored for exceptional student success rates and academic performance.'
    }
  ];

  const toppers = [
    {
      name: 'Priya Sharma',
      class: 'Class 10th - 2024',
      percentage: '98.40%',
      subjects: 'Mathematics: 100, Science: 98, English: 97',
      image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg',
      achievement: 'State Rank 2'
    },
    {
      name: 'Rahul Patil',
      class: 'Class 12th Science - 2024',
      percentage: '96.83%',
      subjects: 'Physics: 98, Chemistry: 95, Mathematics: 100',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      achievement: 'State Rank 8'
    },
    {
      name: 'Sneha Desai',
      class: 'Class 10th - 2024',
      percentage: '95.60%',
      subjects: 'Social Studies: 98, English: 95, Hindi: 94',
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
      achievement: 'District Rank 1'
    },
    {
      name: 'Arjun Kumar',
      class: 'Class 12th Commerce - 2024',
      percentage: '94.17%',
      subjects: 'Accounts: 96, Economics: 93, English: 95',
      image: 'https://images.pexels.com/photos/2104252/pexels-photo-2104252.jpeg',
      achievement: 'District Rank 3'
    }
  ];

  const statistics = [
    { label: 'Overall Success Rate', value: '92%', icon: TrendingUp },
    { label: 'Students Scored 90+', value: '68%', icon: Star },
    { label: 'Perfect Attendees', value: '85%', icon: Users },
    { label: 'Repeat Students', value: '15%', icon: Award }
  ];

  return (
    <div className="">
      {/* Hero Section */}
      <section className="hero-gradient pt-32 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-customwhite">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-custom">Our Achievements</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Celebrating excellence and recognizing outstanding academic performance
          </p>
        </div>
      </section>

      {/* Main Achievements */}
      <section className="py-16 bg-customwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-customblack mb-4 font-custom">
              Major Achievements
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our commitment to excellence has resulted in remarkable student achievements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-customwhite rounded-xl shadow-custom overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={achievement.image}
                    alt={achievement.title}
                    className="w-full h-full object-cover"
                  />
                  {/* <div className="absolute inset-0 bg-primary bg-opacity-20"></div> */}
                  <div className="absolute top-4 right-4">
                    <achievement.icon className="w-8 h-8 text-customwhite" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-customblack mb-3">{achievement.title}</h3>
                  <p className="text-gray-600 mb-4">{achievement.description}</p>
                  <div className="text-2xl font-bold text-secondary">{achievement.stats}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics */}
          <div className="bg-gradient-to-br from-tertiary to-fourthcolor rounded-2xl p-8 mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-customwhite text-center mb-8 font-custom">
              Performance Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {statistics.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="text-3xl font-bold text-customwhite mb-1">{stat.value}</div>
                  <div className="text-sm text-customwhite opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-customblack mb-4 font-custom">
              Awards & Recognition
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Recognition from prestigious educational organizations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {awards.map((award, index) => (
              <div key={index} className="bg-customwhite rounded-xl shadow-custom p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-secondary text-customwhite rounded-full w-12 h-12 flex items-center justify-center font-bold">
                    {award.year}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-customblack mb-2">{award.title}</h3>
                    <p className="text-secondary font-medium mb-2">{award.organization}</p>
                    <p className="text-gray-600">{award.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Performers */}
      <section className="py-16 bg-customwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-customblack mb-4 font-custom">
              Our Top Performers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Celebrating our students who achieved exceptional results in board examinations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {toppers.map((topper, index) => (
              <div key={index} className="bg-customwhite rounded-xl shadow-custom overflow-hidden">
                <div className="relative">
                  <img
                    src={topper.image}
                    alt={topper.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-secondary text-customwhite px-2 py-1 rounded text-sm font-bold">
                    {topper.achievement}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-customblack mb-1">{topper.name}</h3>
                  <p className="text-secondary font-medium text-sm mb-2">{topper.class}</p>
                  <div className="text-2xl font-bold text-primary mb-2">{topper.percentage}</div>
                  <p className="text-xs text-gray-600">{topper.subjects}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Achievements;