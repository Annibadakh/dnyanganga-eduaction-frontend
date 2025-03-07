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
    subscribe: false,
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
    <form onSubmit={handleSubmit} className="w-full max-w-full p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-4xl font-bold mb-4 text-center ">Contact Us</h2>

      
      <div className="flex justify-between space-x-8 mb-6">
        
        <div className="flex-1">
          
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name*
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full bg-gray-100 focus:outline-none border-b border-gray-300 focus:border-primary"
              />
            </div>

            <div className="w-1/2">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name*
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full bg-gray-100 focus:outline-none border-b border-gray-300 focus:border-primary"
              />
            </div>
          </div>

          
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <label htmlFor="workEmail" className="block text-sm font-medium text-gray-700">
                Work Email*
              </label>
              <input
                type="email"
                id="workEmail"
                name="workEmail"
                value={formData.workEmail}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full bg-gray-100 focus:outline-none border-b border-gray-300 focus:border-primary"
              />
            </div>

            <div className="w-1/2">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Company*
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full bg-gray-100 focus:outline-none border-b border-gray-300 focus:border-primary"
              />
            </div>
          </div>

          
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                Job Title*
              </label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full bg-gray-100 focus:outline-none border-b border-gray-300 focus:border-primary"
              />
            </div>

            <div className="w-1/2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number (optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 p-2 w-full bg-gray-100 focus:outline-none border-b border-gray-300 focus:border-primary"
              />
            </div>
          </div>

          
          <div className='ml-40'>
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="privacyAgreed"
              name="privacyAgreed"
              checked={formData.privacyAgreed}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="privacyAgreed" className="text-sm">
              I agree to the <a href="#" className="text-primary">privacy notice</a>
            </label>
          </div>

         
          <div className="mt-6 ml-10">
            <button
              type="submit" 
              className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Submit
            </button>
          </div>
          </div>
        </div>

       
        <div className="flex-1">
          <div className="mt-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              How can we help you?*
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="mt-1 p-2 w-full h-32 bg-gray-100 focus:outline-none border border-gray-300 focus:border-primary"
            ></textarea>
          </div>
          <p className="text-sm mt-4 text-center">
            You can also email us directly at <a href="mailto:info@persistent.com">info@dnyanganga.com</a>
          </p>
        </div>
      </div>
    </form>
  );
}

export default ContactForm;
