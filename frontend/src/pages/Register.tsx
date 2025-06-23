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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">First Name</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Last Name</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Register</button>
      </form>
    </div>
  );
} 