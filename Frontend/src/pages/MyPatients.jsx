import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, AlertCircle, Plus, ChevronRight, Search, X } from "lucide-react";
import { motion } from "framer-motion";

export default function MyPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // 1. Add Search State
  const [searchQuery, setSearchQuery] = useState("");
  
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

  // 2. Filter Logic
  const filteredPatients = patients.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(query) ||
      p.patient_uid?.toLowerCase().includes(query)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 py-8 min-h-screen font-sans"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Patients</h1>
            <p className="text-gray-500 font-medium text-sm">Manage clinical records</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* 3. Search Input */}
          <div className="relative group flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm"
              placeholder="Search name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            onClick={() => navigate("/patients/create")}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all active:scale-95 shadow-md shadow-indigo-100 whitespace-nowrap"
          >
            <Plus size={20} />
            <span>New Patient</span>
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3">
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
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Patient UID</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Demographics</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            
            {/* 4. Use filteredPatients in the map loop */}
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-6 py-6"><div className="h-10 bg-gray-50 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((p) => (
                  <tr key={p.id} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg border border-indigo-100">
                        {p.patient_uid}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center text-indigo-700 text-sm font-bold shadow-sm">
                          {p.full_name.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{p.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <span>{p.age} yrs</span>
                        <span className="text-gray-300">•</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                          p.gender.toLowerCase() === 'male' 
                            ? 'bg-blue-50 text-blue-600 border-blue-100' 
                            : 'bg-pink-50 text-pink-600 border-pink-100'
                        }`}>
                          {p.gender}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => navigate(`/patient/${p.id}`)}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase tracking-wide transition-transform group-hover:translate-x-1"
                      >
                        Profile
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                // Empty State handling
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <Search className="text-gray-300" size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {searchQuery ? "No matches found" : "No patients yet"}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
                        {searchQuery 
                          ? `We couldn't find any patient matching "${searchQuery}"`
                          : "Get started by adding a new patient record to your database."}
                      </p>
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}