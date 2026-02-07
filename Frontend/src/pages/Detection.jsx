import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle,
  FileImage,
  MapPin,
  Phone,
  UploadCloud,
  User,
  Loader2,
  Clipboard,
  Check,
  X,
  Brain,
  Shield,
  TrendingUp,
  Sparkles, // Added for AI icon
  FileText, // Added for Protocol icon
} from "lucide-react";

export default function Detection() {
  const [patientId, setPatientId] = useState(null);
  const [patient, setPatient] = useState({
    patient_uid: "",
    full_name: "",
    age: "",
    gender: "Male",
    phone: "",
    address: "",
  });

  const [scanDate, setScanDate] = useState("");
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Fetch patient logic
  useEffect(() => {
    if (!patient.patient_uid.trim()) {
      setPatientId(null);
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) return;

    const delay = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/patients/by-uid/${patient.patient_uid}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.status === 404) {
          setPatientId(null);
          setPatient((prev) => ({
            ...prev,
            full_name: "",
            age: "",
            gender: "Male",
            phone: "",
            address: "",
          }));
          return;
        }

        if (!res.ok) return;

        const data = await res.json();
        setPatientId(data.id);
        setPatient((prev) => ({
          ...prev,
          full_name: data.full_name || "",
          age: data.age || "",
          gender: data.gender || "Male",
          phone: data.phone || "",
          address: data.address || "",
        }));
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 600);

    return () => clearTimeout(delay);
  }, [patient.patient_uid]);

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const validate = () => {
    if (!patient.patient_uid.trim()) return "Patient UID is required";
    if (!patientId) return "This Patient UID is not registered.";
    if (!file) return "MRI image is required";
    return null;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
      setFormError("");
    }
  };

  const resetAll = () => {
    setPatientId(null);
    setPatient({
      patient_uid: "",
      full_name: "",
      age: "",
      gender: "Male",
      phone: "",
      address: "",
    });
    setScanDate("");
    setFile(null);
    setResult(null);
    setFormError("");
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Copy failed");
    }
  };

  const handleSubmit = async () => {
    setFormError("");
    setResult(null);

    const msg = validate();
    if (msg) {
      setFormError(msg);
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      setFormError("You are not logged in.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("patient_id", patientId);
      if (scanDate) formData.append("scan_date", scanDate);

      const res = await fetch("http://127.0.0.1:8000/api/patients/upload-scan/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data?.error || "Upload failed");
        return;
      }
      setResult(data);
    } catch (err) {
      setFormError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  const PredictionBadge = ({ tumor_type }) => {
    const isTumor = tumor_type && tumor_type !== "notumor";
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm ${
        isTumor 
          ? "bg-red-100 text-red-700 border border-red-200" 
          : "bg-emerald-100 text-emerald-700 border border-emerald-200"
      }`}>
        {isTumor ? (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>{tumor_type.toUpperCase()} DETECTED</span>
          </>
        ) : (
          <>
            <Shield className="w-4 h-4" />
            <span>NO TUMOR DETECTED</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Technician Dashboard
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                AI-powered brain tumor detection and clinical context engine
              </p>
            </div>
          </div>
        </div>

        {/* ERROR */}
        <AnimatePresence>
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Error</p>
                <p className="text-sm">{formError}</p>
              </div>
              <button onClick={() => setFormError("")} className="text-red-400 hover:text-red-600">
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Patient Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Patient Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Patient UID *</label>
                  <input
                    name="patient_uid"
                    value={patient.patient_uid}
                    onChange={handlePatientChange}
                    placeholder="Ex: P001"
                    className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                  <input
                    name="full_name"
                    value={patient.full_name}
                    readOnly
                    className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Age</label>
                    <input name="age" value={patient.age} readOnly className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl bg-gray-100 text-gray-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Gender</label>
                    <input name="gender" value={patient.gender} readOnly className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl bg-gray-100 text-gray-500" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button onClick={resetAll} className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium">Reset Form</button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Upload + Results */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Upload Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6"
              onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <UploadCloud className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Upload Scan</h2>
              </div>

              <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                <input type="file" accept="image/*" className="hidden" id="fileUpload" onChange={(e) => { setFile(e.target.files?.[0] || null); setResult(null); }} />
                
                {!file ? (
                  <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <FileImage className="w-8 h-8 text-blue-500" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">Click to Upload MRI</span>
                    <span className="text-sm text-gray-400 mt-1">or drag and drop file here</span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <FileImage className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 text-sm">{file.name}</p>
                        <p className="text-xs text-blue-600">Ready to analyze</p>
                      </div>
                    </div>
                    <button onClick={() => setFile(null)} className="p-2 hover:bg-white rounded-lg text-gray-500"><X size={18}/></button>
                  </div>
                )}
              </div>

              {previewUrl && !result && (
                 <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 max-h-[300px] bg-black">
                   <img src={previewUrl} className="w-full h-full object-contain opacity-80" alt="Preview" />
                 </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!file || loading}
                className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Brain />}
                {loading ? "Processing..." : "Run AI Diagnostics"}
              </button>
            </motion.div>

            {/* RESULTS SECTION */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* 1. Classification Result */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">AI Classification</p>
                        <PredictionBadge tumor_type={result.tumor_type} />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Confidence</p>
                        <p className="text-2xl font-black text-gray-900">{(result.confidence * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. GEMINI AI PROTOCOL (NEW SECTION) */}
                  {result.clinical_reasoning && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl shadow-xl shadow-indigo-200 text-white p-8 relative overflow-hidden"
                    >
                      {/* Decorative Background */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6 border-b border-white/20 pb-4">
                          <Sparkles className="w-6 h-6 text-yellow-300" />
                          <h3 className="text-xl font-bold text-white">Recommended Treatment Protocol</h3>
                        </div>

                        {/* PRESERVE FORMATTING WITH WHITESPACE-PRE-WRAP */}
                        <div className="font-medium text-indigo-50 leading-relaxed whitespace-pre-wrap font-mono text-sm bg-black/20 p-6 rounded-2xl border border-white/10">
                          {result.clinical_reasoning}
                        </div>
                        
                        <div className="mt-4 flex items-center gap-2 text-xs text-indigo-200">
                          <Shield className="w-3 h-3" />
                          <span>AI Generated Context • For Educational Use Only</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 3. Stored Image */}
                  {result.mri_image_url && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <span className="font-bold text-gray-900">Scan Archived</span>
                        </div>
                        <button onClick={() => copyToClipboard(result.mri_image_url)} className="text-xs text-blue-600 font-bold hover:underline">
                          {copied ? "COPIED" : "COPY LINK"}
                        </button>
                      </div>
                      <div className="bg-black rounded-xl overflow-hidden h-64 flex items-center justify-center">
                         <img src={result.mri_image_url} className="h-full object-contain" alt="Saved Scan" />
                      </div>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </motion.div>
    </div>
  );
}