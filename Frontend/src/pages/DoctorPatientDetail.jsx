import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  Activity, 
  User, 
  FileText, 
  Brain, 
  ShieldCheck, 
  Clock, 
  X, 
  CheckCircle,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DoctorPatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal State
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    const token = localStorage.getItem("access");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/patients/patient/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to load patient records");
      
      setPatient(data.patient);
      setScans(data.scans);
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
        a.download = `Medical_Report_${patient.patient_uid}_${scanId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        alert("Error: " + err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error || !patient) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
          <ShieldCheck size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Access Error</h3>
        <p className="text-gray-500 mb-6">{error || "Patient record not found"}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-200">
          Return to Registry
        </button>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 font-sans pb-12"
    >
      {/* --- TOP BAR --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Registry</span>
          </button>
          
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-widest rounded-full">
                Physician View
             </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* --- LEFT: PATIENT BIO (Sticky) --- */}
        <aside className="lg:w-1/3">
           <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 sticky top-24">
              <div className="flex items-start justify-between mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200">
                  {patient.full_name.charAt(0)}
                </div>
                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle size={12} /> Active
                </div>
              </div>

              <h1 className="text-3xl font-black text-gray-900 leading-tight mb-1">{patient.full_name}</h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">UID: {patient.patient_uid}</p>

              <div className="space-y-6">
                 <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm"><User size={20}/></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Demographics</p>
                      <p className="font-bold text-gray-800">{patient.age} Yrs • {patient.gender}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm"><Activity size={20}/></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vitals / History</p>
                      <p className="font-bold text-gray-800">{scans.length} Scan Records</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm"><Clock size={20}/></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Activity</p>
                      <p className="font-bold text-gray-800">
                        {scans.length > 0 ? new Date(scans[0].scan_date).toLocaleDateString() : "No activity"}
                      </p>
                    </div>
                 </div>
              </div>
           </div>
        </aside>

        {/* --- RIGHT: CLINICAL RECORDS --- */}
        <main className="lg:w-2/3 space-y-6">
           <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-black text-gray-900">Clinical Records</h2>
              <button className="text-blue-600 text-sm font-bold hover:underline">Download Summary</button>
           </div>

           {scans.length === 0 ? (
             <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                 <FileText size={32} />
               </div>
               <h3 className="text-lg font-bold text-gray-900">No Records Found</h3>
               <p className="text-gray-500 text-sm">This patient has no MRI scan history.</p>
             </div>
           ) : (
             scans.map((scan) => (
               <motion.div 
                 key={scan.id}
                 whileHover={{ y: -4 }}
                 className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all flex flex-col sm:flex-row gap-6 group"
               >
                 {/* Thumbnail */}
                 <div className="sm:w-40 h-40 bg-gray-900 rounded-2xl overflow-hidden relative flex-shrink-0">
                    <img src={scan.mri_image_url} alt="Scan" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Brain className="text-white/50 w-8 h-8" />
                    </div>
                 </div>

                 {/* Content */}
                 <div className="flex-1 flex flex-col justify-between">
                    <div>
                       <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                             <Calendar size={14} />
                             {new Date(scan.scan_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                             scan.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {scan.status}
                          </span>
                       </div>
                       
                       <h3 className="text-xl font-black text-gray-900 mb-1">
                         {scan.tumor_type === 'notumor' ? 'No Tumor Detected' : scan.tumor_type.toUpperCase()}
                       </h3>
                       <p className="text-sm text-gray-500 font-medium">
                         AI Confidence Score: <span className="text-blue-600 font-bold">{(scan.confidence * 100).toFixed(1)}%</span>
                       </p>
                    </div>

                    <div className="flex items-center gap-3 mt-6">
                       <button 
                         onClick={() => setSelectedScan(scan)}
                         className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                       >
                         <Brain size={16} /> Review Analysis
                       </button>
                       <button 
                         onClick={() => downloadReport(scan.id)}
                         className="px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors border border-gray-200"
                         title="Download Official Report"
                       >
                         <Download size={20} />
                       </button>
                    </div>
                 </div>
               </motion.div>
             ))
           )}
        </main>
      </div>

      {/* --- CLINICAL REVIEW MODAL (Reusable) --- */}
      <AnimatePresence>
        {selectedScan && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedScan(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-4xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedScan(null)}
                className="absolute top-6 right-6 z-20 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>

              {/* IMAGE SIDE */}
              <div className="md:w-5/12 bg-slate-900 flex items-center justify-center p-8">
                <img 
                  src={selectedScan.mri_image_url} 
                  alt="MRI Scan" 
                  className="w-full h-auto max-h-[60vh] object-contain rounded-xl shadow-2xl"
                />
              </div>

              {/* DATA SIDE */}
              <div className="md:w-7/12 flex flex-col h-full bg-white">
                 <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-2xl font-black text-gray-900 mb-1">Clinical Review</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                       Scan ID: #{selectedScan.id} • {new Date(selectedScan.scan_date).toLocaleDateString()}
                    </p>
                 </div>

                 <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">AI Prediction</p>
                          <p className={`text-xl font-black ${selectedScan.tumor_type === 'notumor' ? 'text-green-600' : 'text-red-600'}`}>
                             {selectedScan.tumor_type.toUpperCase()}
                          </p>
                       </div>
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Confidence</p>
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
                          {selectedScan.clinical_reasoning || "No reasoning data available."}
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