"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext.js"
import Card from "../components/ui/Card.js"
import Button from "../components/ui/Button.js"
import { Shield, UserPlus, Loader2, ArrowLeft, Check, X } from "lucide-react"

const Register = () => {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    role_id: "3", // Default to logistics officer (3)
  })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    setMounted(true)
    // Add the custom styles to the document
    const style = document.createElement("style")
    style.textContent = `
      /* Animations */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      /* Grid background pattern */
      .bg-grid-pattern {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.05'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      }
      
      /* Blur elements */
      .blur-circle {
        position: absolute;
        border-radius: 100%;
        filter: blur(40px);
        z-index: -1;
        opacity: 0.3;
      }
      
      /* Input with icon */
      .input-with-icon {
        position: relative;
      }
      
      .input-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #6b7280;
      }
      
      .input-with-icon input, .input-with-icon select {
        padding-left: 40px !important;
      }
      
      /* Gradient divider */
      .gradient-divider {
        display: flex;
        align-items: center;
        margin: 16px 0;
      }
      
      .gradient-divider .line {
        flex-grow: 1;
        height: 1px;
        background: linear-gradient(to right, transparent, rgba(61, 103, 152, 0.3), transparent);
      }
      
      .gradient-divider .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #3d6798;
        margin: 0 8px;
      }
      
      /* Security badge */
      .security-badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 12px;
        background-color: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(4px);
        border-radius: 9999px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(209, 213, 219, 0.5);
        margin-top: 24px;
        animation: fadeIn 0.5s ease-in-out forwards;
        animation-delay: 0.8s;
        opacity: 0;
      }
      
      .security-badge svg {
        color: #10b981;
        margin-right: 6px;
      }
      
      .security-badge span {
        font-size: 12px;
        font-weight: 500;
        color: #4b5563;
      }
      
      /* Floating icon */
      .floating-icon {
        position: absolute;
        top: -48px;
        left: 50%;
        transform: translateX(-50%);
        width: 96px;
        height: 96px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: linear-gradient(to bottom right, #3d6798, #2d4e7a);
        box-shadow: 0 10px 25px -5px rgba(45, 78, 122, 0.5);
        border: 4px solid white;
        z-index: 10;
        animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        animation-delay: 0.2s;
        opacity: 0;
      }
      
      .floating-icon::before {
        content: '';
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        background: rgba(61, 103, 152, 0.2);
        filter: blur(15px);
        z-index: -1;
      }
      
      /* Enhanced card */
      .enhanced-card {
        background-color: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(209, 213, 219, 0.5);
        box-shadow: 
          0 10px 15px -3px rgba(0, 0, 0, 0.1),
          0 4px 6px -2px rgba(0, 0, 0, 0.05),
          0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        border-radius: 8px;
        overflow: hidden;
      }
      
      /* Enhanced button */
      .enhanced-button {
        background: linear-gradient(to right, #3d6798, #2d4e7a);
        border: none;
        height: 44px;
        transition: all 0.3s;
        box-shadow: 0 4px 6px -1px rgba(45, 78, 122, 0.2);
      }
      
      .enhanced-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 10px -1px rgba(45, 78, 122, 0.3);
        background: linear-gradient(to right, #2d4e7a, #1e355c);
      }
      
      .enhanced-button:active:not(:disabled) {
        transform: translateY(0);
      }
      
      .enhanced-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      
      /* Enhanced input */
      .enhanced-input {
        background-color: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(4px);
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 10px 12px;
        transition: all 0.2s;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }
      
      .enhanced-input:focus {
        outline: none;
        border-color: #3d6798;
        box-shadow: 0 0 0 3px rgba(61, 103, 152, 0.2);
      }
      
      /* Link button */
      .link-button {
        display: inline-flex;
        align-items: center;
        color: #3d6798;
        font-weight: 500;
        transition: color 0.2s;
      }
      
      .link-button:hover {
        color: #2d4e7a;
      }
      
      .link-button svg {
        margin-right: 4px;
        transition: transform 0.2s;
      }
      
      .link-button:hover svg {
        transform: translateX(-2px);
      }
      
      /* Error alert */
      .error-alert {
        background-color: rgba(254, 226, 226, 0.8);
        backdrop-filter: blur(4px);
        border: 1px solid #f87171;
        border-radius: 6px;
        padding: 12px;
        color: #b91c1c;
        margin-bottom: 16px;
        animation: slideUp 0.3s ease-out forwards;
      }
      
      /* Main container animation */
      .main-container {
        animation: slideUp 0.5s ease-out forwards;
      }
      
      /* Form elements animation */
      .form-element {
        opacity: 0;
        animation: fadeIn 0.5s ease-out forwards;
      }
      
      .form-element:nth-child(1) { animation-delay: 0.3s; }
      .form-element:nth-child(2) { animation-delay: 0.4s; }
      .form-element:nth-child(3) { animation-delay: 0.5s; }
      .form-element:nth-child(4) { animation-delay: 0.6s; }
      .form-element:nth-child(5) { animation-delay: 0.7s; }
      
      /* Spinner animation */
      .spinner {
        animation: spin 1s linear infinite;
      }
      
      /* Password strength meter */
      .password-strength-meter {
        width: 100%;
        height: 6px;
        background-color: #e5e7eb;
        border-radius: 9999px;
        overflow: hidden;
        margin-top: 4px;
      }
      
      .password-strength-meter-bar {
        height: 100%;
        border-radius: 9999px;
        transition: width 0.3s ease, background-color 0.3s ease;
      }
      
      .password-strength-weak {
        background-color: #ef4444;
      }
      
      .password-strength-medium {
        background-color: #f59e0b;
      }
      
      .password-strength-strong {
        background-color: #10b981;
      }
      
      /* Password requirements */
      .password-requirements {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px 8px;
        margin-top: 8px;
      }
      
      .requirement-item {
        display: flex;
        align-items: center;
        font-size: 12px;
      }
      
      .requirement-item svg {
        margin-right: 4px;
        flex-shrink: 0;
      }
      
      .requirement-met {
        color: #374151;
      }
      
      .requirement-unmet {
        color: #9ca3af;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    // Simple password strength calculator
    const calculateStrength = (password) => {
      if (!password) return 0

      let strength = 0
      // Length check
      if (password.length >= 8) strength += 1
      // Contains uppercase
      if (/[A-Z]/.test(password)) strength += 1
      // Contains lowercase
      if (/[a-z]/.test(password)) strength += 1
      // Contains number
      if (/[0-9]/.test(password)) strength += 1
      // Contains special char
      if (/[^A-Za-z0-9]/.test(password)) strength += 1

      return strength
    }

    setPasswordStrength(calculateStrength(formData.password))
  }, [formData.password])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await signup(formData)
      navigate("/login")
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = () => {
    return (
      formData.username.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.full_name.trim() !== "" &&
      passwordStrength >= 3
    )
  }

  const getPasswordStrengthText = () => {
    if (!formData.password) return ""
    if (passwordStrength <= 1) return "Weak"
    if (passwordStrength <= 3) return "Moderate"
    return "Strong"
  }

  const getPasswordStrengthClass = () => {
    if (!formData.password) return ""
    if (passwordStrength <= 1) return "password-strength-weak"
    if (passwordStrength <= 3) return "password-strength-medium"
    return "password-strength-strong"
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern and decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
      <div className="blur-circle bg-navy-500/10 w-32 h-32 top-20 left-10"></div>
      <div className="blur-circle bg-navy-600/10 w-40 h-40 bottom-20 right-10"></div>
      <div className="blur-circle bg-navy-400/10 w-24 h-24 top-1/3 right-1/4"></div>
      <div className="blur-circle bg-navy-300/10 w-36 h-36 bottom-1/3 left-1/4"></div>

      {/* Main content */}
      <div className="w-full max-w-md z-10 main-container">
        <Card className="enhanced-card max-w-md w-full p-6 relative">
          {/* Floating icon */}
          <div className="floating-icon">
            <Shield size={40} className="text-white" />
          </div>

          <div className="text-center mb-6 pt-10">
            <h1 className="text-2xl font-bold text-navy-800 mt-4">Military Asset Management</h1>
            <p className="text-gray-600 mt-2">Create your account</p>

            {/* Decorative divider */}
            <div className="gradient-divider mt-4">
              <div className="line"></div>
              <div className="dot"></div>
              <div className="line"></div>
            </div>
          </div>

          <form onSubmit={handleRegister}>
            {error && (
              <div className="error-alert">
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Username Input */}
              <div className="space-y-2 form-element">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="username">
                  Username
                </label>
                <div className="input-with-icon">
                  <div className="input-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="enhanced-input shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2 form-element">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                  Email
                </label>
                <div className="input-with-icon">
                  <div className="input-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="enhanced-input shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              </div>

              {/* Full Name Input */}
              <div className="space-y-2 form-element">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="full_name">
                  Full Name
                </label>
                <div className="input-with-icon">
                  <div className="input-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="enhanced-input shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2 form-element">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
                  Password
                </label>
                <div className="input-with-icon">
                  <div className="input-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="enhanced-input shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700">Password strength:</span>
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength <= 1
                            ? "text-red-600"
                            : passwordStrength <= 3
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="password-strength-meter">
                      <div
                        className={`password-strength-meter-bar ${getPasswordStrengthClass()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>

                    {/* Password requirements */}
                    <div className="password-requirements">
                      <div
                        className={`requirement-item ${/[A-Z]/.test(formData.password) ? "requirement-met" : "requirement-unmet"}`}
                      >
                        {/[A-Z]/.test(formData.password) ? (
                          <Check size={12} className="text-green-500" />
                        ) : (
                          <X size={12} className="text-gray-400" />
                        )}
                        <span>Uppercase letter</span>
                      </div>
                      <div
                        className={`requirement-item ${/[a-z]/.test(formData.password) ? "requirement-met" : "requirement-unmet"}`}
                      >
                        {/[a-z]/.test(formData.password) ? (
                          <Check size={12} className="text-green-500" />
                        ) : (
                          <X size={12} className="text-gray-400" />
                        )}
                        <span>Lowercase letter</span>
                      </div>
                      <div
                        className={`requirement-item ${/[0-9]/.test(formData.password) ? "requirement-met" : "requirement-unmet"}`}
                      >
                        {/[0-9]/.test(formData.password) ? (
                          <Check size={12} className="text-green-500" />
                        ) : (
                          <X size={12} className="text-gray-400" />
                        )}
                        <span>Number</span>
                      </div>
                      <div
                        className={`requirement-item ${/[^A-Za-z0-9]/.test(formData.password) ? "requirement-met" : "requirement-unmet"}`}
                      >
                        {/[^A-Za-z0-9]/.test(formData.password) ? (
                          <Check size={12} className="text-green-500" />
                        ) : (
                          <X size={12} className="text-gray-400" />
                        )}
                        <span>Special character</span>
                      </div>
                      <div
                        className={`requirement-item ${formData.password.length >= 8 ? "requirement-met" : "requirement-unmet"}`}
                      >
                        {formData.password.length >= 8 ? (
                          <Check size={12} className="text-green-500" />
                        ) : (
                          <X size={12} className="text-gray-400" />
                        )}
                        <span>8+ characters</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Role Select */}
              <div className="space-y-2 form-element">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="role_id">
                  Role
                </label>
                <div className="input-with-icon">
                  <div className="input-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <select
                    id="role_id"
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleInputChange}
                    className="enhanced-input shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="1">Admin</option>
                    <option value="2">Base Commander</option>
                    <option value="3">Logistics Officer</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 form-element">
                <Button
                  variant="primary"
                  fullWidth
                  type="submit"
                  disabled={!isFormValid() || isLoading}
                  icon={isLoading ? <Loader2 size={16} className="spinner" /> : <UserPlus size={16} />}
                  className="enhanced-button"
                >
                  {isLoading ? "Creating account..." : "Register"}
                </Button>

                <div className="mt-6 text-center">
                  <button type="button" onClick={() => navigate("/login")} className="link-button">
                    <ArrowLeft size={16} />
                    Back to login
                  </button>
                </div>
              </div>
            </div>
          </form>
        </Card>

        {/* Security badge */}
        <div className="flex justify-center">
          <div className="security-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 12L11 14L15 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Secure Registration</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
