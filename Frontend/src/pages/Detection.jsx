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

  // ✅ Preview local image (before upload)
  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

    // 🔍 Fetch patient by UID
  useEffect(() => {
    if (!patient.patient_uid.trim()) return;

    const token = localStorage.getItem("access");
    if (!token) return;

    const delay = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/patients/by-uid/${patient.patient_uid}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // ✅ If NOT FOUND → allow NEW patient (clear fields silently)
        if (res.status === 404) {
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

        // ✅ Existing patient → auto-fill
        setPatient((prev) => ({
          ...prev,
          full_name: data.full_name || "",
          age: data.age || "",
          gender: data.gender || "Male",
          phone: data.phone || "",
          address: data.address || "",
        }));
      } catch {}
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
    if (!patientId) return "Patient not found";
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
      setFormError("You are not logged in. Please login again.");
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data?.error || "Upload failed");
        return;
      }

      // ✅ Use backend output
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
          ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30" 
          : "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-green-500/30"
      }`}>
        {isTumor ? (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>Tumor Detected: {tumor_type.toUpperCase()}</span>
          </>
        ) : (
          <>
            <Shield className="w-4 h-4" />
            <span>No Tumor Detected</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Technician Dashboard
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                AI-powered brain tumor detection and patient management system
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
              <button
                onClick={() => setFormError("")}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
              </div>

              <div className="space-y-4">
                {/* UID */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Patient UID *
                  </label>
                  <div className="relative mt-2">
                    <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      name="patient_uid"
                      value={patient.patient_uid}
                      onChange={handlePatientChange}
                      placeholder="Ex: P001"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Full Name *
                  </label>
                  <div className="relative mt-2">
                    <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      name="full_name"
                      value={patient.full_name}
                      onChange={handlePatientChange}
                      placeholder="Patient full name"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Age + Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Age *
                    </label>
                    <div className="relative mt-2">
                      <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="number"
                        name="age"
                        value={patient.age}
                        onChange={handlePatientChange}
                        placeholder="Age"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={patient.gender}
                      onChange={handlePatientChange}
                      className="w-full mt-2 py-2.5 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Phone (Optional)
                  </label>
                  <div className="relative mt-2">
                    <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      name="phone"
                      value={patient.phone}
                      onChange={handlePatientChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Address (Optional)
                  </label>
                  <div className="relative mt-2">
                    <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      name="address"
                      value={patient.address}
                      onChange={handlePatientChange}
                      placeholder="Street address"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Scan Date */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Scan Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={scanDate}
                    onChange={(e) => setScanDate(e.target.value)}
                    className="w-full mt-2 py-2.5 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  />
                </div>

                <button
                  onClick={resetAll}
                  className="w-full border border-gray-300 hover:bg-gray-100 py-2.5 rounded-xl font-medium transition-all text-gray-700 hover:border-gray-400"
                >
                  Clear Form
                </button>
              </div>
            </div>
          </motion.div>

          {/* Upload + Result */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <FileImage className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">MRI Upload & Analysis</h2>
              </div>

              <div
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                  dragActive
                    ? "border-blue-500 bg-blue-50/50 scale-[1.02]"
                    : "border-gray-300 bg-gradient-to-br from-gray-50 to-white"
                }`}
              >
                <div className="relative z-10">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    dragActive
                      ? "from-blue-500 to-indigo-600 scale-110"
                      : "from-blue-400 to-indigo-500"
                  }`}>
                    <UploadCloud className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-800 font-semibold text-lg">
                    {dragActive ? "Drop your MRI scan here" : "Upload MRI Scan"}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Drag and drop or click to browse
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Supports: JPG, PNG, DICOM • Max size: 10MB
                  </p>

                  <div className="mt-6">
                    <label className="inline-block">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          setFile(e.target.files?.[0] || null);
                          setResult(null);
                          setFormError("");
                        }}
                      />
                      <span className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium cursor-pointer inline-flex items-center gap-2 shadow-lg transition-all hover:scale-105">
                        <FileImage className="w-4 h-4" />
                        Select File
                      </span>
                    </label>
                  </div>

                  {file && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-xl inline-flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <p className="text-sm text-blue-900 font-medium">
                        {file.name}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Local Preview */}
              <AnimatePresence>
                {previewUrl && !result?.mri_image_url && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 overflow-hidden"
                  >
                    <div className="border-2 border-gray-200 rounded-2xl p-4 bg-white">
                      <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FileImage className="w-4 h-4" />
                        Preview
                      </p>
                      <div className="relative rounded-xl overflow-hidden bg-black/5">
                        <img
                          src={previewUrl}
                          alt="MRI Preview"
                          className="w-full max-h-[340px] object-contain"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full mt-6 py-4 rounded-xl text-white font-semibold transition-all shadow-lg ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Analyzing MRI Scan...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Brain className="w-5 h-5" />
                    Start AI Analysis
                  </span>
                )}
              </button>
            </motion.div>

            {/* Result */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">AI Prediction Report</h2>
              </div>

              {!result ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <Brain className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No analysis results yet</p>
                  <p className="text-gray-400 text-sm mt-1">Upload an MRI scan to get started</p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Prediction Card */}
                  <div className="p-6 border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-white to-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <PredictionBadge tumor_type={result.tumor_type} />
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-600">Confidence:</span>
                          <span className="font-bold text-gray-900">
                            {result.confidence !== undefined
                              ? `${(result.confidence * 100).toFixed(1)}%`
                              : "-"}
                          </span>
                        </div>
                        
                        <div className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                          <span className="text-gray-600 text-xs">Scan ID:</span>
                          <span className="font-mono font-bold text-gray-900 ml-2 text-xs">
                            {result.scan_id}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-amber-800 text-sm">
                        <span className="font-semibold">Clinical Verification Required:</span> This AI prediction should be reviewed and confirmed by a qualified medical professional before making any clinical decisions.
                      </p>
                    </div>
                  </div>

                  {/* MRI Image */}
                  {result.mri_image_url && (
                    <div className="p-6 border-2 border-gray-200 rounded-2xl bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <FileImage className="w-5 h-5 text-gray-700" />
                          <p className="font-semibold text-gray-900">Stored MRI Image</p>
                        </div>

                        <button
                          onClick={() => copyToClipboard(result.mri_image_url)}
                          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-all font-medium"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Clipboard className="w-4 h-4" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>
                      </div>

                      <a
                        href={result.mri_image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline text-sm break-all block mb-4"
                      >
                        {result.mri_image_url}
                      </a>

                      <div className="relative rounded-xl overflow-hidden bg-black/5 border-2 border-gray-200">
                        <img
                          src={result.mri_image_url}
                          alt="MRI Stored"
                          className="w-full max-h-[420px] object-contain"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}