import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

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
              Empowering students with quality education and comprehensive mock board exams 
              for 10th & 12th standards.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 hover:text-secondary cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 hover:text-secondary cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 hover:text-secondary cursor-pointer transition-colors" />
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
              <li>Mock Board Exams</li>
              <li>Study Material</li>
              <li>Expert Lectures</li>
              <li>Student Registration</li>
              <li>Performance Analysis</li>
              <li>Career Guidance</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-secondary">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-secondary" />
                <span>+91 7030830520</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-secondary" />
                <span>connect.dnyangangaeducation@gmail.com</span>
              </div>
              <div className="flex items-start space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <span>Shop No.10, Ground Floor, Shree Prestige, Shirur, Pin-412210</span>
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
