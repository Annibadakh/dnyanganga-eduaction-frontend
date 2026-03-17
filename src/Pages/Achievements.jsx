import React from 'react';
import { Trophy, Star, Users, TrendingUp, Award, BookOpen, Target, MessageCircle, Compass, CheckCircle } from 'lucide-react';

const Achievements = () => {

  const achievements = [
    {
      icon: Trophy,
      title: 'State Topper Recognition',
      description: 'Our students consistently rank among state toppers',
      stat: '150+ Toppers'
    },
    {
      icon: Award,
      title: 'Student Success',
      description: 'Celebrating the achievements and success of our students',
      stat: '5000+ Successful Students'
    },
    {
      icon: Star,
      title: 'Success Rate',
      description: 'Students achieving distinction in board exams',
      stat: '92% Success'
    }
  ];
  const highlights = [
    {
      icon: Trophy,
      text: 'Outstanding board examination results, with students securing top ranks at the district and state levels.',
    },
    {
      icon: Star,
      text: 'State-level Top 10 rank holders, awarded prestigious scholarships for academic excellence.',
    },
    {
      icon: TrendingUp,
      text: 'High success rate in HSC examinations, reflecting systematic preparation and quality teaching.',
    },
    {
      icon: BookOpen,
      text: 'Successful implementation of state-level Pre-Board and Mock Board Examinations, helping students perform confidently in final exams.',
    },
    {
      icon: Target,
      text: 'Strong participation and performance in foundation and competitive exam-oriented test series, building a solid base for future careers.',
    },
    {
      icon: MessageCircle,
      text: 'Positive feedback from students and parents, highlighting improved conceptual clarity, discipline, and exam confidence.',
    },
    {
      icon: Compass,
      text: 'Proven track record of career guidance, helping students make informed academic and career choices.',
    },
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

  const stats = [
    { label: 'Overall Success Rate', value: '92%', icon: TrendingUp },
    { label: 'Students Scored 90+', value: '68%', icon: Star },
    { label: 'Perfect Attendees', value: '85%', icon: Users },
    { label: 'Repeat Students', value: '15%', icon: Award }
  ];

  return (
    <div className="">

      {/* ── Hero ── */}
      <section className="hero-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-customwhite">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-custom">Our Achievements</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Celebrating excellence and recognizing outstanding achievements in education
          </p>
        </div>
      </section>

      {/* ── Intro + Highlights ── */}
      <section className="py-16 bg-customwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Intro paragraph */}
          <div className="max-w-3xl mx-auto text-center mb-14">
            <p className="text-lg text-gray-600 leading-relaxed">
              Over the years, we have consistently delivered strong academic results and meaningful
              student success through structured learning, expert guidance, and a student-centric
              approach.
            </p>
          </div>

          {/* Stats strip */}
          <div className="bg-gradient-to-br from-tertiary to-fourthcolor rounded-2xl p-8 mb-14">
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
                  <p className="text-primary opacity-90 mb-4">{achievement.description}</p>
                  <div className="text-2xl font-bold text-secondary">{achievement.stat}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {highlights.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-customwhite rounded-xl shadow-custom p-6 hover:shadow-lg transition-shadow duration-200"
              >
                {/* Numbered badge */}
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-tertiary to-fourthcolor flex items-center justify-center text-customwhite font-bold text-sm">
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* Icon + Text */}
                <div className="flex items-start gap-3">
                  <item.icon className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Performers (unchanged) ── */}
      <section className="py-16 bg-gray-50">
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