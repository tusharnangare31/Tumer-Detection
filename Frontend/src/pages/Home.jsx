// src/pages/Home.jsx
import React from "react";
import { motion } from "framer-motion";
import { Brain, Upload, BarChart3, Users, ChevronRight } from "lucide-react";
import heroImg from "../assets/images/hero.png"; 

const Home = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col overflow-x-hidden">
      
      {/* --- FULL WIDTH HERO SECTION --- */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-6 lg:px-16 py-12 md:py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/2 flex flex-col justify-center"
        >
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tight">
            Revolutionizing <span className="text-blue-600">Tumor Detection</span>  
            <br /> with <span className="text-indigo-600">Deep Learning</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
            Our CNN-powered system analyzes MRI scans to assist doctors in detecting and 
            classifying tumors with remarkable precision — bridging technology and 
            healthcare for a better tomorrow.
          </p>
          
          <div className="flex flex-wrap gap-5">
            <a
              href="/upload"
              className="group flex items-center gap-2 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 transition-all active:scale-95"
            >
              Start Detection
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/model"
              className="px-10 py-5 border-2 border-blue-600 text-blue-700 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/2 mt-12 md:mt-0 flex justify-end"
        >
          <img
            src={heroImg}
            alt="MRI Analysis"
            className="w-full max-w-4xl h-auto object-contain"
          />
        </motion.div>
      </section>

      {/* --- FULL WIDTH FEATURES SECTION --- */}
      <section className="w-full py-24 bg-white border-y border-gray-100 px-6 lg:px-16">
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <h2 className="text-4xl font-black text-gray-900">Core Features</h2>
            <p className="text-gray-500 font-medium mt-2">Precision tools for clinical research and diagnosis.</p>
          </div>
          <div className="h-[2px] flex-1 bg-gray-100 hidden md:block mb-4 ml-10"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<Brain className="text-blue-600" size={32} />}
            title="Deep CNN Model"
            desc="A trained convolutional neural network optimized for high-accuracy MRI tumor analysis."
            bgColor="bg-blue-50"
          />
          <FeatureCard 
            icon={<Upload className="text-indigo-600" size={32} />}
            title="Smart Image Upload"
            desc="Securely process medical scans with instant feedback and metadata extraction."
            bgColor="bg-indigo-50"
          />
          <FeatureCard 
            icon={<BarChart3 className="text-emerald-600" size={32} />}
            title="Visual Insights"
            desc="Generate performance graphs, confusion matrices, and confidence scores automatically."
            bgColor="bg-emerald-50"
          />
          <FeatureCard 
            icon={<Users className="text-pink-600" size={32} />}
            title="Collaborative Interface"
            desc="Designed for seamless workflow between doctors, researchers, and developers."
            bgColor="bg-pink-50"
          />
        </div>
      </section>

      {/* --- FULL WIDTH CTA SECTION --- */}
      <section className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 py-20 px-6 lg:px-16 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Empowering Medical Intelligence
          </h2>
          <p className="text-xl text-blue-100 leading-relaxed mb-10">
            Our mission is to create AI-driven healthcare solutions that make diagnostics 
            faster, safer, and more reliable — for every patient, everywhere.
          </p>
          <button className="px-12 py-5 bg-white text-blue-700 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all shadow-2xl">
            Get Started Now
          </button>
        </div>
      </section>

      {/* SIMPLE FOOTER */}
      <footer className="w-full py-8 text-center text-gray-400 font-medium text-sm">
        © 2026 TumorDetect AI • Full Width Professional Suite
      </footer>
    </div>
  );
};

/* Reusable Feature Card Component */
const FeatureCard = ({ icon, title, desc, bgColor }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className="p-10 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-gray-200 transition-all group"
  >
    <div className={`w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="font-bold text-2xl text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-500 leading-relaxed">
      {desc}
    </p>
  </motion.div>
);

export default Home;