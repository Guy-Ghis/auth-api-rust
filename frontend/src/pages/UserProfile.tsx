import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProtectedService, OpenAPI } from "../api";
import type { User } from "../api";

function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = sessionStorage.getItem("token");
      const expiry = token ? getTokenExpiry(token) : null;
      if (!token || !expiry || expiry < Date.now()) {
        setError("Session expired. Please login again.");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }
      OpenAPI.TOKEN = token;
      try {
        // Call the /profile endpoint
        const userData = await ProtectedService.profileRoute();
        setUser(userData);
      } catch {
        setError("Failed to fetch profile. Please login again.");
        setTimeout(() => navigate("/login"), 1500);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (error) return <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-red-600">{error}</div>;
  if (!user) return <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">User Profile</h2>
      <div className="space-y-2">
        <div><b>Email:</b> {user.email}</div>
        <div><b>First Name:</b> {user.first_name}</div>
        <div><b>Last Name:</b> {user.last_name}</div>
        <div><b>Role:</b> {user.role}</div>
      </div>
    </div>
  );
} 