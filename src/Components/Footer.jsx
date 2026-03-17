import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-blue-950 text-customwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8 text-secondary" />
              <span className="text-xl font-bold font-custom">Dnyanganga Education</span>
            </div>
            <p className="text-base opacity-90">
              Empowering students with quality education and comprehensive Mock Board Examinations for 10th and 12th standards, helping them achieve academic excellence and confidence for their final board exams.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/DnyangangaEducation/" target='blank'><Facebook size={25} className="hover:text-secondary cursor-pointer transition-colors" /></a>
              <a href="https://youtube.com/@dnyangangaeducationpvtltd?si=mrvswtxlqkXYU8o4" target='blank'><Youtube size={25} className="hover:text-secondary cursor-pointer transition-colors" /></a>
              <a href="https://www.instagram.com/dnyangangaeducation?igsh=MXNoaGgzc214ZXQ2cw==" target='blank'><Instagram size={25} className="hover:text-secondary cursor-pointer transition-colors" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-secondary">Quick Links</h3>
            <ul className="space-y-2 text-lg">
              {[
                { path: '/', label: 'Home' },
                { path: '/about', label: 'About Us' },
                { path: '/courses', label: 'Courses' },
                { path: '/achievements', label: 'Achievements' },
                { path: '/exam-centers', label: 'Exam Centers' },
                { path: '/gallery', label: 'Gallery' },
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-sm opacity-90 hover:text-secondary hover:opacity-100 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-secondary">Our Services</h3>
            <ul className="space-y-2 text-base opacity-90">
              <li>Mock Board Examinations</li>
              <li>Study Materials</li>
              <li>Expert Lectures</li>
              <li>Student Counselling</li>
              <li>Performance Analysis</li>
              <li>Career Guidance Seminars</li>
              <li>Crash Course</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-secondary">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-secondary" />
                <span>+91 9860849016</span>
                <span>+91 7030830520</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-secondary" />
                <span>connect.dnyangangaeducation@gmail.com</span>
              </div>
              <div className="flex flex-col items-start space-x-2 text-sm">
                <div className='flex flex-nowrap gap-2 mb-2'>
                  <MapPin className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <h5>Registered office: </h5>
                </div>
                <span>Shop No. 10, Ground Floor, Shree Prestige, Bagwan Nagar, Shirur, Pune - 412210, Maharashtra, India</span>
                <div className='flex flex-nowrap gap-2 m-2'>
                  <MapPin className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <h5>Corporate Office: </h5>
                </div>
                <span>204, First Floor, Kulswamini Heights, Subhadranagar, Takli Road, Kopargaon, Ahilyanagar - 423601, Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-tertiary mt-8 pt-8 text-center">
          <p className="text-sm opacity-80">
            &copy; 2025 Dnyanganga Education Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
