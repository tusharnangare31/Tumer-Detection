import React from "react";
import { motion } from "framer-motion";
import { PieChart, BrainCog, Image as ImageIcon, Database } from "lucide-react";

const datasetStats = {
  total: 7023,
  distribution: {
    Glioma: 1621,
    Meningioma: 1645,
    Pituitary: 1900,
    NoTumor: 1757
  },
  splitRatio: {
    Training: 70,
    Validation: 10,
    Testing: 20
  }
};

export default function Dataset() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto mt-10 px-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-12">
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">Dataset Overview</h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          We use the curated Brain MRI Dataset from Kaggle to train and evaluate our model. It includes thousands of grayscale MRI scans categorized into tumor and non-tumor classes.
        </p>
      </motion.div>

      {/* Statistics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          {
            icon: <Database className="w-8 h-8 text-blue-600" />,
            label: "Total Samples",
            value: datasetStats.total
          },
          {
            icon: <PieChart className="w-8 h-8 text-green-600" />,
            label: "Tumor Types",
            value: "4 Categories"
          },
          {
            icon: <ImageIcon className="w-8 h-8 text-purple-500" />,
            label: "Image Shape",
            value: "128×128 (Grayscale)"
          },
          {
            icon: <BrainCog className="w-8 h-8 text-orange-500" />,
            label: "Classes",
            value: "Glioma, Meningioma, Pituitary, NoTumor"
          }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center"
          >
            {stat.icon}
            <h3 className="mt-3 text-gray-600">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Distribution */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Class Distribution</h3>
          <div className="space-y-4">
            {Object.entries(datasetStats.distribution).map(([category, count]) => (
              <div key={category}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">{category}</span>
                  <span className="text-gray-800 font-medium">{count}</span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / datasetStats.total) * 100}%` }}
                  className="h-2 bg-indigo-500 rounded"
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Data Split</h3>
          <div className="flex h-6 rounded-full overflow-hidden">
            {Object.entries(datasetStats.splitRatio).map(([split, percent], i) => (
              <motion.div
                key={split}
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1, delay: i * 0.2 }}
                className={`${
                  i === 0 ? "bg-blue-500" : i === 1 ? "bg-yellow-500" : "bg-red-500"
                }`}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-center">
            {Object.entries(datasetStats.splitRatio).map(([split, percent], i) => (
              <div key={split}>
                <div
                  className={`w-3 h-3 mx-auto mb-1 rounded-full ${
                    i === 0 ? "bg-blue-500" : i === 1 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                />
                <p className="text-gray-600">{split}</p>
                <p className="font-medium text-gray-800">{percent}%</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Preprocessing Pipeline */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Preprocessing Steps</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            "Grayscale Conversion",
            "Resize to 128×128",
            "Intensity Normalization",
            "Noise Filtering",
            "Data Augmentation",
            "Contrast Enhancement",
            "Rotation & Flip",
            "Image Standardization"
          ].map((step) => (
            <motion.div
              key={step}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-50 p-3 rounded-lg text-center"
            >
              <p className="text-gray-700">{step}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}
