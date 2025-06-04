/** @jsxImportSource https://esm.sh/react@18.2.0 */
import React, { useState } from "https://esm.sh/react@18.2.0?deps=react@18.2.0";
import type { User, AuthRequest } from "../../shared/types.ts";

interface AuthProps {
  onLogin: (user: User) => void;
  error: string;
  setError: (error: string) => void;
}

export default function Auth({ onLogin, error, setError }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    
    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (!isLogin) {
      if (!formData.email.trim()) {
        setError("Email is required");
        return false;
      }
      
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError("Please enter a valid email address");
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const requestData: AuthRequest = {
        username: formData.username.trim(),
        password: formData.password
      };

      if (!isLogin) {
        requestData.email = formData.email.trim();
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data.success && data.user) {
        onLogin(data.user);
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: ""
        });
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="form-container fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="logo-icon mx-auto mb-4" style={{ width: "4rem", height: "4rem", fontSize: "2rem" }}>
            ✅
          </div>
          <h1 className="form-title">
            {isLogin ? "Welcome Back!" : "Join TaskFlow"}
          </h1>
          <p className="text-gray-600">
            {isLogin 
              ? "Sign in to manage your tasks" 
              : "Create an account to get started"
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error slide-in">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              👤 Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Email (Register only) */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                📧 Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>
          )}

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              🔒 Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Confirm Password (Register only) */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                🔒 Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
            style={{ justifyContent: "center" }}
          >
            {loading ? (
              <>
                <div style={{ 
                  width: "1rem", 
                  height: "1rem", 
                  border: "2px solid transparent", 
                  borderTop: "2px solid white", 
                  borderRadius: "50%", 
                  animation: "spin 1s linear infinite" 
                }}></div>
                Processing...
              </>
            ) : (
              <>
                {isLogin ? "🚀 Sign In" : "✨ Create Account"}
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            type="button"
            onClick={toggleMode}
            className="btn btn-outline mt-2"
            style={{ justifyContent: "center" }}
          >
            {isLogin ? "Create Account" : "Sign In"}
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-center text-gray-700 font-semibold mb-4">
            ✨ What you'll get:
          </h3>
          <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>Beautiful task management interface</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500">🎯</span>
              <span>Priority-based task organization</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-500">🔒</span>
              <span>Secure personal task storage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}