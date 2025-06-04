/** @jsxImportSource https://esm.sh/react@18.2.0 */
import React, { useState, useEffect } from "https://esm.sh/react@18.2.0?deps=react@18.2.0";
import type { User } from "../../shared/types.ts";
import Auth from "./Auth.tsx";
import TaskManager from "./TaskManager.tsx";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Check if user is already authenticated
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setError("");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          gap: "1rem", 
          padding: "4rem" 
        }}>
          <div style={{ 
            width: "3rem", 
            height: "3rem", 
            border: "3px solid #e2e8f0", 
            borderTop: "3px solid #2563eb", 
            borderRadius: "50%", 
            animation: "spin 1s linear infinite" 
          }}></div>
          <p style={{ color: "#64748b", fontWeight: "500" }}>Loading TaskFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {user ? (
        <TaskManager user={user} onLogout={handleLogout} />
      ) : (
        <Auth onLogin={handleLogin} error={error} setError={setError} />
      )}
    </div>
  );
}