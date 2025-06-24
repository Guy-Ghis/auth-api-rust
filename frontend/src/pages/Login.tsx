import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../api";
import type { Role } from '../api'

function getDecodedToken(token: string): { role: Role, exp: number } | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { role: payload.role, exp: payload.exp };
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
      const tokenData = getDecodedToken(res.token);

      if (tokenData) {
        sessionStorage.setItem("token", res.token);
        sessionStorage.setItem("token_expiry", (tokenData.exp * 1000).toString());

        setTimeout(() => {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("token_expiry");
          navigate("/login");
        }, tokenData.exp * 1000 - Date.now());

        if (tokenData.role === 'Admin') {
          navigate("/admin");
        } else {
          navigate("/profile");
        }
      } else {
        setError("Invalid token received");
      }
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h2 className="form-title">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="form-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
} 