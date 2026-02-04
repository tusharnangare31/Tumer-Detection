import React from "react";

export default function ResultCard({ result }) {
  return (
    <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg max-w-md w-full text-center">
      <h2 className="text-xl font-semibold mb-3">🩺 Prediction Result</h2>
      <p className="text-lg font-medium">
        {result?.tumor_detected
          ? `Tumor Detected: ${result.tumor_type}`
          : "No Tumor Detected"}
      </p>
      {result?.confidence && (
        <p className="text-sm text-gray-600 mt-2">
          Confidence: {(result.confidence * 100).toFixed(2)}%
        </p>
      )}
    </div>
  );
}
