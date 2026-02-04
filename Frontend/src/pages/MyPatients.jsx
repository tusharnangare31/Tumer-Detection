import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, AlertCircle, Plus, ChevronRight, Search, UserCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function MyPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const token = localStorage.getItem("access");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/patients/my-patients/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to load patients");
      setPatients(data);
    } catch (err) {
      setError(err.message || "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 py-8"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Patients</h1>
            <p className="text-gray-500 font-medium">Manage clinical records and MRI history</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/patients/create")}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all active:scale-95 shadow-md"
        >
          <Plus size={20} />
          <span>New Patient</span>
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 animate-shake">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* DATA TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Patient UID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                // Skeleton Loader
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-6 py-6"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : patients.length > 0 ? (
                patients.map((p) => (
                  <tr key={p.id} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {p.patient_uid}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                          {p.full_name.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-800">{p.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">{p.age} yrs</span>
                        <span className="text-gray-300">•</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          p.gender.toLowerCase() === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                        }`}>
                          {p.gender}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => navigate(`/patient/${p.id}`)}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold text-sm transition-transform group-hover:translate-x-1"
                      >
                        View Profile
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : null}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE */}
        {!loading && patients.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <Search className="text-gray-300" size={40} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No patients found</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2">
              You haven't added any patients yet. Start by creating a new patient record.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}