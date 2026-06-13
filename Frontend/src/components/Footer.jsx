import React from "react";
import { Link } from "react-router-dom";
import { Brain, Github, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-400 mt-auto">
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-6 h-6 text-blue-400" />
              <span className="text-white font-bold text-lg">NeuroGenAI</span>
            </div>
            <p className="text-sm leading-relaxed">
              AI-powered brain tumor detection and clinical decision support system.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/upload" className="hover:text-white transition-colors">Detection</Link>
              <Link to="/model" className="hover:text-white transition-colors">Model Architecture</Link>
              <Link to="/dataset" className="hover:text-white transition-colors">Dataset</Link>
              <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="mailto:tumerdetection@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={14} />
                tumerdetection@gmail.com
              </a>
              <p>Dept of IT, Progressive Education Society</p>
              <p>Modern College of Engineering, Pune</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>© {new Date().getFullYear()} NeuroGenAI — Brain Tumor Detection Project. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
