import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/aiHorizon.png";
import { registerUser } from "../api/authApi";
import toast from "react-hot-toast";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // =================================================
  // THEME STATE
  // =================================================
  const [lightTheme, setLightTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme !== "dark";
  });

  const handleThemeChange = () => {
    const newTheme = !lightTheme;
    setLightTheme(newTheme);
    localStorage.setItem("theme", newTheme ? "light" : "dark");
  };

  const handleSignup = async () => {
    try {
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        toast.error("Please fill all fields");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      setLoading(true);
      const result = await registerUser(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword
      );

      console.log("Signup response:", result);

      if (result.success) {
        if (result.token) {
          localStorage.setItem("token", result.token);
        }
        if (result.data) {
          localStorage.setItem("user", JSON.stringify(result.data));
        }
        toast.success(result.message || "Account created successfully");
        navigate("/analyzer");
      } else {
        toast.error(result.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-200 relative ${
        lightTheme ? "bg-[#eef3f9]" : "bg-slate-950"
      }`}
    >
      {/* THEME TOGGLE BUTTON (TOP RIGHT) */}
      <div className="absolute top-6 right-6 z-50">
        <button
          type="button"
          onClick={handleThemeChange}
          className={`p-3 rounded-2xl border shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center ${
            lightTheme
              ? "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-gray-200/50"
              : "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700"
          }`}
          title={lightTheme ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {lightTheme ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>
      </div>

      {/* LEFT SIDE */}
      <div
        className={`w-full lg:w-1/2 min-h-screen relative px-10 md:px-16 py-10 flex flex-col justify-between transition-colors duration-200 ${
          lightTheme ? "bg-[#f4f7fb]" : "bg-slate-900 border-r border-slate-800"
        }`}
      >
        {/* Logo - Top Left */}
        <div>
          <img src={logo} alt="AI Horizon" className="w-52 md:w-60" />
        </div>

        {/* Left Content */}
        <div className="py-12">
          <div className="max-w-xl">
            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight ${
                lightTheme ? "text-[#1f2937]" : "text-white"
              }`}
            >
              Smart Email
              <br />
              Analyzer Platform
            </h1>

            <p
              className={`mt-6 text-lg md:text-xl leading-relaxed max-w-lg ${
                lightTheme ? "text-[#6b7c93]" : "text-slate-400"
              }`}
            >
              AI powered email summarization, sentiment analysis and
              multi-intent identification platform for modern teams.
            </p>
          </div>
        </div>

        {/* Bottom AI Horizon Card */}
        <div>
          <div
            className={`rounded-2xl p-5 flex items-center transition-colors duration-200 ${
              lightTheme
                ? "bg-[#e5ebf3]"
                : "bg-slate-800/80 border border-slate-700"
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold shadow-md">
              AI
            </div>

            <div className="ml-4">
              <h3
                className={`text-lg font-semibold ${
                  lightTheme ? "text-[#1f2937]" : "text-white"
                }`}
              >
                AI Horizon
              </h3>

              <p
                className={`text-base ${
                  lightTheme ? "text-[#6b7c93]" : "text-slate-400"
                }`}
              >
                Secure AI Workflow
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - SIGNUP */}
      <div
        className={`w-full lg:w-1/2 min-h-screen flex items-center justify-center px-6 md:px-10 py-12 transition-colors duration-200 ${
          lightTheme ? "bg-white" : "bg-slate-950"
        }`}
      >
        <div className="w-full max-w-md">
          <h1
            className={`text-3xl md:text-4xl font-semibold text-center mb-8 ${
              lightTheme ? "text-[#1f2937]" : "text-white"
            }`}
          >
            Create Account
          </h1>

          {/* Full Name */}
          <div className="mb-4">
            <label
              className={`block text-base font-medium mb-1.5 ${
                lightTheme ? "text-[#1f2937]" : "text-slate-200"
              }`}
            >
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className={`w-full h-13 px-5 rounded-2xl outline-none text-sm transition-colors ${
                lightTheme
                  ? "bg-[#f4f7fb] text-[#1f2937] placeholder:text-gray-400 border border-transparent focus:border-blue-500/30 focus:ring-2 focus:ring-blue-500/20"
                  : "bg-slate-800 text-white placeholder:text-slate-500 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              }`}
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label
              className={`block text-base font-medium mb-1.5 ${
                lightTheme ? "text-[#1f2937]" : "text-slate-200"
              }`}
            >
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              className={`w-full h-13 px-5 rounded-2xl outline-none text-sm transition-colors ${
                lightTheme
                  ? "bg-[#f4f7fb] text-[#1f2937] placeholder:text-gray-400 border border-transparent focus:border-blue-500/30 focus:ring-2 focus:ring-blue-500/20"
                  : "bg-slate-800 text-white placeholder:text-slate-500 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              }`}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label
              className={`block text-base font-medium mb-1.5 ${
                lightTheme ? "text-[#1f2937]" : "text-slate-200"
              }`}
            >
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }
              className={`w-full h-13 px-5 rounded-2xl outline-none text-sm transition-colors ${
                lightTheme
                  ? "bg-[#f4f7fb] text-[#1f2937] placeholder:text-gray-400 border border-transparent focus:border-blue-500/30 focus:ring-2 focus:ring-blue-500/20"
                  : "bg-slate-800 text-white placeholder:text-slate-500 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              }`}
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label
              className={`block text-base font-medium mb-1.5 ${
                lightTheme ? "text-[#1f2937]" : "text-slate-200"
              }`}
            >
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  confirmPassword: e.target.value,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSignup();
              }}
              className={`w-full h-13 px-5 rounded-2xl outline-none text-sm transition-colors ${
                lightTheme
                  ? "bg-[#f4f7fb] text-[#1f2937] placeholder:text-gray-400 border border-transparent focus:border-blue-500/30 focus:ring-2 focus:ring-blue-500/20"
                  : "bg-slate-800 text-white placeholder:text-slate-500 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              }`}
            />
          </div>

          {/* Create Account Button */}
          <button
            type="button"
            onClick={handleSignup}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {/* Login Link */}
          <p
            className={`text-center mt-6 text-sm ${
              lightTheme ? "text-gray-500" : "text-slate-400"
            }`}
          >
            Already have an Account?{" "}
            <Link
              to="/login"
              className="ml-2 text-blue-500 hover:text-blue-400 font-medium underline underline-offset-2 transition"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;