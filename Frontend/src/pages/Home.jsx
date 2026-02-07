import React from "react";
import { motion } from "framer-motion";
import { Brain, Upload, BarChart3, Users, ChevronRight } from "lucide-react";
import heroImg from "../assets/images/hero.png"; 

const Home = () => {
  return (
    // Added bg-gray-50 to the body and centered the main container
    <div className="bg-gray-50 min-h-screen flex flex-col items-center overflow-x-hidden">
      
      {/* --- CONSTRAINED HERO SECTION --- */}
      <section className="w-full max-w-7xl px-6 lg:px-16 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-12 bg-white md:mt-8 md:rounded-3xl shadow-sm border border-gray-100">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-3/5 flex flex-col justify-center"
        >
          <h1 className="text-4xl lg:text-6xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
            Revolutionizing <span className="text-blue-600">Tumor Detection</span>  
            <br /> with <span className="text-indigo-600">Deep Learning</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
            Our CNN-powered system analyzes MRI scans to assist doctors in detecting and 
            classifying tumors with remarkable precision.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a
              href="/upload"
              className="group flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-200"
            >
              Start Detection
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/model"
              className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        {/* Image size reduced: max-w-md and h-80/h-96 constraints */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-2/5 flex justify-center md:justify-end"
        >
          <div className="relative p-4 bg-blue-50 rounded-3xl">
            <img
              src={heroImg}
              alt="MRI Analysis"
              className="w-full max-w-sm h-auto object-contain drop-shadow-2xl"
            />
          </div>
        </motion.div>
      </section>

      {/* --- CONSTRAINED FEATURES SECTION --- */}
      <section className="w-full max-w-7xl py-20 px-6 lg:px-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900">Core Features</h2>
            <p className="text-gray-500 font-medium mt-1">Precision tools for clinical research.</p>
          </div>
          <div className="h-[1px] flex-1 bg-gray-200 hidden md:block mb-3 ml-10"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<Brain className="text-blue-600" size={28} />}
            title="Deep CNN Model"
            desc="Optimized for high-accuracy MRI tumor analysis."
            bgColor="bg-blue-50"
          />
          <FeatureCard 
            icon={<Upload className="text-indigo-600" size={28} />}
            title="Smart Upload"
            desc="Securely process medical scans with instant feedback."
            bgColor="bg-indigo-50"
          />
          <FeatureCard 
            icon={<BarChart3 className="text-emerald-600" size={28} />}
            title="Visual Insights"
            desc="Automatic performance graphs and confidence scores."
            bgColor="bg-emerald-50"
          />
          <FeatureCard 
            icon={<Users className="text-pink-600" size={28} />}
            title="Collaborative"
            desc="Designed for seamless workflow between doctors."
            bgColor="bg-pink-50"
          />
        </div>
      </section>

      {/* --- CONSTRAINED CTA SECTION --- */}
      <section className="w-full max-w-7xl mb-12 px-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 px-8 rounded-[2.5rem] text-center text-white shadow-xl shadow-blue-100">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Empowering Medical Intelligence
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Join the future of AI-driven healthcare diagnostics.
            </p>
            <button className="px-10 py-4 bg-white text-blue-700 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg">
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      <footer className="w-full py-8 text-center text-gray-400 font-medium text-sm">
        © 2026 TumorDetect AI
      </footer>
    </div>
  );
};

/* Reusable Feature Card Component - Adjusted padding and text size */
const FeatureCard = ({ icon, title, desc, bgColor }) => (
  <motion.div
    whileHover={{ y: -8 }}
    className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group"
  >
    <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="font-bold text-xl text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">
      {desc}
    </p>
  </motion.div>
);

export default Home;