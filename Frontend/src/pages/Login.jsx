import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LogIn, Lock, User, AlertCircle } from "lucide-react";
import { authAPI } from "../services/api";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");

    if (!formData.username || !formData.password) {
      setErrors("Username and password are required");
      return;
    }

    setLoading(true);

    try {
      // 🔐 LOGIN REQUEST
      const res = await authAPI.login({
        username: formData.username,
        password: formData.password
      });

      const data = res.data;

      // ✅ SAVE TOKENS
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      // 🔔 NOTIFY NAVBAR (IMPORTANT)
      window.dispatchEvent(new Event("authChanged"));

      toast.success("Welcome back! Logged in successfully.");

      // ✅ GO TO HOME PAGE
      navigate("/");

    } catch (err) {
      if (err.response) {
        setErrors("Invalid username or password");
        toast.error("Login failed: Invalid username or password");
      } else {
        setErrors("Server not reachable");
        toast.error("Login failed: Server not reachable");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[80vh] flex items-center justify-center px-4"
    >
      <div className="max-w-md w-full">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Login
          </h2>
          <p className="text-gray-600">
            Authorized medical personnel only
          </p>
        </div>

        {/* FORM */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-lg"
        >
          {errors && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {errors}
            </div>
          )}

          <div className="space-y-6">
            {/* USERNAME */}
            <div>
              <label className="block text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 rounded-lg text-white font-medium
                ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? "Signing in..." : "Login"}
            </motion.button>
          </div>

          {/* REGISTER LINK */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-600 cursor-pointer font-medium"
            >
              Create User
            </span>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
}
