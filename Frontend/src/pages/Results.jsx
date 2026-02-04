import React from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Brain, Target, TrendingUp, AlertTriangle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const modelMetrics = {
  accuracy: 93,
  precision: 92,
  recall: 90,
  f1Score: 91,
  confusionMatrix: {
    labels: ['Glioma', 'Meningioma', 'Pituitary', 'Normal'],
    data: [
      [95, 2, 2, 1],
      [3, 94, 2, 1],
      [2, 1, 96, 1],
      [1, 1, 1, 97]
    ]
  },
  classAccuracy: {
    Glioma: 95,
    Meningioma: 94,
    Pituitary: 96,
    Normal: 97
  },
  errorAnalysis: {
    'False Positives': 25,
    'False Negatives': 18,
    'Misclassifications': 12,
    'Uncertain Cases': 8
  }
};

export default function Results() {
  const barChartData = {
    labels: Object.keys(modelMetrics.classAccuracy),
    datasets: [
      {
        label: 'Accuracy by Class (%)',
        data: Object.values(modelMetrics.classAccuracy),
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(99, 102, 241, 0.6)',
          'rgba(236, 72, 153, 0.6)'
        ]
      }
    ]
  };

  const pieChartData = {
    labels: Object.keys(modelMetrics.errorAnalysis),
    datasets: [
      {
        data: Object.values(modelMetrics.errorAnalysis),
        backgroundColor: [
          'rgba(239, 68, 68, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(147, 51, 234, 0.6)',
          'rgba(75, 85, 99, 0.6)'
        ]
      }
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto mt-8 px-4"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-semibold text-blue-700 mb-4">Model Performance Analysis</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Comprehensive analysis of our CNN model's performance across different tumor types,
          including accuracy metrics and error analysis.
        </p>
      </motion.div>

      {/* Key Metrics Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
      >
        {[
          {
            label: "Overall Accuracy",
            value: `${modelMetrics.accuracy}%`,
            icon: <Brain className="w-6 h-6 text-blue-500" />,
            description: "Across all classes"
          },
          {
            label: "Precision",
            value: `${modelMetrics.precision}%`,
            icon: <Target className="w-6 h-6 text-green-500" />,
            description: "True positives ratio"
          },
          {
            label: "Recall",
            value: `${modelMetrics.recall}%`,
            icon: <TrendingUp className="w-6 h-6 text-purple-500" />,
            description: "Detection rate"
          },
          {
            label: "F1 Score",
            value: `${modelMetrics.f1Score}%`,
            icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
            description: "Balanced accuracy"
          }
        ].map((metric, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <div className="flex items-center justify-center mb-3">
              {metric.icon}
            </div>
            <h3 className="text-gray-600 text-center text-sm">{metric.label}</h3>
            <p className="text-2xl font-bold text-center text-gray-800">{metric.value}</p>
            <p className="text-xs text-gray-500 text-center mt-1">{metric.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Class Accuracy Chart */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Accuracy by Class</h3>
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: { mode: 'index' }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }}
          />
        </motion.div>

        {/* Error Analysis Chart */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Error Distribution</h3>
          <div className="w-3/4 mx-auto">
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12
                    }
                  }
                }
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Confusion Matrix */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white p-6 rounded-xl shadow-md mb-12"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Confusion Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2 bg-gray-50">Predicted →<br/>Actual ↓</th>
                {modelMetrics.confusionMatrix.labels.map((label, i) => (
                  <th key={i} className="p-2 bg-gray-50">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modelMetrics.confusionMatrix.data.map((row, i) => (
                <tr key={i}>
                  <th className="p-2 bg-gray-50">{modelMetrics.confusionMatrix.labels[i]}</th>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`p-2 text-center ${
                        i === j
                          ? 'bg-blue-100 text-blue-800 font-medium'
                          : cell > 0
                          ? 'bg-red-50 text-red-600'
                          : ''
                      }`}
                    >
                      {cell}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
