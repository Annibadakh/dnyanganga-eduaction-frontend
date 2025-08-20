import React from 'react';
import { Target, Eye, Users, BookOpen, Award, TrendingUp } from 'lucide-react';
import aboutus from "../Images/Aboutus.jpg";
const About = () => {
  const values = [
    {
      icon: BookOpen,
      title: 'Quality Education',
      description: 'We provide top-notch educational resources and expert guidance to ensure comprehensive learning.'
    },
    {
      icon: Users,
      title: 'Student-Centric Approach',
      description: 'Our teaching methodology focuses on individual student needs and learning patterns.'
    },
    {
      icon: Award,
      title: 'Excellence in Results',
      description: 'We maintain high standards and consistently deliver exceptional academic outcomes.'
    },
    {
      icon: TrendingUp,
      title: 'Continuous Improvement',
      description: 'We constantly evolve our methods and materials based on latest educational trends.'
    }
  ];

  return (
    <div className="pt-0">
      {/* Hero Section */}
      <section className="hero-gradient pt-32 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-customwhite">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-custom">About Us</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Empowering students with quality education and comprehensive exam preparation since 2010
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-customwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-customblack mb-6 font-custom">
                Dnyanganga Education Pvt. Ltd.
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Established in 2010, Dnyanganga Education Pvt. Ltd. has been at the forefront of 
                  educational excellence, specializing in mock board examinations for 10th and 12th 
                  standard students. With over 15 years of dedicated service, we have successfully 
                  guided more than 15,000 students towards academic success.
                </p>
                <p>
                  Our comprehensive approach to education combines traditional teaching methods with 
                  modern examination techniques, ensuring that students are well-prepared for both 
                  board examinations and competitive entrance tests. We believe in nurturing not just 
                  academic excellence but also building confidence and character.
                </p>
                <p>
                  Through our network of 25+ examination centers across Maharashtra, we provide 
                  students with convenient access to high-quality mock examinations that closely 
                  mirror the actual board exam pattern and difficulty level.
                </p>
              </div>
            </div>

            <div className="relative">
              <img
                src={aboutus}
                alt="Educational Excellence"
                className="rounded-2xl shadow-custom w-full h-96 object-cover"
              />
            </div>
          </div>

          {/* Mission, Vision, Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-primary text-customwhite p-8 rounded-xl text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <h3 className="text-2xl font-bold mb-4 font-custom">Mission</h3>
              <p>
                To provide comprehensive and effective mock board examination programs that build 
                student confidence and ensure academic success through expert guidance and quality resources.
              </p>
            </div>

            <div className="bg-tertiary text-customwhite p-8 rounded-xl text-center">
              <Eye className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <h3 className="text-2xl font-bold mb-4 font-custom">Vision</h3>
              <p>
                To be the leading educational institution that transforms students into confident, 
                well-prepared individuals ready to excel in their board examinations and beyond.
              </p>
            </div>

            <div className="bg-secondary text-customwhite p-8 rounded-xl text-center">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4 font-custom">Values</h3>
              <p>
                Excellence, Integrity, Student-centricity, Innovation, and Dedication to providing 
                quality education that makes a lasting positive impact on students' lives.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-customblack mb-12 text-center font-custom">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <value.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-customblack mb-2">{value.title}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teaching Methodology */}
          <div className="bg-gradient-to-br from-primary to-tertiary rounded-2xl p-8 md:p-12 text-customwhite">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center font-custom">
              Our Teaching Methodology
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-secondary">Comprehensive Assessment</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Regular mock examinations following board patterns</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Detailed performance analysis and feedback</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Individual attention to weak areas</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 text-secondary">Expert Guidance</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Experienced faculty with proven track records</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalized study plans and strategies</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Career counseling and future guidance</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;