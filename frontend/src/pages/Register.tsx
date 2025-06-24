import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await AuthService.register({ email, first_name: firstName, last_name: lastName, password });
      setSuccess("Registration successful! You can now log in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      setError("Registration failed. Please check your input.");
    }
  };

  return (
    <div className="flex items-center justify-center mt-16">
      <div className="w-full max-w-md p-8 space-y-6 bg-secondary rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-light-text">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-bold text-dark-text">First Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 text-light-text bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-bold text-dark-text">Last Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 text-light-text bg-primary border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
          </div>
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
          {success && <div className="text-green-400 text-center">{success}</div>}
          <button type="submit" className="w-full py-2 px-4 bg-highlight text-primary font-bold rounded-lg hover:bg-teal-400 transition-colors duration-300">Register</button>
        </form>
      </div>
    </div>
  );
} 