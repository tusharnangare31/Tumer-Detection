import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Upload, Brain, CheckCircle, Loader2, ArrowLeft, Image as ImageIcon, Globe, Sparkles, FileText, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown"; // Import this to render Gemini output

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
    
    // Pass demographics if available (Optional: Hardcoded for demo if not in location.state)
    // fd.append("age", "55");
    // fd.append("gender", "Female");

    const isClinicalMode = token && patientId;
    if (isClinicalMode) fd.append("patient_id", patientId);

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
          // ✅ Capture the Gemini Clinical Reasoning here
          reasoning: data.clinical_reasoning || data.reasoning || null, 
          isSaved: isClinicalMode
        });
      } else {
        alert(data.error || "Analysis failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center py-10 px-6 font-sans overflow-x-hidden">
      
      <div className="w-full max-w-6xl">
        
        {/* HEADER */}
        <div className="w-full flex flex-col md:flex-row justify-between items-end mb-10 gap-6 px-4">
          <div className="flex-1">
            {patientId && (
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-indigo-500 mb-2 hover:underline font-bold text-sm">
                <ArrowLeft size={16} /> Return to Profile
              </button>
            )}
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tighter">
              {token && patientId ? "Clinical Diagnostic" : "AI Scan Engine"}
            </h1>
            <p className="text-lg text-gray-500 mt-1 flex items-center gap-2 font-medium">
              {token && patientId ? (
                <><CheckCircle size={18} className="text-emerald-500"/> Direct Link: Patient #{patientId}</>
              ) : (
                <><Globe size={18} className="text-blue-500"/> Public Sandbox Mode</>
              )}
            </p>
          </div>
          <div className="hidden md:block h-[1px] flex-1 bg-gray-200 mb-4 ml-10"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: UPLOAD CONTROL */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-10">
            <div className="w-full h-[400px] bg-white border border-gray-100 rounded-[2.5rem] shadow-sm relative flex items-center justify-center overflow-hidden group">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" alt="MRI Scan Preview" />
              ) : (
                <label className="flex flex-col items-center cursor-pointer p-8 text-center w-full h-full justify-center hover:bg-indigo-50/30 transition-all">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload size={28} className="text-indigo-600" />
                  </div>
                  <span className="text-xl font-black text-gray-900">Select MRI Image</span>
                  <p className="text-gray-400 mt-1 text-sm font-medium">JPG, PNG or DICOM supported</p>
                  <input type="file" className="hidden" onChange={handleFile} accept="image/*" />
                </label>
              )}
              
              {preview && (
                <button 
                  onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-red-500 text-sm font-black shadow-lg hover:bg-red-50 transition-colors"
                >
                  Clear Image
                </button>
              )}
            </div>

            <button
              onClick={runAIAnalysis}
              disabled={!file || loading}
              className="w-full py-5 bg-indigo-600 disabled:bg-gray-300 text-white rounded-2xl font-black text-xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Brain size={24} />}
              {loading ? "Analyzing..." : "Run Analysis"}
            </button>
          </div>

          {/* RIGHT COLUMN: AI INTELLIGENCE RESULTS */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-6"
                >
                  {/* 1. STATISTICAL RESULT CARD */}
                  <div className="p-10 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
                    <div className="mb-8">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Neural Classification</p>
                      <h2 className={`text-5xl font-black leading-none ${result.tumor_type === 'notumor' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {result.tumor_type === 'notumor' ? "Clear / Healthy" : result.tumor_type.toUpperCase()}
                      </h2>
                    </div>

                    <div className="bg-indigo-50/50 p-6 rounded-2xl mb-4 border border-indigo-50">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-indigo-900 font-black">Confidence Score</p>
                        <span className="text-2xl font-black text-indigo-600">
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-indigo-100">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${result.confidence * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-indigo-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. GEMINI REASONING CARD (New!) */}
                  {result.reasoning && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-8 bg-gradient-to-br from-white to-blue-50/30 border border-blue-100 rounded-[2.5rem] shadow-sm relative overflow-hidden"
                    >
                      {/* Decorative sidebar */}
                      <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                      
                      <div className="flex items-center gap-3 mb-6 pl-4">
                        <Sparkles className="text-blue-600 fill-blue-600" size={20} />
                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">
                          AI Clinical Reasoning
                        </h3>
                      </div>

                      <div className="prose prose-sm max-w-none text-gray-700 font-medium leading-relaxed pl-4">
                        <ReactMarkdown 
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-lg font-bold text-gray-900 mt-4 mb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-md font-bold text-gray-800 mt-4 mb-2" {...props} />,
                            strong: ({node, ...props}) => <span className="font-bold text-blue-800" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 mb-4" {...props} />,
                            li: ({node, ...props}) => <li className="text-gray-600" {...props} />,
                          }}
                        >
                          {result.reasoning}
                        </ReactMarkdown>
                      </div>

                      <div className="mt-8 pt-4 border-t border-blue-100 flex items-start gap-3 pl-4">
                        <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-500 font-medium">
                          <span className="font-bold text-gray-700">Disclaimer:</span> This reasoning is generated by an AI model (Gemini) for educational purposes only. It does not replace professional medical diagnosis.
                        </p>
                      </div>
                    </motion.div>
                  )}

                </motion.div>
              ) : (
                <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
                  <div className="p-6 bg-gray-50 rounded-2xl mb-4 text-gray-300">
                    <ImageIcon size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-400">Scanner Idle</h3>
                  <p className="text-gray-400 mt-1 text-sm max-w-[250px]">Upload an MRI scan to begin neural processing.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}