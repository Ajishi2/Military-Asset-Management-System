"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext.js"
import { Shield, LogIn, Loader2, ChevronRight } from "lucide-react"

const Login = () => {
  const navigate = useNavigate()
  const { login, loading, user } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Add the "loaded" class to the body to trigger fade-in
    document.body.classList.add("loaded")

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

/* Clean cross pattern background */
.bg-cross-pattern {
  background-color: #f8fafc;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cg fill='%23e2e8f0' fillOpacity='0.4'%3E%3Cpolygon fillRule='evenodd' points='8 4 12 6 8 8 6 12 4 8 0 6 4 4 6 0 8 4'/%3E%3C/g%3E%3C/svg%3E");
}

/* Custom checkbox */
.custom-checkbox {
  display: flex;
  align-items: center;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 18px;
  width: 18px;
  background-color: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  transition: all 0.2s;
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: #3d6798;
  border-color: #3d6798;
}

.checkmark-icon {
  display: none;
  color: white;
}

.custom-checkbox input:checked ~ .checkmark .checkmark-icon {
  display: block;
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

.input-with-icon input {
  padding-left: 40px !important;
}

/* Divider */
.simple-divider {
  width: 100%;
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.simple-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e5e7eb;
  z-index: 0;
}

.simple-divider .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #3d6798;
  display: inline-block;
  position: relative;
  z-index: 1;
}

/* Shield icon */
.shield-icon-container {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shield-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #3d6798;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  border: 5px solid white;
}

/* Card */
.login-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 24px;
  position: relative;
  margin-top: 50px;
}

/* Form elements */
.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  background-color: white;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3d6798;
  box-shadow: 0 0 0 3px rgba(61, 103, 152, 0.1);
}

/* Button */
.primary-button {
  width: 100%;
  padding: 10px 16px;
  background-color: #6b7db3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.primary-button:hover {
  background-color: #5a6b9a;
}

.primary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Secondary button */
.secondary-button {
  width: 100%;
  padding: 10px 16px;
  background-color: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.secondary-button:hover {
  background-color: #f9fafb;
}

/* Divider with text */
.text-divider {
  width: 100%;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
  line-height: 0.1em;
  margin: 24px 0;
}

.text-divider span {
  background: white;
  padding: 0 10px;
  color: #6b7280;
  font-size: 14px;
}

/* Error alert */
.error-alert {
  background-color: #fee2e2;
  border: 1px solid #f87171;
  border-radius: 6px;
  padding: 12px;
  color: #b91c1c;
  margin-bottom: 16px;
  animation: slideUp 0.3s ease-out forwards;
}

/* Spinner animation */
.spinner {
  animation: spin 1s linear infinite;
}

/* IMPORTANT: Override the body fade out */
body {
  opacity: 1 !important; 
  transition: none !important;
}
`

    // Create an ID for the style element to avoid duplicates
    style.id = "login-styles"

    // Remove any existing login styles to prevent duplicates
    const existingStyle = document.getElementById("login-styles")
    if (existingStyle) {
      document.head.removeChild(existingStyle)
    }

    document.head.appendChild(style)

    return () => {
      // Only remove if it still exists
      const styleToRemove = document.getElementById("login-styles")
      if (styleToRemove && document.head.contains(styleToRemove)) {
        document.head.removeChild(styleToRemove)
      }
      // Don't remove the "loaded" class on unmount as it might affect other components
    }
  }, [])

  // Check for redirects based on auth state but don't automatically redirect
  useEffect(() => {
    // Just log user state without redirecting
    if (user) {
      console.log("User is already logged in:", user)
      // We're not redirecting automatically to prevent the component from disappearing
    }
  }, [user])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default form submission behavior
    if (e) e.preventDefault();

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting login with username:', username);
      await login(username, password);
      console.log('Login successful, navigating to dashboard');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      
      // Use type assertion or check to handle unknown error type
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as any).message);
      } else if (typeof err === 'object' && err !== null) {
        // For axios errors or other object errors without a message property
        if ('response' in err && err.response && typeof err.response === 'object') {
          const response = err.response as any;
          if (response.status === 500) {
            setError('Server error. Please try again later or contact support.');
          } else if (response.data && response.data.message) {
            setError(response.data.message);
          } else {
            setError(`Error ${response.status}: ${response.statusText || 'Unknown error'}`);
          }
        } else {
          setError('Connection error. Please check your internet connection.');
        }
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Show loading spinner when auth context is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-navy-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cross-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="login-card">
          {/* Shield icon */}
          <div className="shield-icon-container">
            <div className="shield-icon">
              <Shield size={40} className="text-white" />
            </div>
          </div>

          <div className="pt-12 pb-4">
            <h1 className="text-2xl font-bold text-center text-slate-800">Military Asset Management</h1>
            <p className="text-center text-slate-600 mt-2">Sign in to access the system</p>

            {/* Simple dot divider */}
            <div className="simple-divider">
              <div className="dot"></div>
            </div>
          </div>

          {error && (
            <div className="error-alert">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-slate-600 hover:text-slate-800"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Remember me checkbox */}
            <div className="custom-checkbox">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span className="checkmark">
                  <svg
                    className="checkmark-icon"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span className="text-sm text-slate-700">Remember me</span>
              </label>
            </div>

            <button type="submit" disabled={!username || !password || isLoading} className="primary-button mt-2">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="text-divider mt-6">
            <span>New to the system?</span>
          </div>

          <button type="button" onClick={() => navigate("/register")} className="secondary-button mt-4">
            <span>Create an account</span>
            <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
