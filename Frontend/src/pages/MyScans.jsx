import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, AlertCircle, Eye, Search, ExternalLink, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyScans() {
  const [scans, setScans] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    const token = localStorage.getItem("access");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/patients/my-scans/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to load scans");
      setScans(data);
    } catch (err) {
      setError(err.message || "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  const tumorBadge = (tumor) => {
    const base = "px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm";
    if (tumor === "glioma") return `${base} bg-red-100 text-red-700 ring-1 ring-red-200`;
    if (tumor === "meningioma") return `${base} bg-purple-100 text-purple-700 ring-1 ring-purple-200`;
    if (tumor === "pituitary") return `${base} bg-amber-100 text-amber-700 ring-1 ring-amber-200`;
    if (tumor === "notumor") return `${base} bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200`;
    return `${base} bg-gray-100 text-gray-700 ring-1 ring-gray-200`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="w-full min-h-screen bg-white px-6 lg:px-16 py-12 font-sans"
    >
      {/* HEADER */}
      <div className="w-full flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black text-gray-900 leading-tight flex items-center gap-4">
            <ClipboardList size={48} className="text-indigo-600" /> Analysis History
          </h1>
          <p className="text-xl text-gray-500 mt-2 font-medium">Review your historical CNN predictions and patient scans.</p>
        </div>
        
        <div className="flex bg-gray-100 rounded-2xl p-2 items-center px-4 w-full md:w-80">
          <Search className="text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search scans..." 
            className="bg-transparent border-none outline-none p-2 w-full text-gray-700 font-medium" 
          />
        </div>
      </div>

      {error && (
        <div className="w-full mb-8 p-6 bg-red-50 border border-red-100 text-red-700 rounded-[2rem] flex items-center gap-3">
          <AlertCircle size={24} /> 
          <span className="font-bold text-lg">{error}</span>
        </div>
      )}

      {/* DATA TABLE CONTAINER */}
      <div className="w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">MRI Scan</th>
                <th className="px-10 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">Patient Details</th>
                <th className="px-10 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">AI Diagnosis</th>
                <th className="px-10 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">Analysis Date</th>
                <th className="px-10 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-right">Link</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-10 py-10"><div className="h-8 bg-gray-100 rounded-full w-full"></div></td>
                  </tr>
                ))
              ) : scans.length > 0 ? (
                scans.map((s) => (
                  <tr key={s.id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                    {/* THUMBNAIL */}
                    <td className="px-10 py-6">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                        <img 
                          src={s.mri_image_url} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          alt="Scan" 
                        />
                      </div>
                    </td>

                    {/* PATIENT INFO */}
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-900">{s.patient_name}</span>
                        <span className="font-mono text-xs font-black text-indigo-400 tracking-tighter uppercase mt-1">
                           #{s.patient_uid}
                        </span>
                      </div>
                    </td>

                    {/* AI RESULT */}
                    <td className="px-10 py-6">
                      <div className="flex flex-col gap-2">
                        <span className={tumorBadge(s.tumor_type)}>
                          {s.tumor_type === 'notumor' ? 'Healthy' : s.tumor_type}
                        </span>
                        {s.confidence && (
                          <div className="flex items-center gap-2">
                             <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                               <div 
                                className="h-full bg-indigo-600" 
                                style={{ width: `${s.confidence * 100}%` }}
                               ></div>
                             </div>
                             <span className="text-xs font-bold text-gray-500">
                               {(s.confidence * 100).toFixed(1)}%
                             </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="px-10 py-6 text-gray-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-300" />
                        {new Date(s.scan_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="px-10 py-6 text-right">
                      <a
                        href={s.mri_image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-600 hover:text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95"
                      >
                        <ExternalLink size={18} />
                        Original File
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-6 bg-gray-50 rounded-full mb-4">
                        <ClipboardList className="text-gray-200" size={64} />
                      </div>
                      <h3 className="text-2xl font-black text-gray-300">No scans processed yet</h3>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="py-12 text-center text-gray-400 font-medium text-sm">
        © 2026 TumorDetect AI Intelligence Suite • Full Width Diagnostic History
      </footer>
    </motion.div>
  );
}