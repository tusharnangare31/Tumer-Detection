import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public Pages
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Dataset from "./pages/Dataset";
import Model from "./pages/Model";
import Results from "./pages/Results";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected Logic
import ProtectedRoute from "./components/ProtectedRoute";

// Functional Pages
import Detection from "./pages/Detection";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorPatients from "./pages/DoctorPatients.jsx"; // Added this for Doctor role
import MyPatients from "./pages/MyPatients";
import PatientDetail from "./pages/PatientDetail";
import CreatePatient from "./pages/CreatePatient";
import MyScans from "./pages/MyScans";
import DoctorPatientDetail from "./pages/DoctorPatientDetail"
import DoctorScans from './pages/DoctorScans';

function App() {
  return (
    <Router>
      {/* min-h-screen keeps footer at bottom. 
          overflow-x-hidden prevents unwanted horizontal scrolling from animations.
      */}
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 text-gray-800">
        <Navbar />

        {/* REMOVED 'container mx-auto px-4' 
            The pt-20 handles the fixed Navbar offset. 
        */}
        <main className="flex-grow container mx-auto px-4 py-6">
          <Routes>
            {/* --- Public --- */}
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/dataset" element={<Dataset />} />
            <Route path="/model" element={<Model />} />
            <Route path="/results" element={<Results />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* --- Technician Role --- */}
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

            {/* --- Doctor Role --- */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

            {/* New Route for the Doctor's Global Patient Directory */}
            <Route
              path="/doctor/patients"
              element={
                <ProtectedRoute>
                  <DoctorPatients />
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

            <Route
              path="/doctor/patient/:id"
              element={
                <ProtectedRoute>
                  <DoctorPatientDetail />
                </ProtectedRoute>
              }
            />
            <Route
            path="/doctor/scans"
            element={
              <ProtectedRoute>
                <DoctorScans />
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