import React, { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    company: '',
    jobTitle: '',
    phone: '',
    message: '',
    privacyAgreed: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Contact Us</h2>

      {/* Form Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name*</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full p-2 bg-gray-100 border-b border-gray-300 focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name*</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full p-2 bg-gray-100 border-b border-gray-300 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Work Email*</label>
              <input type="email" name="workEmail" value={formData.workEmail} onChange={handleChange} required className="w-full p-2 bg-gray-100 border-b border-gray-300 focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Company*</label>
              <input type="text" name="company" value={formData.company} onChange={handleChange} required className="w-full p-2 bg-gray-100 border-b border-gray-300 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Title*</label>
              <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required className="w-full p-2 bg-gray-100 border-b border-gray-300 focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 bg-gray-100 border-b border-gray-300 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div>
          <label className="block text-sm font-medium text-gray-700">How can we help you?*</label>
          <textarea name="message" value={formData.message} onChange={handleChange} required rows={4} className="w-full p-2 bg-gray-100 border border-gray-300 focus:outline-none focus:border-blue-500"></textarea>
          <p className="text-sm mt-4 text-center">
            You can also email us at <a href="mailto:info@dnyanganga.com" className="text-blue-500">info@dnyanganga.com</a>
          </p>
        </div>
      </div>

      {/* Privacy & Submit Button */}
      <div className="mt-6 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center">
          <input type="checkbox" name="privacyAgreed" checked={formData.privacyAgreed} onChange={handleChange} className="mr-2" />
          <label className="text-sm">I agree to the <a href="#" className="text-blue-500">privacy notice</a></label>
        </div>

        <button type="submit" className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Submit
        </button>
      </div>
    </form>
  );
}

export default ContactForm;
