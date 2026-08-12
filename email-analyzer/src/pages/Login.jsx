import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/aiHorizon.png";
import { useState } from "react";
import { loginUser } from "../api/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      if (!formData.email || !formData.password) {
        toast.error("Please fill all fields");
        return;
      }
      const result = await loginUser(formData.email, formData.password);
      console.log("Login response", result);
      if (result.success) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.data));
        toast.success(result.message);
        navigate("/analyzer")

        console.log("token saved", localStorage.getItem("token"));
        
        console.log("User saved:", result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log("Login error ", error);
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#eef3f9] flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2 min-h-screen bg-[#f4f7fb] flex items-center justify-center">
        <img src={logo} alt="AI Horizon" className="w-64 md:w-72" />
      </div>

      <div className="w-full lg:w-1/2 min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-md px-6 md:px-10">
          <h1 className="text-4xl font-semibold text-center text-[#1f2937] mb-10">
            Login
          </h1>

          <div className="mb-6">
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

          <div className="mb-7">
            <label className="block text-base font-medium text-[#1f2937] mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
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

          <button
            type="button"
            onClick={handleLogin}
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
            Login
          </button>

          <p className="text-center mt-6 text-sm text-gray-500">
            Don't have an Account?{" "}
            <Link
              to="/signup"
              className="
                ml-2
                text-blue-500
                hover:text-blue-600
                font-medium
                underline
                underline-offset-2
              "
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
