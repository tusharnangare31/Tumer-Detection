import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Activity, AlertCircle } from 'lucide-react';

export default function DetectionHistory({ detections = [] }) {
  if (detections.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No detection history available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {detections.map((detection, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`
                p-2 rounded-full 
                ${detection.result === 'Tumor Detected' 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-green-100 text-green-600'}
              `}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">
                  {detection.patientId || 'Anonymous Patient'}
                </h3>
                <p className={`text-sm ${
                  detection.result === 'Tumor Detected' 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {detection.result}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {detection.date}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {detection.time}
              </div>
            </div>
          </div>
          {detection.confidence && (
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Confidence</span>
                <span className="font-medium">{(detection.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${detection.confidence * 100}%` }}
                  className={`h-2 rounded-full ${
                    detection.confidence > 0.9 
                      ? 'bg-green-500' 
                      : detection.confidence > 0.7 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                  }`}
                />
              </div>
            </div>
          )}
          {detection.notes && (
            <p className="mt-3 text-sm text-gray-600 border-t pt-3">
              {detection.notes}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}