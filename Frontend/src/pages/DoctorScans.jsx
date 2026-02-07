import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  AlertCircle, 
  Activity, 
  X, 
  Brain, 
  FileText, 
  Download, 
  CheckCircle, 
  Clock 
} from "lucide-react";

export default function DoctorScans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [tumorFilter, setTumorFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    setLoading(true);
    const token = localStorage.getItem("access");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/patients/scans/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load scans");
      
      // Handle response structure (list vs object)
      const list = Array.isArray(data) ? data : data.scans || [];
      setScans(list);
    } catch (err) {
      setError(err.message || "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (scanId) => {
    const token = localStorage.getItem("access");
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/patients/scan/${scanId}/pdf/`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to generate PDF");
        
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Medical_Report_${scanId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        alert("Error: " + err.message);
    }
  };

  const filteredScans = useMemo(() => {
    let list = [...scans];
    
    // 1. Search (Patient Name or UID)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => {
        const uid = (s.patient?.patient_uid || "").toLowerCase();
        const name = (s.patient?.full_name || "").toLowerCase();
        return uid.includes(q) || name.includes(q);
      });
    }

    // 2. Tumor Filter
    if (tumorFilter !== "ALL") {
      list = list.filter((s) => s.tumor_type === tumorFilter);
    }

    // 3. Status Filter
    if (statusFilter !== "ALL") {
      list = list.filter((s) => s.status === statusFilter);
    }

    // Sort by Date (Newest First)
    list.sort((a, b) => new Date(b.scan_date || b.created_at) - new Date(a.scan_date || a.created_at));

    return list;
  }, [scans, search, tumorFilter, statusFilter]);

  const getTumorStyle = (type) => {
    if (type === "notumor") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (type === "glioma") return "bg-red-100 text-red-700 border-red-200";
    if (type === "meningioma") return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-slate-50 font-sans">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Global Scan Registry</h1>
          <p className="text-gray-500 mt-1">Master database of all processed MRI diagnostics</p>
        </div>
        <div className="flex gap-3">
           <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase">Total Scans</span>
              <span className="text-xl font-black text-blue-600">{scans.length}</span>
           </div>
           <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase">Positive</span>
              <span className="text-xl font-black text-red-500">
                {scans.filter(s => s.tumor_type !== 'notumor').length}
              </span>
           </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
            <input
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
              placeholder="Search Patient Name or UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative">
             <Activity className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
             <select
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-bold text-gray-600 appearance-none"
              value={tumorFilter}
              onChange={(e) => setTumorFilter(e.target.value)}
            >
              <option value="ALL">All Diagnoses</option>
              <option value="glioma">Glioma</option>
              <option value="meningioma">Meningioma</option>
              <option value="pituitary">Pituitary</option>
              <option value="notumor">No Tumor</option>
            </select>
          </div>

          <div className="relative">
             <CheckCircle className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
             <select
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-bold text-gray-600 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </div>

          <button 
            onClick={() => { setSearch(""); setTumorFilter("ALL"); setStatusFilter("ALL"); }}
            className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="py-5 px-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">Patient Details</th>
                <th className="py-5 px-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">AI Diagnosis</th>
                <th className="py-5 px-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">Confidence</th>
                <th className="py-5 px-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">Date</th>
                <th className="py-5 px-6 font-black text-gray-400 uppercase text-[10px] tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                 [...Array(5)].map((_,i) => <tr key={i}><td colSpan="5" className="p-6"><div className="h-8 bg-gray-50 rounded animate-pulse"/></td></tr>)
              ) : filteredScans.length === 0 ? (
                 <tr><td colSpan="5" className="p-12 text-center text-gray-400 font-bold">No scans match your filters</td></tr>
              ) : (
                filteredScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{scan.patient?.full_name}</p>
                        <p className="text-xs text-gray-400 font-mono font-bold">{scan.patient?.patient_uid}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getTumorStyle(scan.tumor_type)}`}>
                        {scan.tumor_type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600" style={{ width: `${scan.confidence * 100}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-700">{(scan.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                       <div className="flex items-center gap-2 text-gray-500">
                          <Clock size={14} />
                          <span className="text-xs font-bold">{new Date(scan.scan_date || scan.created_at).toLocaleDateString()}</span>
                       </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => setSelectedScan(scan)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs uppercase hover:bg-blue-100 transition-colors"
                      >
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CLINICAL REVIEW MODAL --- */}
      <AnimatePresence>
        {selectedScan && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedScan(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedScan(null)}
                className="absolute top-6 right-6 z-20 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>

              {/* LEFT: IMAGE */}
              <div className="md:w-5/12 bg-slate-900 flex items-center justify-center p-8 relative">
                <img 
                  src={selectedScan.mri_image_url} 
                  alt="MRI Scan" 
                  className="w-full h-auto max-h-[60vh] object-contain rounded-xl shadow-2xl"
                />
                <div className="absolute bottom-6 left-6 text-white/60 text-[10px] font-mono">
                   Scan ID: {selectedScan.id}
                </div>
              </div>

              {/* RIGHT: DATA */}
              <div className="md:w-7/12 flex flex-col h-full bg-white">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                   <h2 className="text-2xl font-black text-gray-900 mb-1">{selectedScan.patient?.full_name}</h2>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                     UID: {selectedScan.patient?.patient_uid} • {selectedScan.patient?.age} Yrs
                   </p>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">AI Diagnosis</p>
                         <p className={`text-xl font-black ${selectedScan.tumor_type === 'notumor' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {selectedScan.tumor_type.toUpperCase()}
                         </p>
                      </div>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Confidence</p>
                         <p className="text-xl font-black text-blue-600">
                            {(selectedScan.confidence * 100).toFixed(2)}%
                         </p>
                      </div>
                   </div>

                   <div>
                      <div className="flex items-center gap-2 mb-3">
                         <Brain className="w-5 h-5 text-blue-600" />
                         <h3 className="font-bold text-gray-900">AI Clinical Reasoning</h3>
                      </div>
                      <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-sm leading-relaxed text-blue-900 font-medium whitespace-pre-wrap">
                         {selectedScan.clinical_reasoning || "No clinical reasoning available."}
                      </div>
                   </div>
                </div>

                <div className="p-6 border-t border-gray-100">
                   <button 
                     onClick={() => downloadReport(selectedScan.id)}
                     className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                   >
                     <Download size={18} /> Download Official Report PDF
                   </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}