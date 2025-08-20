import React, { useState } from 'react';
import { Send, Phone, Mail, User, MessageSquare } from 'lucide-react';
import AlertBox from '../Pages/AlertBox'

const EnquiryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // ✅ Alert state
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Here you can integrate API submission
    console.log('Form submitted:', formData);

    // ✅ Show success alert
    setAlert({
      show: true,
      type: 'success',
      message: 'Thank you for your enquiry! We will get back to you soon.'
    });

    // Auto-dismiss alert after 3 seconds
    setTimeout(() => setAlert({ ...alert, show: false }), 3000);

    // Reset form
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <section className="py-16 bg-gray-50">
      {/* ✅ AlertBox */}
      <AlertBox
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ ...alert, show: false })}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className='mb-10'>
            <h1 className='md:w-72 w-52 p-2 capitalize text-white text-xl md:text-2xl font-semibold md:pr-10 pr-5 text-end mb-2 bg-primary'>Get In Touch</h1>
            <div className='md:w-48 w-40 h-2 bg-secondary'></div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about our courses? We're here to help you succeed
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-customwhite rounded-2xl shadow-custom p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-customblack mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-customblack mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-customblack mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-customblack mb-2">
                  Message *
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                    placeholder="Tell us about your requirements or questions..."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-opacity-90 text-customwhite py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnquiryForm;
