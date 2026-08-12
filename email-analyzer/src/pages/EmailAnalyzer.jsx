import React, { useState } from "react";
import logo from "../assets/aiHorizon.png";
import toast from "react-hot-toast";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function EmailAnalyzer() {
  // =================================================
  // STATES
  // =================================================

  const [email, setEmail] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [voiceFile, setVoiceFile] = useState(null);

  const [profileOpen, setProfileOpen] = useState(false);

  const [timeTaken, setTimeTaken] = useState("—");

  const [multiIntent, setMultiIntent] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [multiLingual, setMultiLingual] = useState(null);

  const [approved, setApproved] = useState(false);

  // EDIT MODE
  const [isEditing, setIsEditing] = useState(false);

  // =================================================
  // COST ANALYSIS STATES
  // =================================================

  const [costAnalysisOpen, setCostAnalysisOpen] = useState(false);

  const [costData, setCostData] = useState([]);

  const [costLoading, setCostLoading] = useState(false);

  const [costError, setCostError] = useState("");

  const [expandedCostRow, setExpandedCostRow] = useState(null);

  // =================================================
  // COST ANALYSIS API
  // =================================================

  const COST_ANALYSIS_API =
    "http://localhost:3000/api/email/cost-analysis";

  // =================================================
  // THEME
  // =================================================

  const [lightTheme, setLightTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      return false;
    }

    return true;
  });

  // =================================================
  // USER
  // =================================================

  const [user] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("User parse error:", error);
      return null;
    }
  });

  // =================================================
  // THEME CHANGE
  // =================================================

  const handleThemeChange = () => {
    const newTheme = !lightTheme;

    setLightTheme(newTheme);

    if (newTheme) {
      localStorage.setItem("theme", "light");
    } else {
      localStorage.setItem("theme", "dark");
    }
  };

  // =================================================
  // COST ANALYSIS
  // =================================================

  const handleOpenCostAnalysis = async () => {
    setCostAnalysisOpen(true);
    setProfileOpen(false);
    setExpandedCostRow(null);
    setCostError("");

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      setCostLoading(true);

      const response = await axios.get(COST_ANALYSIS_API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("=================================");
      console.log("COST ANALYSIS RESPONSE:");
      console.log(response.data);
      console.log("=================================");

      // -----------------------------------------------
      // Get actual data
      // -----------------------------------------------

      const responseData = response.data?.data;

      let records = [];

      if (Array.isArray(responseData)) {
        records = responseData;
      } else if (Array.isArray(responseData?.records)) {
        records = responseData.records;
      } else if (Array.isArray(responseData?.costAnalysis)) {
        records = responseData.costAnalysis;
      } else if (Array.isArray(response.data?.records)) {
        records = response.data.records;
      } else if (Array.isArray(response.data?.costAnalysis)) {
        records = response.data.costAnalysis;
      }

      setCostData(records);

      if (!records.length) {
        setCostError("No cost analysis records found.");
      }
    } catch (error) {
      console.error("=================================");
      console.error("COST ANALYSIS ERROR");
      console.error("=================================");
      console.error(error);
      console.error("Response:", error.response?.data);
      console.error("Status:", error.response?.status);
      console.error("=================================");

      setCostError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          "Unable to load cost analysis",
      );
    } finally {
      setCostLoading(false);
    }
  };

  // =================================================
  // CLOSE COST ANALYSIS
  // =================================================

  const handleCloseCostAnalysis = () => {
    setCostAnalysisOpen(false);
    setExpandedCostRow(null);
  };

  // =================================================
  // TOGGLE COST DETAIL
  // =================================================

  const handleCostRowToggle = (index) => {
    if (expandedCostRow === index) {
      setExpandedCostRow(null);
    } else {
      setExpandedCostRow(index);
    }
  };

  // =================================================
  // COST DATA HELPERS
  // =================================================

  const getValue = (object, keys, defaultValue = "—") => {
    if (!object) {
      return defaultValue;
    }

    for (const key of keys) {
      if (
        object[key] !== undefined &&
        object[key] !== null &&
        object[key] !== ""
      ) {
        return object[key];
      }
    }

    return defaultValue;
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleDateString("en-US");
    } catch {
      return String(value);
    }
  };

  const formatNumber = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "—"
    ) {
      return "0";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return String(value);
    }

    return number.toLocaleString("en-US");
  };

  const formatCost = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "—"
    ) {
      return "$0";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return String(value);
    }

    return `$${number.toFixed(4)}`;
  };

  const getDetailRows = (row) => {
    const details =
      row?.details ||
      row?.breakdown ||
      row?.services ||
      row?.cost_breakdown ||
      row?.costBreakdown ||
      [];

    if (Array.isArray(details)) {
      return details;
    }

    if (details && typeof details === "object") {
      return Object.entries(details).map(([service, value]) => {
        if (typeof value === "object" && value !== null) {
          return {
            model_service: service,
            ...value,
          };
        }

        return {
          model_service: service,
          cost: value,
        };
      });
    }

    return [];
  };

  // =================================================
  // EMAIL ANALYSIS
  // =================================================

  const handleAnalysis = async () => {
    // =========================================
    // CHECK EMAIL
    // =========================================

    if (!email.trim()) {
      toast.error("Please enter an email");
      return;
    }

    // =========================================
    // CHECK TOKEN
    // =========================================

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      setLoading(true);

      // =========================================
      // RESET OLD RESPONSE
      // =========================================

      setApproved(false);
      setAiResponse("");
      setTimeTaken("—");

      setMultiIntent(null);
      setSentiment(null);
      setMultiLingual(null);

      setIsEditing(false);

      // =========================================
      // START TIME
      // =========================================

      const startTime = Date.now();

      // =========================================
      // FORM DATA
      // =========================================

      const formData = new FormData();

      formData.append("email", email.trim());

      if (imageFile) {
        formData.append("file", imageFile);
      }

      if (pdfFile) {
        formData.append("file", pdfFile);
      }

      if (voiceFile) {
        formData.append("file", voiceFile);
      }

      // =========================================
      // API CALL
      // =========================================

      const response = await axios.post(
        "http://localhost:3000/api/email/analyze",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // =========================================
      // END TIME
      // =========================================

      const endTime = Date.now();

      const seconds = ((endTime - startTime) / 1000).toFixed(2);

      setTimeTaken(`${seconds}s`);

      // =========================================
      // DEBUG
      // =========================================

      console.log("=================================");
      console.log("FULL BACKEND RESPONSE:");
      console.log(response.data);
      console.log("=================================");

      // =========================================
      // GET BACKEND DATA
      // =========================================

      const data = response.data?.data;

      console.log("DATA:");
      console.log(data);

      // =========================================
      // GET AI RESPONSE
      // =========================================

      const aiResponseData = data?.aiResponse;

      console.log("AI RESPONSE:");
      console.log(aiResponseData);

      // =========================================
      // PYTHON RESPONSE
      // =========================================

      const pythonResponse =
        aiResponseData?.response || aiResponseData || {};

      console.log("PYTHON RESPONSE:");
      console.log(pythonResponse);

      // =========================================
      // GET OUTPUT
      // =========================================

      const output = pythonResponse?.output || "";

      // =========================================
      // GET MULTI INTENT
      // =========================================

      const multiIntentValue =
        pythonResponse?.multi_intent ??
        pythonResponse?.multiIntent ??
        null;

      // =========================================
      // GET SENTIMENT
      // =========================================

      const sentimentValue =
        pythonResponse?.sentiment_analysis ??
        pythonResponse?.sentiment ??
        null;

      // =========================================
      // GET MULTI LINGUAL
      // =========================================

      const multiLingualValue =
        pythonResponse?.multi_lingual ??
        pythonResponse?.multiLingual ??
        null;

      // =========================================
      // DEBUG
      // =========================================

      console.log("=================================");
      console.log("EXTRACTED VALUES:");
      console.log("OUTPUT:", output);
      console.log("MULTI INTENT:", multiIntentValue);
      console.log("SENTIMENT:", sentimentValue);
      console.log("MULTI LINGUAL:", multiLingualValue);
      console.log("=================================");

      // =========================================
      // CHECK OUTPUT
      // =========================================

      if (!output) {
        console.error("AI output not found:", pythonResponse);

        toast.error("AI response not found");
        return;
      }

      // =========================================
      // SET STATES
      // =========================================

      setAiResponse(output);

      setMultiIntent(multiIntentValue);

      setSentiment(sentimentValue);

      setMultiLingual(multiLingualValue);

      toast.success("Email analyzed successfully");
    } catch (error) {
      // =========================================
      // ERROR
      // =========================================

      console.error("=================================");
      console.error("FRONTEND ERROR");
      console.error("=================================");

      console.error("Message:", error.message);

      console.error("Response:", error.response?.data);

      console.error("Status:", error.response?.status);

      console.error("=================================");

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  // =================================================
  // APPROVE
  // =================================================

  const handleApprove = () => {
    if (!aiResponse) {
      toast.error("No AI response to approve");
      return;
    }

    setApproved(true);

    toast.success("Response approved successfully");

    setTimeout(() => {
      setEmail("");
      setAiResponse("");

      setImageFile(null);
      setPdfFile(null);
      setVoiceFile(null);

      setTimeTaken("—");

      setMultiIntent(null);
      setSentiment(null);
      setMultiLingual(null);

      setApproved(false);
    }, 1000);
  };

  // =================================================
  // RESET
  // =================================================

  const handleReset = () => {
    setEmail("");
    setAiResponse("");

    setImageFile(null);
    setPdfFile(null);
    setVoiceFile(null);

    setTimeTaken("—");

    setApproved(false);

    setMultiIntent(null);
    setSentiment(null);
    setMultiLingual(null);

    setIsEditing(false);

    toast.success("Form reset successfully");
  };

  // =================================================
  // COPY
  // =================================================

  const handleCopy = async () => {
    if (!aiResponse) {
      toast.error("No AI response to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(aiResponse);

      toast.success("Response copied");
    } catch (error) {
      console.error("Copy error:", error);

      toast.error("Unable to copy response");
    }
  };

  // =================================================
  // FEEDBACK / EDIT
  // =================================================

  const handleFeedback = () => {
    if (!aiResponse) {
      toast.error("No response available");
      return;
    }

    setIsEditing(true);

    setApproved(false);

    toast("You can now edit the response");
  };

  // =================================================
  // SAVE EDIT
  // =================================================

  const handleSaveEdit = () => {
    if (!aiResponse.trim()) {
      toast.error("Response cannot be empty");
      return;
    }

    setIsEditing(false);

    toast.success("Response updated successfully");
  };

  // =================================================
  // CANCEL EDIT
  // =================================================

  const handleCancelEdit = () => {
    setIsEditing(false);

    toast("Edit cancelled");
  };

  // =================================================
  // LOGOUT
  // =================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // =================================================
  // UI
  // =================================================

  return (
    <div
      className={`
        min-h-screen
        transition-colors
        duration-300
        ${
          lightTheme
            ? "bg-[#f8fafc] text-gray-900"
            : "bg-slate-950 text-slate-100"
        }
      `}
    >
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header
        className={`
          h-20
          px-5
          md:px-8
          lg:px-10
          flex
          items-center
          justify-between
          border-b
          transition-colors
          duration-300
          ${
            lightTheme
              ? "bg-white border-gray-200"
              : "bg-slate-900 border-slate-700"
          }
        `}
      >
        {/* LOGO */}

        <div className="flex items-center">
          <img
            src={logo}
            alt="AI Horizon"
            className="w-32 md:w-36"
          />
        </div>

        {/* TITLE */}

        <h1
          className={`
            hidden
            md:block
            text-2xl
            lg:text-4xl
            font-semibold
            ${lightTheme ? "text-gray-800" : "text-white"}
          `}
        >
          Smart Email Analyzer
        </h1>

        {/* PROFILE */}

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className={`
              flex
              items-center
              gap-3
              rounded-xl
              px-2
              py-2
              transition
              ${lightTheme ? "hover:bg-gray-50" : "hover:bg-slate-800"}
            `}
          >
            {/* PROFILE ICON */}

            <div
              className={`
                w-11
                h-11
                rounded-full
                border
                flex
                items-center
                justify-center
                ${
                  lightTheme
                    ? "bg-white border-gray-200"
                    : "bg-slate-800 border-slate-600"
                }
              `}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className={
                  lightTheme
                    ? "text-gray-700"
                    : "text-slate-200"
                }
              >
                <circle cx="12" cy="8" r="4" />

                <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>
            </div>

            {/* USER INFO */}

            <div className="hidden sm:block text-left">
              <p
                className={`
                  font-semibold
                  text-base
                  ${lightTheme ? "text-[#172b4d]" : "text-white"}
                `}
              >
                {user?.name || "User"}
              </p>

              <p
                className={`
                  text-sm
                  ${lightTheme ? "text-gray-500" : "text-slate-400"}
                `}
              >
                {user?.email || "Email not available"}
              </p>
            </div>

            {/* ARROW */}

            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`
                transition-transform
                duration-200
                ${profileOpen ? "rotate-180" : ""}
                ${lightTheme ? "text-gray-700" : "text-slate-300"}
              `}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* ================================================= */}
          {/* PROFILE DROPDOWN */}
          {/* ================================================= */}

          {profileOpen && (
            <div
              className={`
                absolute
                right-0
                top-[68px]
                w-[330px]
                rounded-[28px]
                shadow-xl
                border
                p-7
                z-50
                ${
                  lightTheme
                    ? "bg-white border-gray-100"
                    : "bg-slate-900 border-slate-700"
                }
              `}
            >
              {/* THEME */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-7
                "
              >
                <div className="flex items-center gap-4">
                  {lightTheme ? (
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#f5b400"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="12" r="4" />

                      <path d="M12 2v2" />
                      <path d="M12 20v2" />
                      <path d="m4.93 4.93 1.41 1.41" />
                      <path d="m17.66 17.66 1.41 1.41" />
                      <path d="M2 12h2" />
                      <path d="M20 12h2" />
                      <path d="m6.34 17.66-1.41 1.41" />
                      <path d="m19.07 4.93-1.41 1.41" />
                    </svg>
                  ) : (
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="1.8"
                    >
                      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z" />
                    </svg>
                  )}

                  <span
                    className={`
                      text-xl
                      font-medium
                      ${lightTheme ? "text-gray-900" : "text-white"}
                    `}
                  >
                    {lightTheme ? "Light Theme" : "Dark Theme"}
                  </span>
                </div>

                {/* TOGGLE */}

                <button
                  type="button"
                  onClick={handleThemeChange}
                  className={`
                    w-[84px]
                    h-[42px]
                    rounded-full
                    p-1
                    flex
                    items-center
                    transition
                    ${
                      lightTheme
                        ? "bg-gray-300 justify-start"
                        : "bg-blue-600 justify-end"
                    }
                  `}
                >
                  <span
                    className="
                      w-[34px]
                      h-[34px]
                      rounded-full
                      bg-white
                      shadow-sm
                    "
                  />
                </button>
              </div>

              {/* ================================================= */}
              {/* COST ANALYSIS */}
              {/* ================================================= */}

              <button
                type="button"
                onClick={handleOpenCostAnalysis}
                className={`
                  w-full
                  flex
                  items-center
                  gap-4
                  text-left
                  py-3
                  px-2
                  mb-4
                  rounded-xl
                  transition
                  ${
                    lightTheme
                      ? "text-[#172b4d] hover:bg-gray-50"
                      : "text-slate-200 hover:bg-slate-800"
                  }
                `}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6" />
                </svg>

                <span className="text-xl font-medium">
                  Cost Analysis
                </span>
              </button>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleLogout}
                className="
                  text-xl
                  text-red-500
                  hover:text-red-600
                  transition
                  px-2
                "
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <main
        className="
          max-w-[1400px]
          mx-auto
          px-5
          md:px-8
          lg:px-10
          py-8
        "
      >
        {/* ================================================= */}
        {/* EMAIL INPUT CARD */}
        {/* ================================================= */}

        <section
          className={`
            rounded-2xl
            border
            shadow-sm
            p-6
            md:p-8
            ${
              lightTheme
                ? "bg-white border-gray-200"
                : "bg-slate-900 border-slate-700"
            }
          `}
        >
          {/* HEADING */}

          <div
            className="
              flex
              items-center
              justify-between
              mb-7
            "
          >
            <h2
              className={`
                text-2xl
                md:text-3xl
                font-semibold
                ${lightTheme ? "text-gray-900" : "text-white"}
              `}
            >
              Enter your E-mail
            </h2>

            <span
              className={`
                text-sm
                font-medium
                ${lightTheme ? "text-gray-700" : "text-slate-300"}
              `}
            >
              Data Source
            </span>
          </div>

          {/* INPUT + UPLOAD */}

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-2
              gap-8
            "
          >
            {/* TEXTAREA */}

            <div>
              <textarea
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter or paste the email"
                className={`
                  w-full
                  h-[300px]
                  md:h-[330px]
                  px-5
                  py-5
                  rounded-xl
                  border
                  outline-none
                  resize-none
                  text-base
                  ${
                    lightTheme
                      ? `
                        border-gray-300
                        bg-white
                        text-gray-800
                        placeholder:text-gray-400
                      `
                      : `
                        border-slate-600
                        bg-slate-800
                        text-white
                        placeholder:text-slate-500
                      `
                  }
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/10
                `}
              />
            </div>

            {/* UPLOAD SECTION */}

            <div className="flex flex-col justify-between">
              {/* IMAGE */}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={
                      lightTheme
                        ? "text-gray-600"
                        : "text-slate-300"
                    }
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                      />

                      <circle
                        cx="8.5"
                        cy="8.5"
                        r="1.5"
                      />

                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>

                  <div>
                    <p
                      className={`
                        font-medium
                        ${
                          lightTheme
                            ? "text-gray-700"
                            : "text-slate-200"
                        }
                      `}
                    >
                      Upload Image
                    </p>

                    <p
                      className={`
                        text-xs
                        ${
                          lightTheme
                            ? "text-gray-500"
                            : "text-slate-400"
                        }
                      `}
                    >
                      PNG, JPG, JPEG - Max 5MB
                    </p>

                    {imageFile && (
                      <p className="text-xs text-blue-600 mt-1">
                        {imageFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <label
                  className={`
                    cursor-pointer
                    border
                    rounded-xl
                    px-5
                    py-2
                    text-sm
                    ${
                      lightTheme
                        ? `
                          border-gray-300
                          text-gray-600
                          hover:bg-gray-50
                        `
                        : `
                          border-slate-600
                          text-slate-300
                          hover:bg-slate-800
                        `
                    }
                  `}
                >
                  Choose File

                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) =>
                      setImageFile(
                        e.target.files?.[0] || null,
                      )
                    }
                  />
                </label>
              </div>

              {/* PDF */}

              <div className="flex items-center justify-between mt-7">
                <div className="flex items-center gap-3">
                  <div
                    className={
                      lightTheme
                        ? "text-gray-600"
                        : "text-slate-300"
                    }
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />

                      <path d="M14 2v6h6" />

                      <path d="M8 13h8M8 17h6" />
                    </svg>
                  </div>

                  <div>
                    <p
                      className={`
                        font-medium
                        ${
                          lightTheme
                            ? "text-gray-700"
                            : "text-slate-200"
                        }
                      `}
                    >
                      Upload PDF
                    </p>

                    <p
                      className={`
                        text-xs
                        ${
                          lightTheme
                            ? "text-gray-500"
                            : "text-slate-400"
                        }
                      `}
                    >
                      PDF files only - Max 10MB
                    </p>

                    {pdfFile && (
                      <p className="text-xs text-blue-600 mt-1">
                        {pdfFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <label
                  className={`
                    cursor-pointer
                    border
                    rounded-xl
                    px-5
                    py-2
                    text-sm
                    ${
                      lightTheme
                        ? `
                          border-gray-300
                          text-gray-600
                          hover:bg-gray-50
                        `
                        : `
                          border-slate-600
                          text-slate-300
                          hover:bg-slate-800
                        `
                    }
                  `}
                >
                  Choose File

                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) =>
                      setPdfFile(
                        e.target.files?.[0] || null,
                      )
                    }
                  />
                </label>
              </div>

              {/* VOICE */}

              <div className="flex items-center justify-between mt-7">
                <div className="flex items-center gap-3">
                  <div
                    className={
                      lightTheme
                        ? "text-gray-600"
                        : "text-slate-300"
                    }
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <rect
                        x="9"
                        y="2"
                        width="6"
                        height="13"
                        rx="3"
                      />

                      <path d="M5 11a7 7 0 0 0 14 0" />

                      <path d="M12 18v4" />

                      <path d="M8 22h8" />
                    </svg>
                  </div>

                  <div>
                    <p
                      className={`
                        font-medium
                        ${
                          lightTheme
                            ? "text-gray-700"
                            : "text-slate-200"
                        }
                      `}
                    >
                      Upload Voice
                    </p>

                    <p
                      className={`
                        text-xs
                        ${
                          lightTheme
                            ? "text-gray-500"
                            : "text-slate-400"
                        }
                      `}
                    >
                      MP3/WAV - Max 15MB
                    </p>

                    {voiceFile && (
                      <p className="text-xs text-blue-600 mt-1">
                        {voiceFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <label
                  className={`
                    cursor-pointer
                    border
                    rounded-xl
                    px-5
                    py-2
                    text-sm
                    ${
                      lightTheme
                        ? `
                          border-gray-300
                          text-gray-600
                          hover:bg-gray-50
                        `
                        : `
                          border-slate-600
                          text-slate-300
                          hover:bg-slate-800
                        `
                    }
                  `}
                >
                  Choose File

                  <input
                    type="file"
                    accept=".mp3,.wav"
                    className="hidden"
                    onChange={(e) =>
                      setVoiceFile(
                        e.target.files?.[0] || null,
                      )
                    }
                  />
                </label>
              </div>

              {/* ANALYSIS INFO */}

              <div className="grid grid-cols-2 gap-5 mt-12">
                {/* LEFT */}

                <div className="space-y-5">
                  <p
                    className={`text-sm ${
                      lightTheme
                        ? "text-gray-700"
                        : "text-slate-300"
                    }`}
                  >
                    <span className="font-medium">
                      Multi-Intent identification:
                    </span>{" "}
                    <strong>
                      {multiIntent !== null &&
                      multiIntent !== undefined &&
                      multiIntent !== ""
                        ? String(multiIntent)
                        : "—"}
                    </strong>
                  </p>

                  <p
                    className={`text-sm ${
                      lightTheme
                        ? "text-gray-700"
                        : "text-slate-300"
                    }`}
                  >
                    <span className="font-medium">
                      Multi-lingual:
                    </span>{" "}
                    <strong>
                      {multiLingual !== null &&
                      multiLingual !== undefined &&
                      multiLingual !== ""
                        ? String(multiLingual)
                        : "—"}
                    </strong>
                  </p>
                </div>

                {/* RIGHT */}

                <div className="space-y-5">
                  <p
                    className={`text-sm ${
                      lightTheme
                        ? "text-gray-700"
                        : "text-slate-300"
                    }`}
                  >
                    <span className="font-medium">
                      Sentiment Analysis:
                    </span>{" "}
                    <strong>
                      {sentiment !== null &&
                      sentiment !== undefined &&
                      sentiment !== ""
                        ? String(sentiment)
                        : "—"}
                    </strong>
                  </p>

                  <p
                    className={`text-sm ${
                      lightTheme
                        ? "text-gray-700"
                        : "text-slate-300"
                    }`}
                  >
                    <span className="font-medium">
                      Time Taken:
                    </span>{" "}
                    {timeTaken}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BUTTONS */}

          <div className="flex justify-end gap-4 mt-8">
            {/* RESET */}

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className={`
                px-7
                h-12
                rounded-xl
                border
                font-medium
                transition
                flex
                items-center
                gap-2
                disabled:opacity-50
                disabled:cursor-not-allowed
                ${
                  lightTheme
                    ? `
                      border-gray-300
                      bg-white
                      text-gray-700
                      hover:bg-gray-50
                    `
                    : `
                      border-slate-600
                      bg-slate-800
                      text-slate-200
                      hover:bg-slate-700
                    `
                }
              `}
            >
              <span className="text-lg">↻</span>
              Reset
            </button>

            {/* GENERATE */}

            <button
              type="button"
              onClick={handleAnalysis}
              disabled={loading}
              className="
                px-8
                h-12
                rounded-xl
                bg-blue-600
                text-white
                font-medium
                hover:bg-blue-700
                disabled:opacity-60
                disabled:cursor-not-allowed
                transition
              "
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </section>

        {/* ================================================= */}
        {/* AI RESPONSE */}
        {/* ================================================= */}

        <section
          className={`
            rounded-2xl
            border
            shadow-sm
            p-6
            md:p-8
            mt-7
            ${
              lightTheme
                ? "bg-white border-gray-200"
                : "bg-slate-900 border-slate-700"
            }
          `}
        >
          {/* RESPONSE HEADER */}

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              justify-between
              gap-4
              mb-6
            "
          >
            <h2
              className={`
                text-2xl
                md:text-3xl
                font-semibold
                ${lightTheme ? "text-gray-900" : "text-white"}
              `}
            >
              AI Response
            </h2>

            <div className="flex items-center gap-6">
              {/* FEEDBACK */}

              <button
                type="button"
                onClick={handleFeedback}
                disabled={!aiResponse || isEditing}
                className={`
                  flex
                  items-center
                  gap-2
                  text-sm
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  ${
                    lightTheme
                      ? "text-gray-500 hover:text-gray-700"
                      : "text-slate-400 hover:text-slate-200"
                  }
                `}
              >
                {isEditing
                  ? "Editing response..."
                  : "Didn't like the response?"}
              </button>

              {/* COPY */}

              <button
                type="button"
                onClick={handleCopy}
                disabled={!aiResponse || isEditing}
                className={`
                  flex
                  items-center
                  gap-2
                  text-sm
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  ${
                    lightTheme
                      ? "text-gray-600 hover:text-gray-900"
                      : "text-slate-400 hover:text-white"
                  }
                `}
              >
                Copy
              </button>
            </div>
          </div>

          {/* RESPONSE BOX */}

          <div
            className={`
              w-full
              min-h-[280px]
              rounded-xl
              border
              p-6
              overflow-auto
              ${
                lightTheme
                  ? `
                    border-gray-200
                    bg-[#f8fafc]
                  `
                  : `
                    border-slate-700
                    bg-slate-800
                  `
              }
            `}
          >
            {aiResponse ? (
              isEditing ? (
                <div className="space-y-5">
                  <textarea
                    value={aiResponse}
                    onChange={(e) =>
                      setAiResponse(e.target.value)
                    }
                    className={`
                      w-full
                      min-h-[380px]
                      p-5
                      rounded-xl
                      border
                      outline-none
                      resize-y
                      leading-7
                      text-base
                      ${
                        lightTheme
                          ? `
                            bg-white
                            text-gray-800
                            border-gray-300
                          `
                          : `
                            bg-slate-900
                            text-slate-100
                            border-slate-600
                          `
                      }
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-500/10
                    `}
                  />

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className={`
                        px-5
                        py-2.5
                        rounded-xl
                        border
                        font-medium
                        transition
                        ${
                          lightTheme
                            ? `
                              border-gray-300
                              bg-white
                              text-gray-700
                              hover:bg-gray-50
                            `
                            : `
                              border-slate-600
                              bg-slate-800
                              text-slate-200
                              hover:bg-slate-700
                            `
                        }
                      `}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="
                        px-5
                        py-2.5
                        rounded-xl
                        bg-blue-600
                        text-white
                        font-medium
                        hover:bg-blue-700
                        transition
                      "
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`
                    leading-7
                    ${
                      lightTheme
                        ? "text-gray-800"
                        : "text-slate-200"
                    }
                  `}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-4">{children}</p>
                      ),

                      strong: ({ children }) => (
                        <strong className="font-bold">
                          {children}
                        </strong>
                      ),

                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mb-4">
                          {children}
                        </h1>
                      ),

                      h2: ({ children }) => (
                        <h2 className="text-xl font-bold mb-3">
                          {children}
                        </h2>
                      ),

                      h3: ({ children }) => (
                        <h3 className="text-lg font-bold mb-2">
                          {children}
                        </h3>
                      ),

                      ol: ({ children }) => (
                        <ol className="list-decimal ml-6 mb-4 space-y-2">
                          {children}
                        </ol>
                      ),

                      ul: ({ children }) => (
                        <ul className="list-disc ml-6 mb-4 space-y-2">
                          {children}
                        </ul>
                      ),

                      li: ({ children }) => (
                        <li className="mb-2">{children}</li>
                      ),
                    }}
                  >
                    {aiResponse}
                  </ReactMarkdown>
                </div>
              )
            ) : (
              <p
                className={
                  lightTheme
                    ? "text-gray-500"
                    : "text-slate-500"
                }
              >
                Generated summary
              </p>
            )}
          </div>

          {/* BOTTOM SECTION */}

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-5
              mt-8
            "
          >
            <div
              className={`
                text-lg
                ${
                  lightTheme
                    ? "text-[#526581]"
                    : "text-slate-400"
                }
              `}
            >
              Time Taken: {timeTaken}
            </div>

            <button
              type="button"
              onClick={handleApprove}
              disabled={
                !aiResponse || approved || isEditing
              }
              className={`
                h-16
                px-8
                rounded-2xl
                border
                text-lg
                font-medium
                flex
                items-center
                gap-4
                transition
                disabled:cursor-not-allowed
                ${
                  approved
                    ? `
                      border-green-200
                      bg-green-50
                      text-green-600
                    `
                    : lightTheme
                      ? `
                      border-slate-200
                      bg-white
                      text-slate-500
                      hover:bg-slate-50
                    `
                      : `
                      border-slate-600
                      bg-slate-800
                      text-slate-300
                      hover:bg-slate-700
                    `
                }
              `}
            >
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 10v12" />

                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
              </svg>

              {approved
                ? "Approved"
                : "Approve the response"}
            </button>
          </div>
        </section>
      </main>

      {/* ================================================= */}
      {/* COST ANALYSIS MODAL */}
      {/* ================================================= */}

      {costAnalysisOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-black/60
            flex
            items-center
            justify-center
            p-2
            md:p-4
          "
          onClick={handleCloseCostAnalysis}
        >
          <div
            className={`
              relative
              w-full
              max-w-[1560px]
              h-[95vh]
              rounded-[28px]
              overflow-hidden
              shadow-2xl
              border
              flex
              flex-col
              ${
                lightTheme
                  ? "bg-white border-gray-200"
                  : "bg-slate-900 border-slate-700"
              }
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ================================================= */}
            {/* MODAL HEADER */}
            {/* ================================================= */}

            <div
              className={`
                flex
                items-center
                justify-between
                px-7
                md:px-10
                py-6
                border-b
                ${
                  lightTheme
                    ? "border-gray-200 bg-white"
                    : "border-slate-700 bg-slate-900"
                }
              `}
            >
              <div className="flex items-center gap-4">
                {/* DOLLAR ICON */}

                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f5b400"
                  strokeWidth="1.8"
                >
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6" />
                </svg>

                <h2
                  className={`
                    text-2xl
                    md:text-3xl
                    font-medium
                    ${
                      lightTheme
                        ? "text-[#172b4d]"
                        : "text-white"
                    }
                  `}
                >
                  Cost Analysis
                </h2>
              </div>

              {/* X BUTTON */}

              <button
                type="button"
                onClick={handleCloseCostAnalysis}
                className={`
                  p-2
                  rounded-lg
                  transition
                  ${
                    lightTheme
                      ? "text-slate-500 hover:bg-gray-100 hover:text-slate-800"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6 6 18" />
                </svg>
              </button>
            </div>

            {/* ================================================= */}
            {/* MODAL BODY */}
            {/* ================================================= */}

            <div
              className={`
                flex-1
                overflow-y-auto
                px-5
                md:px-9
                py-7
                ${
                  lightTheme
                    ? "bg-white"
                    : "bg-slate-900"
                }
              `}
            >
              {costLoading ? (
                <div className="min-h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className="
                        w-10
                        h-10
                        border-4
                        border-blue-200
                        border-t-blue-600
                        rounded-full
                        animate-spin
                      "
                    />

                    <p
                      className={
                        lightTheme
                          ? "text-gray-500"
                          : "text-slate-400"
                      }
                    >
                      Loading cost analysis...
                    </p>
                  </div>
                </div>
              ) : costError ? (
                <div className="min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-red-500 text-lg mb-3">
                      {costError}
                    </p>

                    <button
                      type="button"
                      onClick={handleOpenCostAnalysis}
                      className="
                        px-5
                        py-2.5
                        rounded-xl
                        bg-blue-600
                        text-white
                        hover:bg-blue-700
                      "
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  {/* ================================================= */}
                  {/* TABLE */}
                  {/* ================================================= */}

                  <div
                    className={`
                      w-full
                      min-w-[900px]
                      ${
                        lightTheme
                          ? "text-[#27364d]"
                          : "text-slate-200"
                      }
                    `}
                  >
                    {/* TABLE HEADER */}

                    <div
                      className={`
                        grid
                        grid-cols-[1.1fr_1.8fr_1fr_1fr_1fr_80px]
                        items-center
                        px-5
                        py-5
                        border-b
                        font-semibold
                        text-lg
                        ${
                          lightTheme
                            ? "border-gray-200 text-[#526075]"
                            : "border-slate-700 text-slate-300"
                        }
                      `}
                    >
                      <div>Date</div>

                      <div>User</div>

                      <div>Status</div>

                      <div>Tokens</div>

                      <div>Cost</div>

                      <div>Details</div>
                    </div>

                    {/* ================================================= */}
                    {/* ROWS */}
                    {/* ================================================= */}

                    {costData.length > 0 ? (
                      costData.map((row, index) => {
                        const date = getValue(
                          row,
                          [
                            "date",
                            "created_at",
                            "createdAt",
                            "timestamp",
                          ],
                        );

                        const userName = getValue(
                          row,
                          [
                            "user_name",
                            "userName",
                            "name",
                            "username",
                          ],
                          user?.name || "User",
                        );

                        const userEmail = getValue(
                          row,
                          [
                            "user_email",
                            "userEmail",
                            "email",
                          ],
                          user?.email || "",
                        );

                        const status = getValue(
                          row,
                          ["status"],
                          "success",
                        );

                        const totalTokens = getValue(
                          row,
                          [
                            "total_tokens",
                            "totalTokens",
                            "tokens",
                            "token_count",
                          ],
                          0,
                        );

                        const totalCost = getValue(
                          row,
                          [
                            "cost",
                            "total_cost",
                            "totalCost",
                            "total_cost_usd",
                          ],
                          0,
                        );

                        const detailRows =
                          getDetailRows(row);

                        const isExpanded =
                          expandedCostRow === index;

                        return (
                          <React.Fragment key={index}>
                            {/* MAIN ROW */}

                            <div
                              className={`
                                grid
                                grid-cols-[1.1fr_1.8fr_1fr_1fr_1fr_80px]
                                items-center
                                px-5
                                min-h-[105px]
                                border-b
                                transition
                                ${
                                  lightTheme
                                    ? `
                                      border-gray-100
                                      hover:bg-gray-50
                                      ${
                                        isExpanded
                                          ? "bg-[#f8fafc]"
                                          : ""
                                      }
                                    `
                                    : `
                                      border-slate-800
                                      hover:bg-slate-800/70
                                      ${
                                        isExpanded
                                          ? "bg-slate-800"
                                          : ""
                                      }
                                    `
                                }
                              `}
                            >
                              {/* DATE */}

                              <div className="text-base md:text-lg">
                                {formatDate(date)}
                              </div>

                              {/* USER */}

                              <div>
                                <p
                                  className={`
                                    font-semibold
                                    text-base
                                    md:text-lg
                                    ${
                                      lightTheme
                                        ? "text-[#27364d]"
                                        : "text-white"
                                    }
                                  `}
                                >
                                  {userName}
                                </p>

                                {userEmail &&
                                  userEmail !== "—" && (
                                    <p
                                      className={`
                                        text-sm
                                        md:text-base
                                        ${
                                          lightTheme
                                            ? "text-gray-500"
                                            : "text-slate-400"
                                        }
                                      `}
                                    >
                                      {userEmail}
                                    </p>
                                  )}
                              </div>

                              {/* STATUS */}

                              <div className="text-base md:text-lg">
                                {status}
                              </div>

                              {/* TOKENS */}

                              <div className="text-base md:text-lg">
                                {formatNumber(totalTokens)}
                              </div>

                              {/* COST */}

                              <div
                                className="
                                  text-base
                                  md:text-lg
                                  font-mono
                                "
                              >
                                {formatCost(totalCost)}
                              </div>

                              {/* DETAILS BUTTON */}

                              <div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCostRowToggle(
                                      index,
                                    )
                                  }
                                  className={`
                                    p-2
                                    rounded-lg
                                    transition
                                    ${
                                      lightTheme
                                        ? "text-[#27364d] hover:bg-gray-100"
                                        : "text-slate-200 hover:bg-slate-700"
                                    }
                                  `}
                                >
                                  {isExpanded ? (
                                    <svg
                                      width="25"
                                      height="25"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="m6 15 6-6 6 6" />
                                    </svg>
                                  ) : (
                                    <svg
                                      width="25"
                                      height="25"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="m9 18 6-6-6-6" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* ================================================= */}
                            {/* EXPANDED DETAILS */}
                            {/* ================================================= */}

                            {isExpanded && (
                              <div
                                className={`
                                  px-3
                                  md:px-5
                                  py-0
                                  ${
                                    lightTheme
                                      ? "bg-[#f8fafc]"
                                      : "bg-slate-800"
                                  }
                                `}
                              >
                                <div
                                  className={`
                                    w-full
                                    overflow-x-auto
                                    ${
                                      lightTheme
                                        ? "bg-[#f8fafc]"
                                        : "bg-slate-800"
                                    }
                                  `}
                                >
                                  <div className="min-w-[850px]">
                                    {/* DETAIL HEADER */}

                                    <div
                                      className={`
                                        grid
                                        grid-cols-[2fr_1.2fr_1.2fr_1.2fr_1fr]
                                        items-center
                                        px-2
                                        py-5
                                        border-b
                                        font-semibold
                                        ${
                                          lightTheme
                                            ? "border-gray-300 text-[#667085]"
                                            : "border-slate-600 text-slate-300"
                                        }
                                      `}
                                    >
                                      <div>
                                        Model / Service
                                      </div>

                                      <div>
                                        Input Tokens
                                      </div>

                                      <div>
                                        Output Tokens
                                      </div>

                                      <div>
                                        Total Tokens
                                      </div>

                                      <div>Cost</div>
                                    </div>

                                    {/* DETAIL ROWS */}

                                    {detailRows.length > 0 ? (
                                      detailRows.map(
                                        (
                                          detail,
                                          detailIndex,
                                        ) => {
                                          const modelService =
                                            getValue(
                                              detail,
                                              [
                                                "model_service",
                                                "modelService",
                                                "model",
                                                "service",
                                                "name",
                                              ],
                                              "—",
                                            );

                                          const inputTokens =
                                            getValue(
                                              detail,
                                              [
                                                "input_tokens",
                                                "inputTokens",
                                                "prompt_tokens",
                                                "promptTokens",
                                              ],
                                              0,
                                            );

                                          const outputTokens =
                                            getValue(
                                              detail,
                                              [
                                                "output_tokens",
                                                "outputTokens",
                                                "completion_tokens",
                                                "completionTokens",
                                              ],
                                              0,
                                            );

                                          const detailTotalTokens =
                                            getValue(
                                              detail,
                                              [
                                                "total_tokens",
                                                "totalTokens",
                                              ],
                                              Number(
                                                inputTokens,
                                              ) +
                                                Number(
                                                  outputTokens,
                                                ),
                                            );

                                          const detailCost =
                                            getValue(
                                              detail,
                                              [
                                                "cost",
                                                "total_cost",
                                                "totalCost",
                                              ],
                                              0,
                                            );

                                          return (
                                            <div
                                              key={
                                                detailIndex
                                              }
                                              className={`
                                                grid
                                                grid-cols-[2fr_1.2fr_1.2fr_1.2fr_1fr]
                                                items-center
                                                px-2
                                                py-3
                                                border-b
                                                ${
                                                  lightTheme
                                                    ? "border-gray-200 text-[#475467]"
                                                    : "border-slate-700 text-slate-300"
                                                }
                                              `}
                                            >
                                              <div className="font-medium">
                                                {
                                                  modelService
                                                }
                                              </div>

                                              <div>
                                                {formatNumber(
                                                  inputTokens,
                                                )}
                                              </div>

                                              <div>
                                                {formatNumber(
                                                  outputTokens,
                                                )}
                                              </div>

                                              <div>
                                                {formatNumber(
                                                  detailTotalTokens,
                                                )}
                                              </div>

                                              <div className="font-mono">
                                                {formatCost(
                                                  detailCost,
                                                )}
                                              </div>
                                            </div>
                                          );
                                        },
                                      )
                                    ) : (
                                      <div
                                        className={`
                                          py-8
                                          text-center
                                          ${
                                            lightTheme
                                              ? "text-gray-500"
                                              : "text-slate-400"
                                          }
                                        `}
                                      >
                                        No detailed cost
                                        information
                                        available.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <div
                        className={`
                          py-20
                          text-center
                          text-lg
                          ${
                            lightTheme
                              ? "text-gray-500"
                              : "text-slate-400"
                          }
                        `}
                      >
                        No cost analysis records found.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ================================================= */}
            {/* MODAL FOOTER */}
            {/* ================================================= */}

            <div
              className={`
                flex
                justify-end
                px-7
                md:px-8
                py-5
                border-t
                ${
                  lightTheme
                    ? "border-gray-200 bg-white"
                    : "border-slate-700 bg-slate-900"
                }
              `}
            >
              <button
                type="button"
                onClick={handleCloseCostAnalysis}
                className={`
                  px-7
                  py-3.5
                  rounded-2xl
                  font-medium
                  text-lg
                  transition
                  ${
                    lightTheme
                      ? `
                        bg-[#e7eaee]
                        text-[#173052]
                        hover:bg-[#dce0e5]
                      `
                      : `
                        bg-slate-700
                        text-white
                        hover:bg-slate-600
                      `
                  }
                `}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailAnalyzer;