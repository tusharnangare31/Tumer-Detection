import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Calendar, Eye, AlertCircle, ClipboardList, X, Brain, FileText } from "lucide-react";

export default function DoctorDashboard() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [tumorFilter, setTumorFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Modal
  const [selectedScan, setSelectedScan] = useState(null);

  const fetchScans = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("access");
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("http://127.0.0.1:8000/api/patients/scans/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load scans");
        return;
      }
      setScans(Array.isArray(data) ? data : data.scans || []);
    } catch (err) {
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const filteredScans = useMemo(() => {
    let list = [...scans];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => {
        const uid = (s.patient?.patient_uid || "").toLowerCase();
        const name = (s.patient?.full_name || "").toLowerCase();
        return uid.includes(q) || name.includes(q);
      });
    }
    if (tumorFilter !== "ALL") list = list.filter((s) => s.tumor_type === tumorFilter);
    if (statusFilter !== "ALL") list = list.filter((s) => s.status === statusFilter);
    if (fromDate) {
      const from = new Date(fromDate).getTime();
      list = list.filter((s) => new Date(s.scan_date || s.created_at).getTime() >= from);
    }
    if (toDate) {
      const to = new Date(toDate).getTime();
      list = list.filter((s) => new Date(s.scan_date || s.created_at).getTime() <= to);
    }
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list;
  }, [scans, search, tumorFilter, statusFilter, fromDate, toDate]);

  const tumorBadge = (tumor) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold uppercase";
    if (tumor === "glioma") return `${base} bg-red-100 text-red-700`;
    if (tumor === "meningioma") return `${base} bg-purple-100 text-purple-700`;
    if (tumor === "pituitary") return `${base} bg-yellow-100 text-yellow-700`;
    if (tumor === "notumor") return `${base} bg-green-100 text-green-700`;
    return `${base} bg-gray-100 text-gray-700`;
  };

  const statusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    if (status === "PENDING") return `${base} bg-orange-100 text-orange-700`;
    if (status === "COMPLETED") return `${base} bg-blue-100 text-blue-700`;
    if (status === "VERIFIED") return `${base} bg-green-100 text-green-700`;
    return `${base} bg-gray-100 text-gray-700`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-600 mt-1">Comprehensive overview of patient diagnostics and AI analysis.</p>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-800">Filter Records</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Search</label>
            <div className="relative mt-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                placeholder="Name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
            <select
              className="w-full mt-1 py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              value={tumorFilter}
              onChange={(e) => setTumorFilter(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="glioma">Glioma</option>
              <option value="meningioma">Meningioma</option>
              <option value="pituitary">Pituitary</option>
              <option value="notumor">No Tumor</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
            <select
              className="w-full mt-1 py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={fetchScans} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">
              Refresh
            </button>
            <button 
              onClick={() => { setSearch(""); setTumorFilter("ALL"); setStatusFilter("ALL"); setFromDate(""); setToDate(""); }}
              className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-800">Scan Registry</h2>
          </div>
          <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{filteredScans.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="py-4 px-6 font-bold text-gray-400 uppercase text-xs">Patient</th>
                <th className="py-4 px-6 font-bold text-gray-400 uppercase text-xs">Diagnosis</th>
                <th className="py-4 px-6 font-bold text-gray-400 uppercase text-xs">Confidence</th>
                <th className="py-4 px-6 font-bold text-gray-400 uppercase text-xs">Date</th>
                <th className="py-4 px-6 font-bold text-gray-400 uppercase text-xs text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredScans.map((scan) => (
                <tr key={scan.id} className="hover:bg-indigo-50/10 transition-colors group">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-bold text-gray-900">{scan.patient?.full_name}</p>
                      <p className="text-xs text-gray-500 font-mono">{scan.patient?.patient_uid}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={tumorBadge(scan.tumor_type)}>{scan.tumor_type}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${scan.confidence * 100}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600">{(scan.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-500 font-medium">
                    {new Date(scan.scan_date || scan.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => setSelectedScan(scan)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-indigo-600 font-bold text-xs hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm"
                    >
                      <Eye size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))}
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
              className="bg-white w-full max-w-5xl h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedScan(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>

              {/* LEFT: IMAGE VIEWER */}
              <div className="md:w-5/12 bg-gray-900 relative flex items-center justify-center p-8">
                <img 
                  src={selectedScan.mri_image_url} 
                  alt="MRI Scan" 
                  className="w-full h-auto max-h-[60vh] object-contain rounded-xl shadow-2xl"
                />
                <div className="absolute bottom-6 left-6 text-white/80 text-xs font-mono">
                  SCAN ID: {selectedScan.id} <br/>
                  DATE: {new Date(selectedScan.scan_date).toLocaleDateString()}
                </div>
              </div>

              {/* RIGHT: CLINICAL DATA */}
              <div className="md:w-7/12 flex flex-col h-full bg-white">
                <div className="p-8 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                      {selectedScan.patient?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 leading-none">{selectedScan.patient?.full_name}</h2>
                      <p className="text-xs font-bold text-gray-400 tracking-widest mt-1">UID: {selectedScan.patient?.patient_uid}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  {/* AI Classification */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">AI Prediction</p>
                      <p className={`text-xl font-black ${selectedScan.tumor_type === 'notumor' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {selectedScan.tumor_type.toUpperCase()}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Model Confidence</p>
                      <p className="text-xl font-black text-indigo-600">{(selectedScan.confidence * 100).toFixed(2)}%</p>
                    </div>
                  </div>

                  {/* Gemini Report */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-gray-900">AI Clinical Reasoning</h3>
                    </div>
                    {selectedScan.clinical_reasoning ? (
                      <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-sm leading-relaxed text-indigo-900 font-medium whitespace-pre-wrap">
                        {selectedScan.clinical_reasoning}
                      </div>
                    ) : (
                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center text-gray-400 italic">
                        No clinical reasoning data generated for this scan.
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50">
                   <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                     <FileText size={18} /> Generate Official Report PDF
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