import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Layers,
  Network,
  Activity,
  Zap,
  LineChart,
  Cpu,
  Settings
} from "lucide-react";

// Model architecture details
const modelLayers = [
  {
    name: "Input Layer",
    details: "128×128×3 RGB Image",
    icon: <Brain />,
    color: "blue"
  },
  {
    name: "Conv2D Block 1",
    details: "32 filters, 3×3 kernel, ReLU",
    icon: <Network />,
    color: "indigo"
  },
  {
    name: "MaxPooling2D",
    details: "2×2 pool size",
    icon: <Layers />,
    color: "purple"
  },
  {
    name: "Conv2D Block 2",
    details: "64 filters, 3×3 kernel, ReLU",
    icon: <Network />,
    color: "indigo"
  },
  {
    name: "MaxPooling2D",
    details: "2×2 pool size",
    icon: <Layers />,
    color: "purple"
  },
  {
    name: "Conv2D Block 3",
    details: "128 filters, 3×3 kernel, ReLU",
    icon: <Network />,
    color: "indigo"
  },
  {
    name: "Flatten",
    details: "Converts 3D feature maps to 1D vector",
    icon: <Settings />,
    color: "pink"
  },
  {
    name: "Dense Layer",
    details: "128 neurons, ReLU activation",
    icon: <Cpu />,
    color: "orange"
  },
  {
    name: "Output Layer",
    details: "4 neurons (Softmax)",
    icon: <Activity />,
    color: "green"
  }
];

const modelMetrics = {
  accuracy: 93.5,
  precision: 92.8,
  recall: 91.2,
  f1Score: 92.0,
  trainTime: "1 hours",
  epochs: 10,
  batchSize: 10
};

export default function Model() {
  const [selectedLayer, setSelectedLayer] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto mt-8 px-4"
    >
      {/* Header Section */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-semibold text-blue-700 mb-4">CNN Model Architecture</h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Our Convolutional Neural Network is designed to efficiently process MRI images
          and detect various types of brain tumors with high accuracy.
        </p>
      </motion.div>

      {/* Model Performance Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
      >
        {[
          {
            label: "Accuracy",
            value: `${modelMetrics.accuracy}%`,
            icon: <LineChart className="w-6 h-6 text-green-500" />
          },
          {
            label: "Training Time",
            value: modelMetrics.trainTime,
            icon: <Zap className="w-6 h-6 text-yellow-500" />
          },
          {
            label: "Total Epochs",
            value: modelMetrics.epochs,
            icon: <Activity className="w-6 h-6 text-blue-500" />
          },
          {
            label: "Batch Size",
            value: modelMetrics.batchSize,
            icon: <Layers className="w-6 h-6 text-purple-500" />
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <div className="flex items-center justify-center mb-3">
              {stat.icon}
            </div>
            <h3 className="text-gray-600 text-center">{stat.label}</h3>
            <p className="text-2xl font-bold text-center text-gray-800">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Architecture Visualization */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Layers List */}
        <div className="md:col-span-2">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Layer Architecture</h3>
          <div className="space-y-4">
            {modelLayers.map((layer, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedLayer(layer)}
                className={`
                  cursor-pointer bg-white p-4 rounded-xl shadow-sm
                  border-l-4 border-${layer.color}-500 flex items-center gap-4
                  ${selectedLayer?.name === layer.name ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                <div className={`text-${layer.color}-500`}>{layer.icon}</div>
                <div>
                  <h4 className="font-medium text-gray-800">{layer.name}</h4>
                  <p className="text-sm text-gray-600">{layer.details}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Layer Details Panel */}
        <div className="md:col-span-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Layer Details</h3>
          <AnimatePresence mode="wait">
            {selectedLayer ? (
              <motion.div
                key={selectedLayer.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <div className={`text-${selectedLayer.color}-500 flex justify-center mb-4`}>
                  {selectedLayer.icon}
                </div>
                <h4 className="text-lg font-medium text-center mb-2">{selectedLayer.name}</h4>
                <p className="text-gray-600 text-center">{selectedLayer.details}</p>
                {/* Add more layer-specific details here */}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 p-6 rounded-xl text-center text-gray-500"
              >
                Select a layer to view details
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Model Performance Metrics */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white p-6 rounded-xl shadow-md"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Precision", value: modelMetrics.precision },
            { label: "Recall", value: modelMetrics.recall },
            { label: "F1 Score", value: modelMetrics.f1Score },
            { label: "Accuracy", value: modelMetrics.accuracy }
          ].map((metric, index) => (
            <div key={index} className="text-center">
              <p className="text-gray-600">{metric.label}</p>
              <div className="text-2xl font-bold text-blue-700">{metric.value}%</div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                className="h-1 bg-blue-200 mt-2 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  className="h-full bg-blue-600"
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
