import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Brain, Database, Code } from 'lucide-react';
import profile from "../assets/images/profile.png"
import girl from "../assets/images/woman.png"

const teamMembers = [
  {
    name: "Kalpesh Patil",
    role: "Team Lead",
    image: profile,
    github: "https://github.com/tusharnangare31",
    linkedin: "https://linkedin.com/in/tusharnangare31",
    email: "mailto:tusharnangare31@gmail.com"
  },
  {
    name: "Tushar Nangare",
    role: "Member",
    image: profile,
    github: "https://github.com/tusharnangare31",
    linkedin: "https://linkedin.com/in/tusharnangare31",
    email: "mailto:tusharnangare31@gmail.com"
  },
  {
    name: "Sarvesh Namra",
    role: "Member",
    image: profile,
    github: "https://github.com/tusharnangare31",
    linkedin: "https://linkedin.com/in/tusharnangare31",
    email: "mailto:tusharnangare31@gmail.com"
  },
  {
    name: "Neha Patil",
    role: "Member",
    image: girl,
    github: "https://github.com/tusharnangare31",
    linkedin: "https://linkedin.com/in/tusharnangare31",
    email: "mailto:tusharnangare31@gmail.com"
  },
  // Add more team members here
];

const mentors = [
  {
    name: "Digvijay Patil",
    role: "Project Guide",
    department: "Department of Information Technology",
    // specialization: "Machine Learning & Computer Vision"
  }
];

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto py-12 px-4"
    >
      {/* Project Overview */}
      <motion.div variants={itemVariants} className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          About Our Project
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Bridging the gap between advanced AI technology and healthcare diagnostics
          through innovative brain tumor detection solutions.
        </p>
      </motion.div>

      {/* Key Features */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-8 mb-16">
        {[
          {
            icon: <Brain className="w-8 h-8" />,
            title: "Deep Learning",
            description: "State-of-the-art CNN architecture for accurate tumor detection and classification"
          },
          {
            icon: <Database className="w-8 h-8" />,
            title: "Rich Dataset",
            description: "Trained on diverse MRI scans ensuring robust performance across various cases"
          },
          {
            icon: <Code className="w-8 h-8" />,
            title: "Modern Stack",
            description: "Built with React, Python, and TensorFlow for optimal performance"
          }
        ].map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl shadow-md text-center"
          >
            <div className="inline-block p-3 bg-blue-100 rounded-full mb-4 text-blue-600">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Team Members */}
      <motion.section variants={itemVariants} className="mb-16">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-10">
          Our Team
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-md text-center"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
              <p className="text-gray-600 mb-4">{member.role}</p>
              <div className="flex justify-center space-x-4">
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Github size={20} />
                </a>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href={member.email}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Mail size={20} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Mentors */}
      <motion.section variants={itemVariants}>
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-10">
          Project Mentors
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {mentors.map((mentor, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-md text-center"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{mentor.name}</h3>
              <p className="text-blue-600 font-medium mb-2">{mentor.role}</p>
              <p className="text-gray-600">{mentor.department}</p>
              <p className="text-gray-500 text-sm mt-2">{mentor.specialization}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
