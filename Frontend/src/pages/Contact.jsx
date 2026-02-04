import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, AlertCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setSubmitStatus({ type: 'loading', message: 'Sending message...' });
      try {
        // Here you would typically make an API call to your backend
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call
        setSubmitStatus({
          type: 'success',
          message: 'Thank you! Your message has been sent successfully.'
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } catch (error) {
        setSubmitStatus({
          type: 'error',
          message: 'Sorry, there was an error sending your message. Please try again.'
        });
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto py-12 px-4"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Get in Touch</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Have questions about our tumor detection system? We're here to help
          and answer any questions you might have.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {[
          {
            icon: <Mail className="w-6 h-6" />,
            title: "Email Us",
            content: "tumerdetection@gmail.com",
            link: "mailto:tumerdetection@gmail.com"
          },
          {
            icon: <Phone className="w-6 h-6" />,
            title: "Call Us",
            content: "+91 9876543210",
            link: "tel:+919876543210"
          },
          {
            icon: <MapPin className="w-6 h-6" />,
            title: "Visit Us",
            content: "Department of IT,\nProgressive Education Society Modern College Of Enginnering Pune",
            link: "https://maps.app.goo.gl/hEgXvXKwpX824ePz7"
          }
        ].map((item, index) => (
          <motion.a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl shadow-md text-center group"
          >
            <div className="inline-block p-3 bg-blue-100 rounded-full mb-4 text-blue-600
                          group-hover:bg-blue-600 group-hover:text-white transition-all">
              {item.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.content}</p>
          </motion.a>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <motion.form
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send us a Message</h2>
          
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle size={16} className="mr-1" /> {errors.name}
              </p>
            )}
          </div>

          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle size={16} className="mr-1" /> {errors.email}
              </p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle size={16} className="mr-1" /> {errors.subject}
              </p>
            )}
          </div>

          <div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              rows={6}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle size={16} className="mr-1" /> {errors.message}
              </p>
            )}
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={submitStatus.type === 'loading'}
            className={`w-full py-3 px-6 rounded-lg text-white font-medium
              flex items-center justify-center space-x-2
              ${submitStatus.type === 'loading'
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            <Send size={20} />
            <span>
              {submitStatus.type === 'loading' ? 'Sending...' : 'Send Message'}
            </span>
          </motion.button>

          {submitStatus.message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                submitStatus.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : submitStatus.type === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {submitStatus.message}
            </motion.div>
          )}
        </motion.form>

        {/* Map or Additional Info */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Visit Our Lab</h2>
          <div className="aspect-w-16 aspect-h-9 mb-6">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1213.8249660802057!2d73.84518688915796!3d18.525379149477168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c07ef146b839%3A0x9f153b97577dba2a!2sGRGW%2BF5J%20MODERN%20COLLEGE%20OF%20ENGINEERING%2C%20Modern%20College%20Of%20Arts%20Science%20%26%20Commerce%2C%20Shivajinagar%2C%20Modern%20Engineering%20College%20Rd%2C%20Sumukh%20Society%2C%20Shivajinagar%2C%20Pune%2C%20Maharashtra%20411005!5e0!3m2!1sen!2sin!4v1768063067570!5m2!1sen!2sin"
              className="w-full h-full rounded-lg"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="space-y-4">
            <p className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Department of Information Technology,
              Progressive Education Society Modern College Of Enginnering Pune, Maharashtra
            </p>
            <p className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-2 text-blue-600" />
              tumerdetection@gmail.com
            </p>
            <p className="flex items-center text-gray-600">
              <Phone className="w-5 h-5 mr-2 text-blue-600" />
              +91 9876543210
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
