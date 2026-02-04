import React, { useState, useRef } from "react";
import { User, Phone, MapPin, Calendar, Image as ImageIcon, Loader2, Hash, Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreatePatient() {
  const [form, setForm] = useState({
    patient_uid: "",
    full_name: "",
    age: "",
    gender: "Male",
    phone: "",
    address: "",
  });

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMsg({ type: "", text: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const submit = async () => {
    const token = localStorage.getItem("access");
    if (!token) return setMsg({ type: "error", text: "Session expired. Please login." });

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (photo) fd.append("profile_photo", photo);

    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/patients/create/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Validation failed");

      setMsg({ type: "success", text: "Patient record created successfully!" });
      setForm({ patient_uid: "", full_name: "", age: "", gender: "Male", phone: "", address: "" });
      setPhoto(null);
      setPreview(null);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-gray-700";
  const labelStyle = "block text-sm font-semibold text-gray-600 mb-1.5 ml-1";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto bg-white shadow-xl shadow-indigo-100/50 rounded-3xl border border-gray-100 overflow-hidden"
    >
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">New Patient Admission</h1>
          <p className="text-gray-500">Enter clinical details to register a new patient.</p>
        </div>

        <AnimatePresence>
          {msg.text && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
                msg.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
              }`}
            >
              {msg.type === "success" ? <Users size={18} /> : <Hash size={18} />}
              <span className="font-medium">{msg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PATIENT UID */}
          <div className="md:col-span-2">
            <label className={labelStyle}>Patient UID</label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 text-gray-400" size={18} />
              <input name="patient_uid" placeholder="e.g. PAT-9920" value={form.patient_uid} onChange={handleChange} className={inputStyle} />
            </div>
          </div>

          {/* NAME */}
          <div className="md:col-span-2">
            <label className={labelStyle}>Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input name="full_name" placeholder="John Doe" value={form.full_name} onChange={handleChange} className={inputStyle} />
            </div>
          </div>

          {/* AGE */}
          <div>
            <label className={labelStyle}>Age</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
              <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} className={inputStyle} />
            </div>
          </div>

          {/* GENDER */}
          <div>
            <label className={labelStyle}>Gender</label>
            <div className="relative">
              <Users className="absolute left-3 top-3 text-gray-400" size={18} />
              <select name="gender" value={form.gender} onChange={handleChange} className={`${inputStyle} appearance-none`}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* PHONE */}
          <div>
            <label className={labelStyle}>Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
              <input name="phone" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange} className={inputStyle} />
            </div>
          </div>

          {/* PHOTO UPLOAD */}
          <div>
            <label className={labelStyle}>Profile Photo</label>
            <button 
              onClick={() => fileInputRef.current.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border border-dashed border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              {preview ? <img src={preview} className="w-6 h-6 rounded-full object-cover" /> : <ImageIcon size={18} />}
              <span className="text-sm font-semibold">{preview ? "Change Photo" : "Upload Photo"}</span>
            </button>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
          </div>

          {/* ADDRESS */}
          <div className="md:col-span-2">
            <label className={labelStyle}>Residential Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <textarea name="address" rows="2" placeholder="Street, City, State" value={form.address} onChange={handleChange} className={`${inputStyle} pl-10 resize-none`} />
            </div>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : null}
          {loading ? "Registering..." : "Create Patient Record"}
        </button>
      </div>
    </motion.div>
  );
}