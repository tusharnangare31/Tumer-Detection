import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  Eye,
  AlertCircle,
  ClipboardList,
} from "lucide-react";

export default function DoctorDashboard() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [tumorFilter, setTumorFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Modal
  const [selectedScan, setSelectedScan] = useState(null);

  const fetchScans = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("access");
    if (!token) {
      setError("You are not logged in. Please login again.");
      setLoading(false);
      return;
    }

    try {
      // ✅ Doctor should see all scans
      const res = await fetch("http://127.0.0.1:8000/api/patients/scans/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to load scans");
        setLoading(false);
        return;
      }

      // backend can return { scans: [...] } or directly [...]
      const list = Array.isArray(data) ? data : data.scans;
      setScans(list || []);
    } catch (err) {
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const filteredScans = useMemo(() => {
    let list = [...scans];

    // Search filter (patient UID / name)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => {
        const uid = (s.patient?.patient_uid || "").toLowerCase();
        const name = (s.patient?.full_name || "").toLowerCase();
        return uid.includes(q) || name.includes(q);
      });
    }

    // Tumor filter
    if (tumorFilter !== "ALL") {
      list = list.filter((s) => s.tumor_type === tumorFilter);
    }

    // Status filter
    if (statusFilter !== "ALL") {
      list = list.filter((s) => s.status === statusFilter);
    }

    // Date range filter
    if (fromDate) {
      const from = new Date(fromDate).getTime();
      list = list.filter((s) => {
        const scanDate = new Date(s.scan_date || s.created_at).getTime();
        return scanDate >= from;
      });
    }

    if (toDate) {
      const to = new Date(toDate).getTime();
      list = list.filter((s) => {
        const scanDate = new Date(s.scan_date || s.created_at).getTime();
        return scanDate <= to;
      });
    }

    // newest first
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return list;
  }, [scans, search, tumorFilter, statusFilter, fromDate, toDate]);

  const tumorBadge = (tumor) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold uppercase";
    if (tumor === "glioma") return `${base} bg-red-100 text-red-700`;
    if (tumor === "meningioma") return `${base} bg-purple-100 text-purple-700`;
    if (tumor === "pituitary") return `${base} bg-yellow-100 text-yellow-700`;
    if (tumor === "notumor") return `${base} bg-green-100 text-green-700`;
    return `${base} bg-gray-100 text-gray-700`;
  };

  const statusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    if (status === "PENDING") return `${base} bg-orange-100 text-orange-700`;
    if (status === "COMPLETED") return `${base} bg-blue-100 text-blue-700`;
    if (status === "VERIFIED") return `${base} bg-green-100 text-green-700`;
    return `${base} bg-gray-100 text-gray-700`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Doctor Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          View all patient MRI scans, AI predictions and clinical status.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-5 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl shadow p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Search Patient
            </label>
            <div className="relative mt-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Patient UID / Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Tumor Type */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Tumor Type
            </label>
            <select
              className="w-full mt-1 py-2 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={tumorFilter}
              onChange={(e) => setTumorFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="glioma">Glioma</option>
              <option value="meningioma">Meningioma</option>
              <option value="pituitary">Pituitary</option>
              <option value="notumor">No Tumor</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              className="w-full mt-1 py-2 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </div>

          {/* Refresh */}
          <div className="flex items-end">
            <button
              onClick={fetchScans}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
            >
              Refresh
            </button>
          </div>

          {/* From */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              From Date
            </label>
            <div className="relative mt-1">
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="datetime-local"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
          </div>

          {/* To */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              To Date
            </label>
            <div className="relative mt-1">
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="datetime-local"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          {/* Reset */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch("");
                setTumorFilter("ALL");
                setStatusFilter("ALL");
                setFromDate("");
                setToDate("");
              }}
              className="w-full border border-gray-300 hover:bg-gray-50 py-2 rounded-lg font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              MRI Scan Records
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            Showing: <b>{filteredScans.length}</b>
          </p>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading scans...</div>
        ) : filteredScans.length === 0 ? (
          <div className="text-gray-500">No records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-3 px-2">Patient UID</th>
                  <th className="py-3 px-2">Patient Name</th>
                  <th className="py-3 px-2">Tumor Type</th>
                  <th className="py-3 px-2">Confidence</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Uploaded By</th>
                  <th className="py-3 px-2">Scan Date</th>
                  <th className="py-3 px-2">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredScans.map((scan) => (
                  <tr key={scan.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">
                      {scan.patient?.patient_uid}
                    </td>
                    <td className="py-3 px-2">{scan.patient?.full_name}</td>
                    <td className="py-3 px-2">
                      <span className={tumorBadge(scan.tumor_type)}>
                        {scan.tumor_type}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {scan.confidence !== undefined ? Number(scan.confidence).toFixed(4) : "-"}
                    </td>
                    <td className="py-3 px-2">
                      <span className={statusBadge(scan.status)}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="py-3 px-2">{scan.uploaded_by_username || "-"}</td>
                    <td className="py-3 px-2">
                      {scan.scan_date
                        ? new Date(scan.scan_date).toLocaleString()
                        : new Date(scan.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-2">
                      <button
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                        onClick={() => setSelectedScan(scan)}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedScan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg p-6 relative">
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl"
              onClick={() => setSelectedScan(null)}
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Scan Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 border rounded-xl">
                <p className="text-sm text-gray-500">Patient UID</p>
                <p className="font-semibold">{selectedScan.patient?.patient_uid}</p>
              </div>

              <div className="p-4 border rounded-xl">
                <p className="text-sm text-gray-500">Patient Name</p>
                <p className="font-semibold">{selectedScan.patient?.full_name}</p>
              </div>

              <div className="p-4 border rounded-xl">
                <p className="text-sm text-gray-500">Tumor Type</p>
                <p className="font-semibold uppercase">{selectedScan.tumor_type}</p>
              </div>

              <div className="p-4 border rounded-xl">
                <p className="text-sm text-gray-500">Confidence</p>
                <p className="font-semibold">
                  {selectedScan.confidence !== undefined
                    ? Number(selectedScan.confidence).toFixed(4)
                    : "-"}
                </p>
              </div>
            </div>

            {/* MRI Image */}
            {selectedScan.mri_image_url && (
              <div className="mt-5">
                <p className="font-medium text-gray-800 mb-2">MRI Image</p>
                <a
                  href={selectedScan.mri_image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline text-sm break-all"
                >
                  {selectedScan.mri_image_url}
                </a>

                <div className="mt-3">
                  <img
                    src={selectedScan.mri_image_url}
                    alt="MRI Scan"
                    className="w-full max-h-[420px] object-contain border rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
