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
        }
      );

      // =========================================
      // END TIME
      // =========================================

      const endTime = Date.now();

      const seconds = ((endTime - startTime) / 1000).toFixed(2);

      setTimeTaken(`${seconds}s`);

      // =========================================
      // DEBUG - FULL BACKEND RESPONSE
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
      // ACTUAL PYTHON RESPONSE
      // =========================================

      /*
        Tumhara actual Python response:

        {
          response: {
            status: "success",
            email_content: "...",
            multi_intent: "No",
            multi_lingual: "No",
            detected_language: null,
            detected_category: "General",
            sentiment_analysis: "Normal",
            output: "Dear Customer..."
          }
        }
      */

      const pythonResponse =
        aiResponseData?.response ||
        aiResponseData ||
        {};

      console.log("PYTHON RESPONSE:");
      console.log(pythonResponse);

      // =========================================
      // GET OUTPUT
      // =========================================

      const output =
        pythonResponse?.output ||
        "";

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
      // DEBUG EXTRACTED VALUES
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
        console.error(
          "AI output not found:",
          pythonResponse
        );

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

      console.error(
        "Response:",
        error.response?.data
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error("=================================");

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          "Something went wrong"
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
  // FEEDBACK
  // =================================================

  const handleFeedback = () => {
    if (!aiResponse) {
      toast.error("No response available");
      return;
    }

    toast("Feedback option selected");
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
            ${
              lightTheme
                ? "text-gray-800"
                : "text-white"
            }
          `}
        >
          Smart Email Analyzer
        </h1>

        {/* PROFILE */}

        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setProfileOpen(!profileOpen)
            }
            className={`
              flex
              items-center
              gap-3
              rounded-xl
              px-2
              py-2
              transition
              ${
                lightTheme
                  ? "hover:bg-gray-50"
                  : "hover:bg-slate-800"
              }
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
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                />

                <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>
            </div>

            {/* USER INFO */}

            <div className="hidden sm:block text-left">
              <p
                className={`
                  font-semibold
                  text-base
                  ${
                    lightTheme
                      ? "text-[#172b4d]"
                      : "text-white"
                  }
                `}
              >
                {user?.name || "User"}
              </p>

              <p
                className={`
                  text-sm
                  ${
                    lightTheme
                      ? "text-gray-500"
                      : "text-slate-400"
                  }
                `}
              >
                {user?.email ||
                  "Email not available"}
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
                ${
                  profileOpen
                    ? "rotate-180"
                    : ""
                }
                ${
                  lightTheme
                    ? "text-gray-700"
                    : "text-slate-300"
                }
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
                  mb-8
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
                      <circle
                        cx="12"
                        cy="12"
                        r="4"
                      />

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
                      ${
                        lightTheme
                          ? "text-gray-900"
                          : "text-white"
                      }
                    `}
                  >
                    {lightTheme
                      ? "Light Theme"
                      : "Dark Theme"}
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
                ${
                  lightTheme
                    ? "text-gray-900"
                    : "text-white"
                }
              `}
            >
              Enter your E-mail
            </h2>

            <span
              className={`
                text-sm
                font-medium
                ${
                  lightTheme
                    ? "text-gray-700"
                    : "text-slate-300"
                }
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
                onChange={(e) =>
                  setEmail(e.target.value)
                }
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
                        e.target.files?.[0] ||
                          null
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
                        e.target.files?.[0] ||
                          null
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
                        e.target.files?.[0] ||
                          null
                      )
                    }
                  />
                </label>
              </div>

              {/* ================================================= */}
              {/* ANALYSIS INFO */}
              {/* ================================================= */}

              <div className="grid grid-cols-2 gap-5 mt-12">

                {/* LEFT */}

                <div className="space-y-5">

                  {/* MULTI INTENT */}

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
                      multiIntent !==
                        undefined &&
                      multiIntent !== ""
                        ? String(multiIntent)
                        : "—"}
                    </strong>
                  </p>

                  {/* MULTI LINGUAL */}

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
                      multiLingual !==
                        undefined &&
                      multiLingual !== ""
                        ? String(multiLingual)
                        : "—"}
                    </strong>
                  </p>

                </div>

                {/* RIGHT */}

                <div className="space-y-5">

                  {/* SENTIMENT */}

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
                      sentiment !==
                        undefined &&
                      sentiment !== ""
                        ? String(sentiment)
                        : "—"}
                    </strong>
                  </p>

                  {/* TIME */}

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

          {/* ================================================= */}
          {/* BUTTONS */}
          {/* ================================================= */}

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
              <span className="text-lg">
                ↻
              </span>

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
              {loading
                ? "Generating..."
                : "Generate"}
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
                ${
                  lightTheme
                    ? "text-gray-900"
                    : "text-white"
                }
              `}
            >
              AI Response
            </h2>

            <div className="flex items-center gap-6">

              {/* FEEDBACK */}

              <button
                type="button"
                onClick={handleFeedback}
                disabled={!aiResponse}
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
                Didn't like the response?
              </button>

              {/* COPY */}

              <button
                type="button"
                onClick={handleCopy}
                disabled={!aiResponse}
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
                      <p className="mb-4">
                        {children}
                      </p>
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
                      <li className="mb-2">
                        {children}
                      </li>
                    ),
                  }}
                >
                  {aiResponse}
                </ReactMarkdown>
              </div>
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

          {/* ================================================= */}
          {/* BOTTOM SECTION */}
          {/* ================================================= */}

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
            {/* TIME */}

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

            {/* APPROVE */}

            <button
              type="button"
              onClick={handleApprove}
              onClick={handleReset}
              disabled={!aiResponse || approved}
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
    </div>
  );
}

export default EmailAnalyzer;