import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Upload, Brain, CheckCircle, AlertCircle, Loader2, ArrowLeft, Image as ImageIcon, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const patientId = location.state?.patientId || null;
  const token = localStorage.getItem("access");

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null); 
    }
  };

  const runAIAnalysis = async () => {
    if (!file) return;
    setLoading(true);

    const fd = new FormData();
    fd.append("file", file);

    // Determine Mode
    const isClinicalMode = token && patientId;
    if (isClinicalMode) {
      fd.append("patient_id", patientId);
    }

    const endpoint = isClinicalMode 
      ? "http://127.0.0.1:8000/api/patients/upload-scan/" 
      : "http://127.0.0.1:8000/api/predict/";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: isClinicalMode ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          tumor_type: data.tumor_type || data.prediction || data.label,
          confidence: data.confidence || data.confidence_score || 0,
          isSaved: isClinicalMode
        });
      } else {
        alert(data.error || "Analysis failed");
      }
    } catch (err) {
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white px-6 lg:px-16 py-12 font-sans overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <div className="w-full flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
        <div>
          {patientId && (
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 mb-4 hover:text-indigo-600 transition-colors font-bold">
              <ArrowLeft size={20} /> Return to Profile
            </button>
          )}
          <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
            {token && patientId ? "Clinical Diagnostic" : "Public AI Scanner"}
          </h1>
          <p className="text-xl text-gray-500 mt-2 flex items-center gap-2">
            {token && patientId ? (
              <><CheckCircle size={20} className="text-emerald-500"/> Direct Link: Patient #{patientId}</>
            ) : (
              <><Globe size={20} className="text-blue-500"/> Anonymous Mode: Data will not be stored</>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: UPLOAD CONTROL */}
        <div className="lg:col-span-5 space-y-8">
          <div className="w-full h-[450px] border-4 border-dashed border-gray-100 rounded-[3rem] relative flex items-center justify-center overflow-hidden hover:bg-gray-50 transition-all group">
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" alt="MRI Scan Preview" />
            ) : (
              <label className="flex flex-col items-center cursor-pointer p-10 text-center w-full h-full justify-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
                  <Upload size={32} className="text-indigo-600" />
                </div>
                <span className="text-2xl font-black text-gray-900">Select MRI Image</span>
                <p className="text-gray-400 mt-2 text-lg">Select a .jpg, .png, or DICOM file</p>
                <input type="file" className="hidden" onChange={handleFile} accept="image/*" />
              </label>
            )}
            
            {preview && (
              <button 
                onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-6 py-2 rounded-2xl text-red-500 font-bold shadow-xl transition-transform hover:scale-105"
              >
                Change Image
              </button>
            )}
          </div>

          <button
            onClick={runAIAnalysis}
            disabled={!file || loading}
            className="w-full py-6 bg-indigo-600 disabled:bg-gray-300 text-white rounded-[2rem] font-black text-2xl shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={28} /> : <Brain size={28} />}
            {loading ? "Analyzing..." : "Run Intelligence Analysis"}
          </button>
        </div>

        {/* RIGHT COLUMN: AI INTELLIGENCE RESULTS */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-12 bg-indigo-50/50 rounded-[3rem] border border-indigo-100 h-full flex flex-col justify-center"
              >
                <div className="text-center mb-10">
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Neural Network Classification</p>
                  <h2 className={`text-6xl font-black mb-4 ${result.tumor_type === 'notumor' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {result.tumor_type === 'notumor' ? "Healthy Scan" : result.tumor_type.toUpperCase()}
                  </h2>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm mb-8">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-indigo-900 font-black text-xl">AI Confidence Score</p>
                      <p className="text-gray-400 text-sm italic tracking-tight font-medium">Model probability for current classification</p>
                    </div>
                    <span className="text-4xl font-black text-indigo-600">
                      {(result.confidence * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${result.confidence * 100}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-indigo-600"
                    />
                  </div>
                </div>

                {result.isSaved ? (
                  <div className="flex items-center gap-3 text-emerald-700 bg-emerald-100/50 p-5 rounded-2xl justify-center font-bold">
                    <CheckCircle size={24} /> Scan permanently saved to patient history
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-blue-700 bg-blue-100/50 p-5 rounded-2xl justify-center font-bold italic">
                    <Globe size={24} /> Prediction only: No clinical data was stored
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-4 border-dashed border-gray-50 rounded-[3rem]">
                <div className="p-8 bg-gray-50 rounded-full mb-6 text-gray-200">
                  <ImageIcon size={64} />
                </div>
                <h3 className="text-3xl font-black text-gray-300 tracking-tight">System Idle</h3>
                <p className="text-gray-400 mt-2 text-lg max-w-sm">Please provide an MRI scan to initialize the CNN inference engine.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}