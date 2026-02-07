import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, AlertCircle, ChevronRight, Search, X, Activity, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

export default function DoctorPatient() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistry();
  }, []);

  const fetchRegistry = async () => {
    const token = localStorage.getItem("access");
    try {
      // Calls the specific Doctor Registry endpoint
      const res = await fetch("http://127.0.0.1:8000/api/patients/doctor-registry/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (res.status === 403) {
        throw new Error("Access Denied: Physician privileges required.");
      }
      if (!res.ok) throw new Error("Failed to load patient registry");
      
      setPatients(data);
    } catch (err) {
      setError(err.message || "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredPatients = patients.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(query) ||
      p.uid?.toLowerCase().includes(query)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-6 py-10 min-h-screen font-sans"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <Stethoscope className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Physician Registry</h1>
            <p className="text-gray-500 font-medium text-sm">Centralized patient database & history</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative group w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-10 py-4 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm text-sm font-medium"
            placeholder="Search by Name or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-8 p-6 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-4 shadow-sm">
          <AlertCircle size={24} />
          <div>
            <h3 className="font-bold">Connection Error</h3>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* DATA TABLE */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Patient UID</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Patient Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Demographics</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Activity</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Access</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-8 py-6"><div className="h-10 bg-gray-50 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((p) => (
                  <tr key={p.id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <span className="font-mono text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">
                        {p.uid}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center text-blue-700 text-sm font-bold shadow-sm">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                          <p className="text-xs text-gray-400 font-medium">Joined: {p.joined}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <span>{p.age} Years</span>
                        <span className="text-gray-300">•</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                          p.sex.toLowerCase() === 'male' 
                            ? 'bg-blue-50 text-blue-600 border-blue-100' 
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {p.sex}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className={p.activity > 0 ? "text-emerald-500" : "text-gray-300"} />
                        <span className="text-sm font-bold text-gray-700">{p.activity} Scans</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        // ✅ UPDATED ROUTE: Points to the Doctor-specific detail page
                        onClick={() => navigate(`/doctor/patient/${p.id}`)}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider transition-all group-hover:translate-x-1"
                      >
                        View Records
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-50 p-6 rounded-full mb-4">
                        <Users className="text-gray-300" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {searchQuery ? "No matches found" : "Registry Empty"}
                      </h3>
                      <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
                        {searchQuery 
                          ? `No patient records found matching "${searchQuery}"`
                          : "No patients have been registered in the system yet."}
                      </p>
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