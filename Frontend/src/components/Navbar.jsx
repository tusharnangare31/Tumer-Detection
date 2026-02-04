import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, LogOut, UserCircle, Menu as MenuIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateAuthState = () => {
      const token = localStorage.getItem("access");
      setIsLoggedIn(!!token);

      if (token) {
        fetch("http://127.0.0.1:8000/api/auth/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => setUser(data))
          .catch(() => setUser(null));
      } else {
        setUser(null);
      }
    };

    updateAuthState();
    window.addEventListener("authChanged", updateAuthState);

    return () => {
      window.removeEventListener("authChanged", updateAuthState);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.dispatchEvent(new Event("authChanged"));
    setShowMenu(false);
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  const handleDetectionClick = () => {
    setIsMobileMenuOpen(false);
    if (!isLoggedIn) {
      navigate("/upload");
      return;
    }

    if (user?.role === "TECHNICIAN") {
      navigate("/technician");
      return;
    }

    if (user?.role === "DOCTOR") {
      navigate("/doctor");
      return;
    }

    navigate("/");
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="w-full bg-blue-700 text-white shadow-md relative z-[100]">
      <nav className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-3xl font-semibold" onClick={closeMobileMenu}>
          Tumor Detection
        </Link>

        {/* MOBILE TOGGLE BUTTON */}
        <button 
          className="lg:hidden p-2" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
        </button>

        {/* DESKTOP & MOBILE LINKS */}
        <div className={`
          fixed lg:static top-[72px] left-0 w-full lg:w-auto bg-blue-700 lg:bg-transparent
          flex flex-col lg:flex-row items-start lg:items-center 
          space-y-4 lg:space-y-0 lg:space-x-6 p-6 lg:p-0
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <Link to="/" className="hover:text-blue-200" onClick={closeMobileMenu}>Home</Link>

          <button onClick={handleDetectionClick} className="hover:text-blue-200 text-left">
            Detection
          </button>

          {/* PUBLIC LINKS */}
          {!isLoggedIn && (
            <>
              <Link to="/dataset" className="hover:text-blue-200" onClick={closeMobileMenu}>Dataset</Link>
              <Link to="/model" className="hover:text-blue-200" onClick={closeMobileMenu}>Model</Link>
              <Link to="/results" className="hover:text-blue-200" onClick={closeMobileMenu}>Results</Link>
            </>
          )}

          {/* TECHNICIAN LINKS */}
          {isLoggedIn && user?.role === "TECHNICIAN" && (
            <>
              <Link to="/technician" className="hover:text-blue-200" onClick={closeMobileMenu}>Dashboard</Link>
              <Link to="/patients" className="hover:text-blue-200" onClick={closeMobileMenu}>My Patients</Link>
              <Link to="/my-scans" className="hover:text-blue-200" onClick={closeMobileMenu}>My Scans</Link>
            </>
          )}

          {/* DOCTOR LINKS */}
          {isLoggedIn && user?.role === "DOCTOR" && (
            <>
              <Link to="/doctor" className="hover:text-blue-200" onClick={closeMobileMenu}>Dashboard</Link>
              <Link to="/doctor/patients" className="hover:text-blue-200" onClick={closeMobileMenu}>All Patients</Link>
              <Link to="/doctor/scans" className="hover:text-blue-200" onClick={closeMobileMenu}>All Scans</Link>
              <Link to="/doctor/reviews" className="hover:text-blue-200" onClick={closeMobileMenu}>Reviews</Link>
              <Link to="/doctor/reports" className="hover:text-blue-200" onClick={closeMobileMenu}>Reports</Link>
            </>
          )}

          <Link to="/about" className="hover:text-blue-200" onClick={closeMobileMenu}>About</Link>
          <Link to="/contact" className="hover:text-blue-200" onClick={closeMobileMenu}>Contact</Link>

          {!isLoggedIn ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { navigate("/login"); closeMobileMenu(); }}
              className="flex items-center space-x-2 bg-white text-blue-700 px-4 py-2 rounded-lg"
            >
              <LogIn size={18} />
              <span>Login</span>
            </motion.button>
          ) : (
            <div className="relative">
              <UserCircle
                size={34}
                className="cursor-pointer hover:text-blue-200 hidden lg:block"
                onClick={() => setShowMenu(!showMenu)}
              />
              
              {/* MOBILE USER INFO */}
              <div className="lg:hidden border-t border-blue-600 pt-4 w-full">
                <p className="font-semibold">{user?.username}</p>
                <p className="text-xs text-blue-200 mb-4">{user?.role}</p>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-300 hover:text-red-100"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>

              {/* DESKTOP DROPDOWN */}
              {showMenu && user && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-50 hidden lg:block">
                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}