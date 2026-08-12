import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/aiHorizon.png";
import { useState } from "react";
import { registerUser } from "../api/authApi";
import toast from "react-hot-toast";

function Signup() {
  const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const handleSignup = async() => {
  try {
    if(!formData.name || !formData.email || !formData.password || !formData.confirmPassword ){
      toast.error("Please fill all fields");
      return;
    }
    if(formData.password !== formData.confirmPassword){
      toast.error("password do not match");
      return;
    }
    const result = await registerUser(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword
    );
    console.log("Signup response ", result);
    if(result.success){
      toast.success(result.message);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    }else{
      toast.error(result.message);
    }
  } catch (error) {
    console.log("Signup error ", error);
    toast.error(
      error.response?.data?.message || "Signup failed"
    );
  }
};
  return (
    // Outer Div
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section */}
      <div className="w-full lg:w-1/2 min-h-screen bg-[#f4f7fb] flex items-center justify-center">
        <img src={logo} alt="AI Horizon" className="w-64 md:w-72" />
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 min-h-screen bg-white flex items-center justify-center">
        {/* Form Container */}
        <div className="w-full max-w-md px-10">
          {/* Heading */}
          <h1 className="text-4xl font-semibold text-center text-[#1f2937] mb-10">
            Create Account
          </h1>

          {/* Full Name */}
          <div className="mb-5">
            <label className="block text-base font-medium text-[#1f2937] mb-2">
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
              className="
                w-full
                h-14
                px-5
                rounded-2xl
                bg-[#f4f7fb]
                border-none
                outline-none
                text-sm
                text-[#1f2937]
                placeholder:text-gray-400
                focus:ring-2
                focus:ring-blue-500/20
              "
            />
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-base font-medium text-[#1f2937] mb-2">
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
              className="
                w-full
                h-14
                px-5
                rounded-2xl
                bg-[#f4f7fb]
                border-none
                outline-none
                text-sm
                text-[#1f2937]
                placeholder:text-gray-400
                focus:ring-2
                focus:ring-blue-500/20
              "
            />
          </div>

          {/* Password */}
          <div className="mb-7">
            <label className="block text-base font-medium text-[#1f2937] mb-2">
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
              className="
                w-full
                h-14
                px-5
                rounded-2xl
                bg-[#f4f7fb]
                border-none
                outline-none
                text-sm
                text-[#1f2937]
                placeholder:text-gray-400
                focus:ring-2
                focus:ring-blue-500/20
              "
            />
          </div>
          <div className="mb-7">
            <label className="block text-base font-medium text-[#1f2937] mb-2">
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
              className="
                w-full
                h-14
                px-5
                rounded-2xl
                bg-[#f4f7fb]
                border-none
                outline-none
                text-sm
                text-[#1f2937]
                placeholder:text-gray-400
                focus:ring-2
                focus:ring-blue-500/20
              "
            />
          </div>

          {/* Create Account Button */}
          <button
            type="button"
            onClick={handleSignup}
            className="
    w-full
    h-14
    rounded-2xl
    bg-blue-600
    text-white
    font-medium
    hover:bg-blue-700
    transition-all
    active:scale-[0.99]
  "
          >
            Create Account
          </button>

          {/* Login Link */}
          <p className="text-center mt-6 text-sm text-gray-500">
            Already have an Account?{" "}
            <Link
              to="/login"
              className="
                ml-2
                text-blue-500
                hover:text-blue-600
                font-medium
                underline
                underline-offset-2
              "
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
