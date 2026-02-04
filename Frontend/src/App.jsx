import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Dataset from "./pages/Dataset";
import Model from "./pages/Model";
import Results from "./pages/Results";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";

import Detection from "./pages/Detection";
import DoctorDashboard from "./pages/DoctorDashboard";
import MyPatients from "./pages/MyPatients";
import PatientDetail from "./pages/PatientDetail";
import CreatePatient from "./pages/CreatePatient";
import MyScans from "./pages/MyScans";


function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 text-gray-800">
        <Navbar />

        <main className="flex-grow container mx-auto px-4 py-6">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/dataset" element={<Dataset />} />
            <Route path="/model" element={<Model />} />
            <Route path="/results" element={<Results />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Technician */}
            <Route
              path="/technician"
              element={
                <ProtectedRoute>
                  <Detection />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patients"
              element={
                <ProtectedRoute>
                  <MyPatients />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patients/create"
              element={
                <ProtectedRoute>
                  <CreatePatient />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patient/:id"
              element={
                <ProtectedRoute>
                  <PatientDetail />
                </ProtectedRoute>
              }
            />

            {/* Doctor */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-scans"
              element={
                <ProtectedRoute>
                  <MyScans />
                </ProtectedRoute>
              }
            />

          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
