import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../api";

function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await AuthService.login({ email, password });
      // Store token and expiry in sessionStorage
      sessionStorage.setItem("token", res.token);
      const expiry = getTokenExpiry(res.token);
      if (expiry) sessionStorage.setItem("token_expiry", expiry.toString());
      // Set auto-logout timer
      if (expiry) {
        setTimeout(() => {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("token_expiry");
          navigate("/login");
        }, expiry - Date.now());
      }
      // Redirect based on role
      // For now, redirect all users to profile since we don't have an admin page
      navigate("/profile");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center mt-16">
      <div className="w-full max-w-md p-8 space-y-6 bg-secondary rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-light-text">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-bold text-dark-text">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 text-light-text bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-bold text-dark-text">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 text-light-text bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-400 text-center">{error}</div>}
          <button type="submit" className="w-full py-2 px-4 bg-highlight text-primary font-bold rounded-lg hover:bg-teal-400 transition-colors duration-300">Login</button>
        </form>
      </div>
    </div>
  );
} 