import React, { useState } from "react";
import { Send, Phone, Mail, User, MessageSquare } from "lucide-react";
import api from "../Api";
import * as yup from "yup";
import AlertBox from "../Pages/AlertBox";

const enquirySchema = yup.object().shape({
  name: yup
    .string()
    .required("Full name is required")
    .min(3, "Name must be at least 3 characters"),

  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),

  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),

  message: yup
    .string()
    .required("Message is required")
    .min(10, "Message must be at least 10 characters"),
});

const EnquiryForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // remove error when user types
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await enquirySchema.validate(formData, { abortEarly: false });

      setErrors({});

      await api.post("/enquiry", formData);

      setAlert({
        show: true,
        type: "success",
        message: "Thank you for your enquiry! We will contact you soon.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });

      setTimeout(() => {
        setAlert({ show: false, type: "", message: "" });
      }, 3000);
    } catch (err) {
      if (err.name === "ValidationError") {
        const fieldErrors = {};

        err.inner.forEach((error) => {
          fieldErrors[error.path] = error.message;
        });

        setErrors(fieldErrors);
      } else {
        setAlert({
          show: true,
          type: "error",
          message: "Something went wrong. Please try again.",
        });
      }
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <AlertBox
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ ...alert, show: false })}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <div className="mb-10">
            <h1 className="md:w-72 w-52 p-2 capitalize text-white text-xl md:text-2xl font-semibold md:pr-10 pr-5 text-end mb-2 bg-primary">
              Get In Touch
            </h1>
            <div className="md:w-48 w-40 h-2 bg-secondary"></div>
          </div>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about our courses? We're here to help you succeed
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-customwhite rounded-2xl shadow-custom p-8">

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Name + Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Name */}
                <div>
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
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary transition-colors ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>

                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
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
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary transition-colors ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
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
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary transition-colors ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>

                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-customblack mb-2">
                  Message *
                </label>

                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />

                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary resize-none transition-colors ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Tell us about your requirements or questions..."
                  />
                </div>

                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit */}
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