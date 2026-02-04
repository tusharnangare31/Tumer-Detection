import React, { useState } from "react";
import { predictTumor } from "../services/api";

export default function UploadSection({ setResult }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handlePredict = async () => {
    if (!image) return alert("Please upload an MRI image first!");
    setLoading(true);
    try {
      const res = await predictTumor(image);
      setResult(res.data);
    } catch (err) {
      alert("Error while predicting. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">Upload MRI Image</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full border border-gray-300 rounded-lg p-2"
      />

      {image && (
        <img
          src={URL.createObjectURL(image)}
          alt="Preview"
          className="mt-4 rounded-lg shadow-md"
        />
      )}

      <button
        onClick={handlePredict}
        disabled={loading}
        className="mt-5 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
      >
        {loading ? "Analyzing..." : "Detect Tumor"}
      </button>
    </div>
  );
}
