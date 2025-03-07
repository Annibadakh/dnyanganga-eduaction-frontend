import React from 'react';
import logo3 from '../Images/logo3.png'; 

const Footer = () => {
  return (
    <footer className="bg-blue-300 text-black p-4 mt-5">
      <div className="container mx-auto flex flex-col items-center">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Dnyanganga Coaching Classes</h2>
          <p>Best Coaching Classes In Kopargaon</p>
        </div>

        <div className="flex flex-col md:flex-row justify-center">
          {/* Logo and Description Section (Left side of Quick Links) */}
          <div className="mb-4 md:mr-8 md:w-1/4 text-center">
            <img 
              src={logo3} // Replace with your logo path
              alt="Dnyanganga Coaching Classes Logo"
              className="w-96 h-auto mb-2"  // Increased width (w-96) for a larger logo
            />
            <p className=" font-semibold text-1xl">
              Best Coaching Classes In Kopargaon.
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="mb-4 md:mr-4 md:w-1/4"> {/* Reduced margin-right here */}
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="list-none">
              <li><a href="#" className="hover:text-blue-500">Home</a></li>
              <li><a href="#" className="hover:text-blue-500">About</a></li>
              <li><a href="#" className="hover:text-blue-500">Dashboard</a></li>
              <li><a href="#" className="hover:text-blue-500">Contact Us</a></li>
              <li><a href="#" className="hover:text-blue-500">App</a></li>
              <li><a href="#" className="hover:text-blue-500">Demo</a></li>
            </ul>
          </div>

          {/* Contact Us Section */}
          <div className="mb-4 md:ml-4 md:w-1/4"> {/* Reduced margin-left here */}
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <ul className="list-none">
              <li><a href="tel:+919881199931" className="hover:text-blue-500">+91 2155114512</a></li>
              <li><a href="tel:+918805915219" className="hover:text-blue-500">+91 4632146246</a></li>
              <li><a href="mailto:yuvatechkopargaon@gmail.com" className="hover:text-blue-500">Dnyanganga@gmail.com</a></li>
              <li className="text-sm"></li>
            </ul>
          </div>

          {/* Localization Section with Google Map */}
          <div className="mb-4 md:ml-8 md:w-1/4">
            <h3 className="text-lg font-semibold">Localization</h3>
            <div className="w-full h-64">
              <iframe
                title="Google Map - Dnyanganga Coaching Classes"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d121176.58181515415!2d74.52089326394435!3d19.876165285936193!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd32e2f0814ee9b%3A0x2c2264609b51ed8!2sKopargaon!5e0!3m2!1sen!2sin!4v1674563481395!5m2!1sen!2sin"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p>&copy; Dnyanganga Coaching Classes | All Rights Reserved By Team TechTitans Sanjivani COE</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
