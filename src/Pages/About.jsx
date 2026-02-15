import React from 'react';
import { Target, Eye, Users, BookOpen, Award, TrendingUp } from 'lucide-react';
import aboutus from "../Images/Aboutus.jpg";
const About = () => {
  const values = [
    {
      icon: BookOpen,
      title: 'Quality Education',
      description: 'We provide high-quality educational resources and expert guidance to ensure comprehensive learning and academic excellence.'
    },
    {
      icon: Users,
      title: 'Student-Centric Approach',
      description: 'Our teaching methodology focuses on individual student needs and learning patterns to ensure personalized and effective learning outcomes.'
    },
    {
      icon: Award,
      title: 'Excellence in Results',
      description: 'We maintain high academic standards and consistently deliver exceptional results that reflect our commitment to student success.'
    },
    {
      icon: TrendingUp,
      title: 'Continuous Improvement',
      description: 'We continuously evolve our teaching methods and learning materials by incorporating the latest educational trends and best practices.'
    }
  ];

  return (
    <div className="pt-0">
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-customwhite">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-custom">About Us</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Empowering students with quality education and comprehensive exam preparation since 2023.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-customwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-600 mb-6 font-custom">
                Dnyanganga Education Pvt. Ltd.
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Dnyanganga Education Pvt. Ltd. is a leading educational institution committed to shaping the academic future of students from 10th and 12th grades, particularly in the Science stream. With a strong legacy of 3 years in the field of education, we take pride in offering structured academic programs, expert faculty guidance, and result-oriented coaching. Our institution is recognized by the government and holds the prestigious ISO 9001:2015 certification, which reflects our dedication to maintaining high-quality standards in education.
                </p>
                <p>
                  Our primary focus lies in building a strong conceptual foundation for students, helping them succeed not only in board exams but also in competitive examinations such as MHT-CET, NEET, and JEE. We follow a student-centric approach where academic planning, regular assessments, individual mentorship, and doubt-solving sessions are key pillars of our methodology. Over the years, our consistent results and student satisfaction have made us a trusted name in education.
                </p>
                <p>
                  We also emphasize values, discipline, and career guidance, ensuring our students are not just academically equipped but also ready to face the real world with confidence.
                  <br />
                  Join Dnyanganga Education Pvt. Ltd. and be a part of an academic journey that focuses on your growth, success, and future.
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
                To provide comprehensive and effective mock board examination programs that build student confidence and ensure academic success through expert guidance and quality resources.
              </p>
            </div>

            <div className="bg-tertiary text-customwhite p-8 rounded-xl text-center">
              <Eye className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <h3 className="text-2xl font-bold mb-4 font-custom">Vision</h3>
              <p>
                To be the leading educational institution that transforms students into confident, well-prepared individuals, empowering them to excel in their board examinations and succeed beyond academics.
              </p>
            </div>

            <div className="bg-secondary text-customwhite p-8 rounded-xl text-center">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4 font-custom">Values</h3>
              <p>
                Excellence, integrity, student-centricity, innovation, and a dedication to providing quality education that creates a lasting positive impact on students’ lives.
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
                    <span>Regular mock examinations aligned with actual board examination patterns</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Detailed performance analysis with constructive feedback</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Individual attention to identify and improve weak areas</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 text-secondary">Expert Guidance</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Experienced faculty with proven academic track recordss</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalized study plans and exam-oriented strategies</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Career counseling and guidance for future academic pathways</span>
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